import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service.js";
import { logger } from "../config/logger.js";

export const getPendingListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await adminService.getPendingListingsService();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getAllListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await adminService.getAllListingsService(req.query.status as string);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const moderateListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status, reason } = req.body;
        const id = req.params.id as string;
        const data = await adminService.moderateListingService(req.user!.id, id, status, reason);
        logger.info("Listing moderated", { roomId: id, status, adminId: req.user!.id, requestId: req.requestId });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await adminService.getUsersService();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status, reason } = req.body;
        const id = req.params.id as string;
        const data = await adminService.updateUserStatusService(req.user!.id, id, status, reason);
        logger.info("User status updated", { targetUserId: id, status, adminId: req.user!.id, requestId: req.requestId });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await adminService.getReportsService();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const resolveReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await adminService.resolveReportService(req.user!.id, id, req.body.resolutionDetails);
        logger.info("Report resolved", { reportId: id, adminId: req.user!.id, requestId: req.requestId });
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const getPointsTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await adminService.getAdminPointsTransactionsService();
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const adjustPoints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ownerId = req.params.ownerId as string;
        const { points, reasonCode } = req.body;
        const data = await adminService.adjustPointsService(req.user!.id, ownerId, Number(points), reasonCode);
        logger.info("Points adjusted", { ownerId, points, adminId: req.user!.id, requestId: req.requestId });
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const getAuditActions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await adminService.getAuditActionsService();
        res.json({ success: true, data });
    } catch (error) { next(error); }
};
