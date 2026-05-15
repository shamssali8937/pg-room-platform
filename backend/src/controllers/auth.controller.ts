import { Request, Response, NextFunction } from "express";
import {
    signupService,
    loginService,
    sendPhoneOTPService,
    verifyPhoneOTPService,
    verifyEmailService,
} from "../services/auth.services.js";
import { addToBlacklist } from "../utils/tokenBlacklist.js";
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
        res.json({ success: true, ...data });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { token } = req.query;
        const result = await verifyEmailService(String(token));
        logger.info("Email verified", { requestId: req.requestId });
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
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
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            addToBlacklist(token);
            logger.info("User logged out — token blacklisted", {
                userId: req.user?.id,
                requestId: req.requestId,
            });
        }
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};