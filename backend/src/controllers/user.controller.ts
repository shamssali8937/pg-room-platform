import { Request, Response, NextFunction } from "express";
import { getMeService, updateMeService, getMyNotificationsService, markNotificationReadService } from "../services/user.service.js";

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await getMeService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await updateMeService(req.user!.id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await getMyNotificationsService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await markNotificationReadService(req.user!.id, id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};