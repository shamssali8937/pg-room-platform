import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

export const generateToken = (req: Request, res: Response) => {
    const token = crypto.randomBytes(32).toString("hex");
    const isProd = process.env.NODE_ENV === "production";
    
    // Store token in HttpOnly cookie
    res.cookie("_csrf", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
    });
    
    return token;
};

export const csrfSynchronisedProtection = (req: Request, res: Response, next: NextFunction): void => {
    // Safe methods bypass CSRF
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        next();
        return;
    }

    const cookieToken = req.cookies?._csrf;
    const headerToken = req.headers["x-csrf-token"];

    logger.info("CSRF Validation Attempt", {
        cookieTokenPresent: !!cookieToken,
        headerTokenPresent: !!headerToken,
        cookieToken,
        headerToken,
        method: req.method,
        path: req.path,
        requestId: req.requestId,
    });

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        logger.warn("CSRF Validation Failed", {
            cookieToken,
            headerToken,
            method: req.method,
            path: req.path,
            requestId: req.requestId,
        });
        res.status(403).json({ 
            success: false, 
            code: "FORBIDDEN", 
            message: "Invalid CSRF token" 
        });
        return;
    }

    next();
};
