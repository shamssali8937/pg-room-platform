import { Request, Response, NextFunction } from "express";
import { getMeService, updateMeService } from "../services/user.service.js";
import { logger } from "../config/logger.js";

export const getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await getMeService(req.user!.id);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const updateMe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await updateMeService(req.user!.id, req.body, req.file);
        logger.info("User profile updated", {
            userId: req.user!.id,
            requestId: req.requestId,
        });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};