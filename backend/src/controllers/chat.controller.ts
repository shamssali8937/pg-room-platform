import { Request, Response, NextFunction } from "express";
import * as service from "../services/chat.service.js";

// Normalize a raw DB message to the frontend shape
const normalizeMessage = (msg: any) => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    sender: msg.sender ?? null,
    content: msg.message_body,        // key fix: map message_body → content
    is_read: msg.read_at != null,
    created_at: msg.created_at,
});

export const getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.getConversationsService(req.user!.id, req.user!.role);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const raw = await service.getMessagesService(req.user!.id, req.params.id as string);
        res.json({ success: true, data: raw.map(normalizeMessage) });
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
        // Accept both naming conventions from frontend
        const conversationId: string = req.body.conversationId ?? req.body.conversation_id;
        const messageBody: string = req.body.messageBody ?? req.body.content ?? req.body.message_body;

        const raw = await service.sendMessageService(req.user!.id, conversationId, messageBody);
        const normalized = normalizeMessage(raw);

        // Emit via Socket.IO to all participants in real-time
        try {
            const { getIO } = await import("../config/socket.js");
            getIO().to(`conv:${conversationId}`).emit("new_message", normalized);
        } catch { /* socket not yet initialized — ignore */ }

        res.status(201).json({ success: true, data: normalized });
    } catch (error) { next(error); }
};

export const blockConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await service.blockConversationService(req.user!.id, req.params.id as string);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};
