// ─── Load env FIRST ─────────────────────────────────────────────────────────
// IMPORTANT: In ESM all static imports are hoisted and evaluated before any
// module body code runs. dotenv.config() inside app.ts fires too late — by
// then redis.ts, prisma.ts, etc. have already read process.env with undefined
// values. Loading dotenv here (entry point, before any other import) ensures
// process.env is fully populated when every config module initializes.
import "dotenv/config";
import dns from "dns";

// Force Node.js to prefer IPv4 DNS resolution (prevents ENETUNREACH IPv6 errors on Render)
dns.setDefaultResultOrder("ipv4first");

import { createServer } from "http";
import app from "./app.js";
import { logger } from "./config/logger.js";
import { prisma } from "./config/prisma.js";
import { initSocket } from "./config/socket.js";
import { startExpireBookingsScheduler } from "./jobs/expireBookings.js";
import { startBookingRemindersScheduler } from "./jobs/bookingReminders.js";
import { startExpirePointsScheduler } from "./jobs/expirePoints.js";
import { startExpirePromotionsScheduler } from "./jobs/expirePromotions.js";

const PORT = Number(process.env.PORT) || 5000;

// ─── Create HTTP Server (needed for Socket.IO) ──────────────────
const server = createServer(app);

// ─── Initialize Socket.IO ────────────────────────────────────────
initSocket(server);

// ─── Start Scheduled Jobs ────────────────────────────────────────
startExpireBookingsScheduler();
startBookingRemindersScheduler();
startExpirePointsScheduler();
startExpirePromotionsScheduler();

// ─── Start Server ─────────────────────────────────────────────────
server.listen(PORT, () => {
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
    process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
    logger.error("💥 Uncaught Exception", {
        message: err.message,
        stack: err.stack,
    });
    process.exit(1);
});