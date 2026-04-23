import { Request, Response } from "express";
import { signupService, loginService, sendPhoneOTPService, verifyPhoneOTPService, verifyEmailService } from "../services/auth.services.js";
import { prisma } from "../config/prisma.js";
import { addToBlacklist } from "../utils/tokenBlacklist.js";

export const signup = async (req: Request, res: Response) => {
    try {
        const user = await signupService(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const data = await loginService(email, password);

        res.json(data);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;

        const result = await verifyEmailService(String(token));

        res.json(result);
    } catch (error: any) {
        res.status(400).json({
            message: error.message || "Verification failed",
        });
    }
};

export const sendPhoneOTP = async (req: Request, res: Response) => {
    try {
        const { mobile_number } = req.body;

        const result = await sendPhoneOTPService(mobile_number);

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const verifyPhoneOTP = async (req: Request, res: Response) => {
    try {
        const { mobile_number, otp } = req.body;

        const result = await verifyPhoneOTPService(mobile_number, otp);

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const logout = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
        addToBlacklist(token);
    }

    res.json({ message: "Logged out successfully" });
};