import { Request, Response, NextFunction } from "express";
import * as service from "../services/report.service.js";

export const createReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.createReportService(req.user!.id, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
};

export const getMyReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.getMyReportsService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};
