import { Request, Response, NextFunction } from "express";
import * as service from "../services/review.service.js";

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
