import { Request, Response, NextFunction } from "express";
import { getOwnerDashboardStats, getAdminDashboardStats, getTenantDashboardStats } from "../services/dashboard.service.js";

export const getOwnerDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await getOwnerDashboardStats(req.user!.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await getAdminDashboardStats();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getTenantDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await getTenantDashboardStats(req.user!.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
