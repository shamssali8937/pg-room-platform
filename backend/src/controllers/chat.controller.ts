import { Request, Response, NextFunction } from "express";
import * as service from "../services/chat.service.js";

export const getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.getConversationsService(req.user!.id, req.user!.role);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.getMessagesService(req.user!.id, req.params.id as string);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const createConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { roomId, ownerId } = req.body;
        const data = await service.createConversationService(req.user!.id, roomId, ownerId);
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { conversationId, messageBody } = req.body;
        const data = await service.sendMessageService(req.user!.id, conversationId, messageBody);
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
};

export const blockConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.blockConversationService(req.user!.id, req.params.id as string);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};
