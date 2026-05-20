import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Injects a unique request ID (X-Request-ID) into every request.
 * Also exposes it as a response header so the frontend can correlate logs.
 */
export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const requestId =
        (req.headers["x-request-id"] as string) || uuidv4();

    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);

    next();
};
