import { Request, Response, NextFunction } from "express";
import * as service from "../services/chat.service.js";
import { uploadToCloudinary } from "../utils/upload.js";
import { prisma } from "../config/prisma.js";

// Normalize socket emit payload helper
const emitSocketEvent = async (roomName: string, eventName: string, payload: any) => {
    try {
        const { getIO } = await import("../config/socket.js");
        getIO().to(roomName).emit(eventName, payload);
    } catch {
        // Socket.IO not yet initialized
    }
};

export const getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const search = req.query.search as string | undefined;
        const data = await service.getConversationsService(req.user!.id, req.user!.role, search);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conversationId = req.params.id as string;
        const limit = Number(req.query.limit) || 50;
        const cursor = req.query.cursor as string | undefined;

        const raw = await service.getMessagesService(req.user!.id, conversationId, limit, cursor);
        res.json({ success: true, data: raw.map(service.normalizeMessage) });
    } catch (error) { next(error); }
};

export const createConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;
        if (email) {
            const data = await service.createConversationByEmailService(req.user!.id, email as string);
            res.status(201).json({ success: true, data });
            return;
        }

        const roomId = (req.body.roomId ?? req.body.room_id) as string | undefined;
        const ownerId = (req.body.ownerId ?? req.body.recipient_id ?? req.body.owner_id) as string | undefined;
        
        const data = await service.createConversationService(req.user!.id, roomId, ownerId);
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conversationId = (req.body.conversationId ?? req.body.conversation_id) as string;
        const content = (req.body.content ?? req.body.message_body ?? "") as string;
        const parentId = (req.body.parentId ?? req.body.parent_id) as string | undefined;
        const messageType = (req.body.messageType ?? req.body.message_type ?? "text") as string;

        // Handle uploaded files (Attachments)
        const attachments: any[] = [];
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const result: any = await uploadToCloudinary(file.buffer);
                attachments.push({
                    url: result.secure_url,
                    name: file.originalname,
                    type: file.mimetype.split("/")[0], // image, video, audio, application etc
                    size: file.size
                });
            }
        }

        // Send message
        const extraOptions: any = {
            messageType: attachments.length > 0 ? attachments[0].type : messageType,
            attachments
        };
        if (parentId !== undefined) {
            extraOptions.parentId = parentId;
        }

        const raw = await service.sendMessageService(req.user!.id, conversationId, content, extraOptions);

        const normalized = service.normalizeMessage(raw);

        // Real-time Socket Emits
        await emitSocketEvent(`conv:${conversationId}`, "new_message", normalized);
        
        // Also emit to individual receiver room
        const receiverId = raw.receiver_id;
        await emitSocketEvent(`user:${receiverId}`, "new_message", normalized);

        res.status(201).json({ success: true, data: normalized });
    } catch (error) { next(error); }
};

export const editMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const messageId = req.params.messageId as string;
        const { content } = req.body;

        const raw = await service.editMessageService(req.user!.id, messageId, content as string);
        const normalized = service.normalizeMessage(raw);

        // Real-time socket sync
        await emitSocketEvent(`conv:${normalized.conversation_id}`, "message_edited", normalized);

        res.json({ success: true, data: normalized });
    } catch (error) { next(error); }
};

export const deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const messageId = req.params.messageId as string;
        const deleteForEveryone = req.query.everyone !== "false"; // default true

        const deleted = await service.deleteMessageService(req.user!.id, messageId, deleteForEveryone);

        // Notify socket
        await emitSocketEvent(`conv:${deleted.conversation_id}`, "message_deleted", {
            messageId,
            conversationId: deleted.conversation_id
        });

        res.json({ success: true, messageId });
    } catch (error) { next(error); }
};

export const pinConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { isPinned } = req.body;

        const data = await service.pinConversationService(req.user!.id, id, isPinned as boolean);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const archiveConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { isArchived } = req.body;

        const data = await service.archiveConversationService(req.user!.id, id, isArchived as boolean);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const muteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { isMuted } = req.body;

        const data = await service.muteConversationService(req.user!.id, id, isMuted as boolean);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const clearChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await service.clearChatService(req.user!.id, id);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const blockConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await service.blockConversationService(req.user!.id, id);
        
        await emitSocketEvent(`conv:${id}`, "conversation_blocked", { conversationId: id, blockedBy: req.user!.id });
        
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const unblockConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await service.unblockConversationService(req.user!.id, id);

        await emitSocketEvent(`conv:${id}`, "conversation_unblocked", { conversationId: id });

        res.json({ success: true, data });
    } catch (error) { next(error); }
};

