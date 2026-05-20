import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";

/**
 * Centralized application error class.
 * Distinguishes operational (expected) errors from programming errors.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code: string | undefined;

    constructor(
        message: string,
        statusCode = 500,
        options: { isOperational?: boolean; code?: string } = {}
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = options.isOperational ?? true;
        this.code = options.code;

        // Maintains proper stack trace in V8
        Error.captureStackTrace(this, this.constructor);

        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// ─── Common Error Factories ──────────────────────────────────────────

export const NotFoundError = (resource = "Resource") =>
    new AppError(`${resource} not found`, 404, { code: "NOT_FOUND" });

export const UnauthorizedError = (msg = "Unauthorized") =>
    new AppError(msg, 401, { code: "UNAUTHORIZED" });

export const ForbiddenError = (msg = "Forbidden") =>
    new AppError(msg, 403, { code: "FORBIDDEN" });

export const BadRequestError = (msg: string) =>
    new AppError(msg, 400, { code: "BAD_REQUEST" });

export const ConflictError = (msg: string) =>
    new AppError(msg, 409, { code: "CONFLICT" });

// ─── Error Tracking ─────────────────────────────────────────────────

/**
 * Sends error details to a monitoring service.
 * Currently logs to Winston; swap out for Sentry / Datadog in production.
 */
const trackError = (err: Error, req?: Request): void => {
    const isOperational = err instanceof AppError && err.isOperational;

    if (isOperational) {
        logger.warn("Operational error tracked", {
            message: err.message,
            code: (err as AppError).code,
            statusCode: (err as AppError).statusCode,
            requestId: req?.requestId,
            method: req?.method,
            path: req?.path,
            userId: (req as any)?.user?.id ?? null,
        });
    } else {
        // Programming / unexpected errors — highest severity
        logger.error("💥 Unexpected error tracked", {
            message: err.message,
            stack: err.stack,
            requestId: req?.requestId,
            method: req?.method,
            path: req?.path,
            userId: (req as any)?.user?.id ?? null,
        });

        // 🔌 SENTRY HOOK — uncomment when Sentry SDK is added:
        // Sentry.captureException(err);
    }
};

// ─── Global Error Handler Middleware ────────────────────────────────

export const globalErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    trackError(err, req);

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            code: err.code ?? "ERROR",
            message: err.message,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
            requestId: req.requestId,
        });
        return;
    }

    // Prisma known request errors
    if ((err as any).code?.startsWith("P")) {
        logger.warn("Prisma error", {
            code: (err as any).code,
            meta: (err as any).meta,
            requestId: req.requestId,
        });

        res.status(400).json({
            success: false,
            code: "DB_ERROR",
            message: "Database operation failed",
            requestId: req.requestId,
        });
        return;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        res.status(401).json({
            success: false,
            code: "INVALID_TOKEN",
            message: "Invalid authentication token",
            requestId: req.requestId,
        });
        return;
    }

    if (err.name === "TokenExpiredError") {
        res.status(401).json({
            success: false,
            code: "TOKEN_EXPIRED",
            message: "Authentication token expired",
            requestId: req.requestId,
        });
        return;
    }

    // Zod validation errors
    if ((err as any).name === "ZodError") {
        res.status(422).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Input validation failed",
            errors: (err as any).errors,
            requestId: req.requestId,
        });
        return;
    }

    // Unknown / programming errors — do NOT leak internals
    res.status(500).json({
        success: false,
        code: "INTERNAL_ERROR",
        message:
            process.env.NODE_ENV === "production"
                ? "An unexpected error occurred"
                : err.message,
        requestId: req.requestId,
    });
};

// ─── Catch-all for unmatched routes ─────────────────────────────────

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, { code: "ROUTE_NOT_FOUND" }));
};
