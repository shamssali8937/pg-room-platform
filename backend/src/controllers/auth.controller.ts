import { Request, Response } from "express";
import { signupService, loginService } from "../services/auth.services.js";

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