import { Request, Response, NextFunction } from "express";
import * as service from "../services/review.service.js";
import { prisma } from "../config/prisma.js";

export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.createReviewService(req.user!.id, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
};

export const getRoomReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.getRoomReviewsService(req.params.roomId as string);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.updateReviewService(req.user!.id, req.params.id as string, req.body);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

// Phase 4: Report a review
export const reportReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const reviewId = req.params.id as string;
        const { reason_code, description } = req.body;

        if (!reason_code) {
            res.status(400).json({ success: false, message: "reason_code is required" });
            return;
        }

        const review = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!review) {
            res.status(404).json({ success: false, message: "Review not found" });
            return;
        }

        const report = await prisma.report.create({
            data: {
                reporter_id: req.user!.id,
                target_type: "review",
                target_id: reviewId,
                reason_code,
                description: description ?? null,
                status: "pending",
            }
        });

        res.status(201).json({ success: true, data: report, message: "Review reported successfully" });
    } catch (error) { next(error); }
};
