import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

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

    console.log("CSRF Debug - Headers:", req.headers);
    console.log("CSRF Debug - Cookies:", req.cookies);

    const cookieToken = req.cookies?._csrf;
    const headerToken = req.headers["x-csrf-token"];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        console.error("CSRF Validation Failed:", { cookieToken, headerToken });
        res.status(403).json({ 
            success: false, 
            code: "FORBIDDEN", 
            message: "Invalid CSRF token" 
        });
        return;
    }

    next();
};
