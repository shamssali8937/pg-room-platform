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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const data = await adminService.getUsersService(page, limit);
        res.json({ success: true, ...data });
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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const data = await adminService.getReportsService(page, limit);
        res.json({ success: true, ...data });
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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const data = await adminService.getAdminPointsTransactionsService(page, limit);
        res.json({ success: true, ...data });
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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const data = await adminService.getAuditActionsService(page, limit);
        res.json({ success: true, ...data });
    } catch (error) { next(error); }
};

export const getInquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const data = await adminService.getInquiriesService(page, limit);
        res.json({ success: true, ...data });
    } catch (error) { next(error); }
};

export const updateInquiryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { status, notes } = req.body;
        const data = await adminService.moderateInquiryService(req.user!.id, id, status, notes);
        logger.info("Inquiry moderated by admin", { bookingId: id, status, adminId: req.user!.id, requestId: req.requestId });
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { status, reason } = req.body;
        const data = await adminService.verifyUserService(req.user!.id, id, status, reason);
        logger.info("User verification status updated by admin", { targetUserId: id, status, adminId: req.user!.id, requestId: req.requestId });
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const data = await adminService.getReviewsService(page, limit);
        res.json({ success: true, ...data });
    } catch (error) { next(error); }
};

export const moderateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { moderationStatus } = req.body;
        const data = await adminService.moderateReviewService(req.user!.id, id, moderationStatus);
        logger.info("Review moderated", { reviewId: id, status: moderationStatus, adminId: req.user!.id, requestId: req.requestId });
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await adminService.deleteReviewService(req.user!.id, id);
        logger.info("Review deleted by admin", { reviewId: id, adminId: req.user!.id, requestId: req.requestId });
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const getReportedConversationMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await adminService.getReportedConversationMessagesService(id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

