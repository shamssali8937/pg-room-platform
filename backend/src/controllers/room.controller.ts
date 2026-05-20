import { Request, Response, NextFunction } from "express";
import {
    createRoomService,
    getRoomsService,
    getRoomByIdService,
    updateRoomService,
    deleteRoomService,
    saveRoomService,
    unsaveRoomService,
    getSavedRoomsService,
    reportRoomService,
    submitRoomService,
} from "../services/room.service.js";
import { logger } from "../config/logger.js";

export const createRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const room = await createRoomService(req.user!.id, req.body, req.files);
        logger.info("Room created", {
            roomId: room.id,
            ownerId: req.user!.id,
            requestId: req.requestId,
        });
        res.status(201).json({ success: true, data: room });
    } catch (error) {
        next(error);
    }
};

export const getRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const data = await getRoomsService(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getRoomById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await getRoomByIdService(id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const updateRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await updateRoomService(req.user!.id, id, req.body);
        logger.info("Room updated", {
            roomId: id,
            ownerId: req.user!.id,
            requestId: req.requestId,
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const deleteRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await deleteRoomService(req.user!.id, id);
        logger.warn("Room deleted", {
            roomId: id,
            ownerId: req.user!.id,
            requestId: req.requestId,
        });
        res.json({ success: true, ...data });
    } catch (error) {
        next(error);
    }
};

export const saveRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await saveRoomService(req.user!.id, id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const unsaveRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        await unsaveRoomService(req.user!.id, id);
        res.json({ success: true, message: "Room removed from saved list" });
    } catch (error) {
        next(error);
    }
};

export const getSavedRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const data = await getSavedRoomsService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const reportRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await reportRoomService(req.user!.id, id, req.body);
        logger.warn("Room reported", {
            roomId: id,
            reporterId: req.user!.id,
            requestId: req.requestId,
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const submitRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await submitRoomService(req.user!.id, id);
        logger.info("Room submitted for review", {
            roomId: id,
            ownerId: req.user!.id,
            requestId: req.requestId,
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};