import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isBlacklisted } from "../utils/tokenBlacklist.js";
import { UnauthorizedError, ForbiddenError } from "./errorHandler.middleware.js";
import { logger } from "../config/logger.js";

const SECRET = process.env.JWT_SECRET as string;

if (!SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
}

/**
 * Verifies the Bearer JWT token on every protected route.
 * Attaches decoded user payload to req.user.
 */
export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            throw UnauthorizedError("No token provided");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw UnauthorizedError("Malformed authorization header");
        }

        if (isBlacklisted(token)) {
            logger.warn("Blacklisted token used", {
                requestId: req.requestId,
                path: req.path,
            });
            throw UnauthorizedError("Token has been revoked (logged out)");
        }

        const decoded = jwt.verify(token, SECRET) as any;
        req.user = decoded;

        next();
    } catch (err) {
        next(err);
    }
};

/**
 * Role-based access control factory.
 * Usage: authorize("admin") or authorize("admin", "owner")
 */
export const authorize = (...allowedRoles: string[]) =>
    (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(UnauthorizedError("Not authenticated"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn("Unauthorized role access attempt", {
                userId: req.user.id,
                role: req.user.role,
                required: allowedRoles,
                path: req.path,
                requestId: req.requestId,
            });
            return next(ForbiddenError(`Role '${req.user.role}' is not allowed to access this resource`));
        }

        next();
    };