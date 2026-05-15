import { Request, Response, NextFunction } from "express";
import * as service from "../services/owner.service.js";

export const getOwnerRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.getOwnerRoomsService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const getOwnerRoomStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.getOwnerRoomStatsService(req.user!.id, req.params.id as string);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const boostRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.boostRoomService(req.user!.id, req.params.id as string);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const featureRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.featureRoomService(req.user!.id, req.params.id as string);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const getOwnerPoints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.getOwnerPointsService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const getOwnerPointTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.getOwnerPointTransactionsService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};
