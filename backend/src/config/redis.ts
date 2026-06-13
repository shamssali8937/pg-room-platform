import { Redis } from "ioredis";
import { logger } from "./logger.js";

// ─── Upstash / TLS-aware Redis client ────────────────────────────────────────
// Upstash requires TLS (rediss://). ioredis honours the protocol automatically.
// For local development without Redis, set REDIS_URL="" and all cache calls
// will gracefully no-op (cache misses).

let redis: Redis | null = null;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
    redis = new Redis(REDIS_URL, {
        // Upstash enforces TLS — needed when URL scheme is rediss://
        tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
        maxRetriesPerRequest: 3,
        enableReadyCheck: false, // Upstash: skip READY check
        lazyConnect: false,
    });

    redis.on("connect", () => logger.info("Redis connected"));
    redis.on("ready", () => logger.info("Redis ready"));
    redis.on("error", (err: Error) => logger.error("Redis error", { error: err.message }));
    redis.on("close", () => logger.warn("Redis connection closed"));
} else {
    logger.warn("REDIS_URL not set — Redis caching disabled (memory fallback)");
}

export { redis };
export default redis;
