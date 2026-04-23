import { Request, Response } from "express";
import { createRoomService, getRoomsService, getRoomByIdService, updateRoomService, deleteRoomService, saveRoomService, unsaveRoomService, getSavedRoomsService, reportRoomService, submitRoomService } from "../services/room.service.js";

export const createRoom = async (req: any, res: Response) => {
    try {
        const room = await createRoomService(
            req.user.id,
            req.body,
            req.files
        );

        res.status(201).json(room);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const getRooms = async (req: Request, res: Response) => {
    const data = await getRoomsService(req.query);
    res.json(data);
};

export const getRoomById = async (req: Request, res: Response) => {
    try {
        const data = await getRoomByIdService(req.params.id as string);
        res.json(data);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const updateRoom = async (req: Request, res: Response) => {
    try {
        const data = await updateRoomService(
            req.user.id,
            req.params.id as string,
            req.body
        );
        res.json(data);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const data = await deleteRoomService(
            req.user.id,
            req.params.id as string
        );
        res.json(data);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const saveRoom = async (req: Request, res: Response) => {
    const data = await saveRoomService(req.user.id, req.params.id as string);
    res.json(data);
};

export const unsaveRoom = async (req: Request, res: Response) => {
    await unsaveRoomService(req.user.id, req.params.id as string);
    res.json({ message: "Removed" });
};

export const getSavedRooms = async (req: Request, res: Response) => {
    const data = await getSavedRoomsService(req.user.id);
    res.json(data);
};

export const reportRoom = async (req: Request, res: Response) => {
    const data = await reportRoomService(
        req.user.id,
        req.params.id as string,
        req.body
    );
    res.json(data);
};

export const submitRoom = async (req: Request, res: Response) => {
    const data = await submitRoomService(
        req.user.id,
        req.params.id as string
    );
    res.json(data);
};