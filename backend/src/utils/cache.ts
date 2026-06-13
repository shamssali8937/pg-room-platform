import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

/**
 * Generic Redis cache helper.
 *
 * Usage:
 *   const data = await getOrSet("rooms:list:...", 30, () => fetchFromDb());
 *
 * - If Redis is unavailable (REDIS_URL not set), `fetcher` is called every time (no caching).
 * - Errors from Redis are caught and logged — the fetcher result is returned as a fallback.
 */
export const getOrSet = async <T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
): Promise<T> => {
    if (!redis) {
        return fetcher();
    }

    try {
        const cached = await redis.get(key);
        if (cached !== null) {
            logger.debug(`Cache HIT: ${key}`);
            return JSON.parse(cached) as T;
        }
    } catch (err: any) {
        logger.error(`Cache GET error for key "${key}"`, { error: err.message });
    }

    const data = await fetcher();

    try {
        await redis.setex(key, ttlSeconds, JSON.stringify(data));
        logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (err: any) {
        logger.error(`Cache SET error for key "${key}"`, { error: err.message });
    }

    return data;
};

/**
 * Delete one or more cache keys by exact key or glob pattern.
 * Uses SCAN + DEL for pattern deletes to avoid blocking the server with KEYS.
 */
export const invalidateCache = async (keyOrPattern: string): Promise<void> => {
    if (!redis) return;

    try {
        if (keyOrPattern.includes("*")) {
            // Pattern delete via SCAN (non-blocking)
            let cursor = "0";
            do {
                const [nextCursor, keys] = await redis.scan(cursor, "MATCH", keyOrPattern, "COUNT", 100);
                cursor = nextCursor;
                if (keys.length > 0) {
                    await redis.del(...keys);
                    logger.debug(`Cache invalidated ${keys.length} keys matching: ${keyOrPattern}`);
                }
            } while (cursor !== "0");
        } else {
            await redis.del(keyOrPattern);
            logger.debug(`Cache invalidated: ${keyOrPattern}`);
        }
    } catch (err: any) {
        logger.error(`Cache invalidation error for "${keyOrPattern}"`, { error: err.message });
    }
};
