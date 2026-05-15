import { Request, Response, NextFunction } from "express";
import { perfLogger } from "../config/logger.js";

const SLOW_THRESHOLD_MS = Number(process.env.SLOW_REQUEST_THRESHOLD_MS) || 500;

/**
 * Performance monitoring middleware.
 * - Measures response time for every request.
 * - Logs slow requests (above threshold) as warnings.
 * - Logs all request durations as perf metrics.
 */
export const performanceMonitor = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        const isSlow = durationMs > SLOW_THRESHOLD_MS;

        const perfData = {
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationMs: parseFloat(durationMs.toFixed(2)),
            isSlow,
            userId: (req as any).user?.id ?? null,
            timestamp: new Date().toISOString(),
        };

        if (isSlow) {
            perfLogger.warn(`🐢 Slow request detected`, perfData);
        } else {
            perfLogger.info(`⚡ Request completed`, perfData);
        }
    });

    next();
};
