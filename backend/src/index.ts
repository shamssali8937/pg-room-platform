import app from "./app.js";
import { logger } from "./config/logger.js";
import { prisma } from "./config/prisma.js";

const PORT = Number(process.env.PORT) || 5000;

// ─── Start Server ─────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    logger.info(`🚀 Server started`, {
        port: PORT,
        env: process.env.NODE_ENV ?? "development",
        pid: process.pid,
    });
});

// ─── Graceful Shutdown ────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
    logger.warn(`⚠️  ${signal} received — initiating graceful shutdown...`);

    server.close(async () => {
        logger.info("HTTP server closed");

        try {
            await prisma.$disconnect();
            logger.info("Database connection closed");
        } catch (err) {
            logger.error("Error closing database connection", { error: err });
        }

        logger.info("✅ Shutdown complete");
        process.exit(0);
    });

    // Force-kill after 10 seconds if not done
    setTimeout(() => {
        logger.error("❌ Forced shutdown after timeout");
        process.exit(1);
    }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─── Unhandled Rejections / Exceptions ───────────────────────────

process.on("unhandledRejection", (reason: unknown) => {
    logger.error("💥 Unhandled Promise Rejection", {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
    });
    // Let the process crash — let process manager (PM2 / k8s) restart it
    process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
    logger.error("💥 Uncaught Exception", {
        message: err.message,
        stack: err.stack,
    });
    process.exit(1);
});