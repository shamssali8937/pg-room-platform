import { Request, Response } from "express";
import { getMeService, updateMeService } from "../services/user.service.js";

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await getMeService(req.user.id);
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateMe = async (req: Request, res: Response) => {
    try {
        const user = await updateMeService(req.user.id, req.body);
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};