export const addReaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const messageId = req.params.messageId as string;
        const { emoji } = req.body;

        const reaction = await service.addReactionService(req.user!.id, messageId, emoji as string);
        
        // Notify socket
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (message) {
            await emitSocketEvent(`conv:${message.conversation_id}`, "reaction_added", {
                messageId,
                reaction: {
                    id: reaction.id,
                    emoji: reaction.emoji,
                    user_id: reaction.user_id,
                    user_name: reaction.user.full_name
                }
            });
        }

        res.json({ success: true, data: reaction });
    } catch (error) { next(error); }
};

export const removeReaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const messageId = req.params.messageId as string;
        const removed = await service.removeReactionService(req.user!.id, messageId);

        if (removed) {
            const message = await prisma.message.findUnique({ where: { id: messageId } });
            if (message) {
                await emitSocketEvent(`conv:${message.conversation_id}`, "reaction_removed", {
                    messageId,
                    userId: req.user!.id
                });
            }
        }

        res.json({ success: true, message: "Reaction removed" });
    } catch (error) { next(error); }
};

export const getConversationMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const media = await service.getConversationMediaService(req.user!.id, id);
        res.json({ success: true, data: media });
    } catch (error) { next(error); }
};

// ─── BOOKING OFFER CONTROLLERS ──────────────────────────────────────────────

export const createBookingOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { conversationId, roomId, rentAmount, securityDeposit, moveInDate, stayDuration, customMessage } = req.body;
        
        const offerData: any = {
            rentAmount: Number(rentAmount),
            securityDeposit: Number(securityDeposit),
            moveInDate: moveInDate as string,
            stayDuration: Number(stayDuration),
        };
        if (customMessage !== undefined) {
            offerData.customMessage = customMessage as string;
        }
        
        const { offer, offerMsg } = await service.createBookingOfferService(req.user!.id, conversationId as string, roomId as string, offerData);

        const normalizedMsg = service.normalizeMessage(offerMsg);
        
        // Notify socket
        await emitSocketEvent(`conv:${conversationId}`, "new_message", normalizedMsg);
        await emitSocketEvent(`user:${offer.receiver_id}`, "new_message", normalizedMsg);
        await emitSocketEvent(`conv:${conversationId}`, "booking_offer_received", offer);

        res.status(201).json({ success: true, data: offer });
    } catch (error) { next(error); }
};

export const respondToBookingOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const offerId = req.params.offerId as string;
        const { action, counterData } = req.body;

        const result = await service.respondToBookingOfferService(req.user!.id, offerId, action as "accept" | "reject" | "counter", counterData);
        
        const conversationId = result.offer.conversation_id;

        if (result.offerMsg) {
            const normalizedMsg = service.normalizeMessage(result.offerMsg);
            await emitSocketEvent(`conv:${conversationId}`, "new_message", normalizedMsg);
            await emitSocketEvent(`user:${result.offer.sender_id}`, "new_message", normalizedMsg);
        }

        // Notify socket of status change
        await emitSocketEvent(`conv:${conversationId}`, "booking_offer_updated", {
            offerId,
            status: result.offer.status,
            offer: result.offer,
            booking: (result as any).booking || null
        });

        res.json({ success: true, data: result.offer });
    } catch (error) { next(error); }
};

// Phase 5: Report a conversation
export const reportConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conversationId = req.params.id as string;
        const { reason_code, description } = req.body;

        if (!reason_code) {
            res.status(400).json({ success: false, message: "reason_code is required" });
            return;
        }

        // Verify conversation exists and reporter is a participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }

        const userId = req.user!.id;
        if (conversation.tenant_id !== userId && conversation.owner_id !== userId) {
            res.status(403).json({ success: false, message: "You are not a participant in this conversation" });
            return;
        }

        const report = await prisma.report.create({
            data: {
                reporter_id: userId,
                target_type: "conversation",
                target_id: conversationId,
                reason_code,
                description: description ?? null,
                status: "pending",
            }
        });

        res.status(201).json({ success: true, data: report, message: "Report submitted successfully" });
    } catch (error) { next(error); }
};
