import { Request, Response, NextFunction } from "express";
import {
    signupService,
    loginService,
    sendPhoneOTPService,
    verifyPhoneOTPService,
    verifyEmailService,
    forgotPasswordService,
    resetPasswordService,
    logoutService,
    refreshTokenService,
} from "../services/auth.services.js";
import { generateToken as generateCsrf } from "../config/csrf.js";
import { logger } from "../config/logger.js";

export const signup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await signupService(req.body);
        logger.info("New user signup", {
            email: req.body.email,
            role: req.body.role,
            requestId: req.requestId,
        });
        res.status(201).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;
        const data = await loginService(email, password);
        logger.info("User logged in", {
            userId: data.user.id,
            role: data.user.role,
            requestId: req.requestId,
        });

        const isProd = process.env.NODE_ENV === "production";
        
        res.cookie("accessToken", data.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "strict" : "lax",
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie("refreshToken", data.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ success: true, user: data.user });
    } catch (error) {
        next(error);
    }
};

export const refreshSession = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) throw new Error("No refresh token");

        const data = await refreshTokenService(token);
        
        const isProd = process.env.NODE_ENV === "production";

        res.cookie("accessToken", data.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "strict" : "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", data.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ success: true, message: "Session refreshed" });
    } catch (error) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(401).json({ success: false, message: "Session expired" });
    }
};

export const getCsrfToken = (req: Request, res: Response) => {
    res.json({ csrfToken: generateCsrf(req, res) });
};

export const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    try {
        const { token } = req.query;
        await verifyEmailService(String(token));
        logger.info("Email verified", { requestId: req.requestId });
        res.redirect(`${frontendUrl}/auth/signin?verified=true`);
    } catch (error: any) {
        logger.error("Email verification failed", { error: error.message, requestId: req.requestId });
        res.redirect(`${frontendUrl}/auth/signin?error=verification_failed`);
    }
};

export const sendPhoneOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { mobile_number } = req.body;
        const result = await sendPhoneOTPService(mobile_number);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const verifyPhoneOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { mobile_number, otp } = req.body;
        const result = await verifyPhoneOTPService(mobile_number, otp);
        logger.info("Phone verified", { requestId: req.requestId });
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await logoutService(refreshToken);
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        
        logger.info("User logged out", {
            userId: req.user?.id,
            requestId: req.requestId,
        });
        
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await forgotPasswordService(req.body.email);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { token, newPassword } = req.body;
        const result = await resetPasswordService(token, newPassword);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};