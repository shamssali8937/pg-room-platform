import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

// ─── Shared Redis store for all rate limiters ─────────────────────────────────
// Falls back to in-memory if Redis is not configured (e.g. local dev with no REDIS_URL).
// Returns a partial options spread so the `store` key is simply absent (not undefined)
// when Redis is unavailable — required by exactOptionalPropertyTypes: true.
const redisStoreOptions = (prefix: string): { store: RedisStore } | Record<string, never> =>
    redis
        ? {
              store: new RedisStore({
                  // ioredis exposes .call(command, ...args) for raw commands
                  sendCommand: (command: string, ...args: string[]) =>
                      (redis as any).call(command, ...args),
                  prefix: `rl:${prefix}:`,
              }),
          }
        : {};

const createLimiter = (
    windowMs: number,
    max: number,
    message: string,
    name: string
) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,   // Returns rate limit info in RateLimit-* headers
        legacyHeaders: false,     // Disables X-RateLimit-* headers
        ...redisStoreOptions(name), // spreads { store } or {} — never undefined
        handler: (req, res) => {
            logger.warn(`Rate limit exceeded [${name}]`, {
                ip: req.ip,
                path: req.path,
                method: req.method,
                requestId: req.requestId,
            });

            res.status(429).json({
                success: false,
                code: "RATE_LIMITED",
                message,
                requestId: req.requestId,
            });
        },
    });

/**
 * Global API rate limiter — applied to all /api/* routes.
 * 100 requests per 15 minutes per IP.
 */
export const globalRateLimiter = createLimiter(
    15 * 60 * 1000, // 15 min
    process.env.NODE_ENV === "production" ? 150 : 2000,
    "Too many requests from this IP, please try again after 15 minutes.",
    "GLOBAL"
);

/**
 * Strict auth limiter — applied to /api/auth/login & /api/auth/signup.
 * 10 attempts per 15 minutes per IP.
 */
export const authRateLimiter = createLimiter(
    15 * 60 * 1000, // 15 min
    10,
    "Too many authentication attempts. Please try again after 15 minutes.",
    "AUTH"
);

/**
 * OTP limiter — applied to /api/auth/send-phone-otp.
 * 5 attempts per 10 minutes per IP.
 */
export const otpRateLimiter = createLimiter(
    10 * 60 * 1000, // 10 min
    5,
    "Too many OTP requests. Please wait 10 minutes.",
    "OTP"
);

/**
 * Chat message rate limiter — applied to POST /api/chat/messages.
 * 20 messages per minute per authenticated user (keyed by user ID, not IP).
 * Prevents spam flooding even on shared IPs.
 */
export const chatMessageRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === "production" ? 20 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    ...redisStoreOptions("CHAT_MESSAGE"), // spreads { store } or {} — never undefined
    keyGenerator: (req) => {
        // Use authenticated user ID if available — immune to IP spoofing on shared IPs.
        // Fall back to ipKeyGenerator(req.ip) to normalize IPv6 addresses correctly
        // and satisfy express-rate-limit v8's ERR_ERL_KEY_GEN_IPV6 validation.
        const userId = (req as any).user?.id;
        return userId ?? ipKeyGenerator(req.ip ?? "");
    },
    handler: (req, res) => {
        logger.warn("Chat rate limit exceeded [CHAT_MESSAGE]", {
            userId: (req as any).user?.id,
            ip: req.ip,
            requestId: req.requestId,
        });
        res.status(429).json({
            success: false,
            code: "RATE_LIMITED",
            message: "You are sending messages too quickly. Please slow down.",
            requestId: req.requestId,
        });
    },
});
