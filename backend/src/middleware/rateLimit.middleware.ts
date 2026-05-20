import rateLimit from "express-rate-limit";
import { logger } from "../config/logger.js";

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
    100,
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
