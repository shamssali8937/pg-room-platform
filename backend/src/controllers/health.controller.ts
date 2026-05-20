import { Request, Response } from "express";
import os from "os";
import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

/**
 * GET /health
 * Basic readiness probe for load balancers / k8s.
 */
export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
};

/**
 * GET /health/detailed
 * Detailed system + dependency health check.
 * Protected by internal token in production.
 */
export const detailedHealthCheck = async (req: Request, res: Response): Promise<void> => {
    const startTime = process.hrtime.bigint();

    // ─── Database ping ─────────────────────────────
    let dbStatus: "ok" | "error" = "ok";
    let dbLatencyMs = 0;

    try {
        const dbStart = process.hrtime.bigint();
        await prisma.$queryRaw`SELECT 1`;
        dbLatencyMs = parseFloat(
            (Number(process.hrtime.bigint() - dbStart) / 1_000_000).toFixed(2)
        );
    } catch (err: any) {
        dbStatus = "error";
        logger.error("Health check - DB ping failed", { error: err.message });
    }

    // ─── Memory ────────────────────────────────────
    const mem = process.memoryUsage();
    const totalMemoryMB = parseFloat((os.totalmem() / 1024 / 1024).toFixed(1));
    const freeMemoryMB = parseFloat((os.freemem() / 1024 / 1024).toFixed(1));

    // ─── CPU ───────────────────────────────────────
    const cpuUsage = process.cpuUsage();

    // ─── Response time ─────────────────────────────
    const totalMs = parseFloat(
        (Number(process.hrtime.bigint() - startTime) / 1_000_000).toFixed(2)
    );

    const payload = {
        status: dbStatus === "ok" ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        uptime: {
            seconds: Math.floor(process.uptime()),
            human: formatUptime(process.uptime()),
        },
        responseTimeMs: totalMs,
        environment: process.env.NODE_ENV ?? "development",
        version: process.env.npm_package_version ?? "unknown",
        dependencies: {
            database: {
                status: dbStatus,
                latencyMs: dbLatencyMs,
            },
        },
        system: {
            platform: process.platform,
            nodeVersion: process.version,
            cpuCores: os.cpus().length,
            cpuUsageUser: cpuUsage.user,
            cpuUsageSystem: cpuUsage.system,
            memory: {
                heapUsedMB: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(1)),
                heapTotalMB: parseFloat((mem.heapTotal / 1024 / 1024).toFixed(1)),
                rssMB: parseFloat((mem.rss / 1024 / 1024).toFixed(1)),
                externalMB: parseFloat((mem.external / 1024 / 1024).toFixed(1)),
                systemTotalMB: totalMemoryMB,
                systemFreeMB: freeMemoryMB,
                systemUsedPercent: parseFloat(
                    (((totalMemoryMB - freeMemoryMB) / totalMemoryMB) * 100).toFixed(1)
                ),
            },
        },
    };

    const statusCode = payload.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(payload);
};

function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}
