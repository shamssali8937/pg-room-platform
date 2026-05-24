import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../middleware/errorHandler.middleware.js";

export const getConversationsService = async (userId: string, role: string) => {
    const where = role === "owner" ? { owner_id: userId } : { tenant_id: userId };
    
    return prisma.conversation.findMany({
        where,
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
            messages: { orderBy: { created_at: "desc" }, take: 1 }
        },
        orderBy: { updated_at: "desc" }
    });
};

export const getMessagesService = async (userId: string, conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || (conversation.tenant_id !== userId && conversation.owner_id !== userId)) {
        throw NotFoundError("Conversation");
    }

    return prisma.message.findMany({
        where: { conversation_id: conversationId },
        include: {
            sender: { select: { id: true, full_name: true, profile_photo_url: true } }
        },
        orderBy: { created_at: "asc" }
    });
};

export const createConversationService = async (tenantId: string, roomId: string, ownerId: string) => {
    const existing = await prisma.conversation.findFirst({
        where: {
            tenant_id: tenantId,
            owner_id: ownerId,
        },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
        }
    });
    if (existing) {
        if (existing.room_id !== roomId) {
            const updated = await prisma.conversation.update({
                where: { id: existing.id },
                data: { room_id: roomId },
                include: {
                    tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
                    owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
                    room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
                }
            });
            return updated;
        }
        return existing;
    }

    return prisma.conversation.create({
        data: {
            room_id: roomId,
            tenant_id: tenantId,
            owner_id: ownerId,
        },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
        }
    });
};

export const sendMessageService = async (senderId: string, conversationId: string, messageBody: string) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || (conversation.tenant_id !== senderId && conversation.owner_id !== senderId)) {
        throw NotFoundError("Conversation");
    }

    const receiverId = conversation.tenant_id === senderId ? conversation.owner_id : conversation.tenant_id;

    const message = await prisma.message.create({
        data: {
            conversation_id: conversationId,
            sender_id: senderId,
            receiver_id: receiverId,
            message_body: messageBody,
        },
        include: {
            sender: { select: { id: true, full_name: true, profile_photo_url: true } }
        }
    });

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updated_at: new Date() }
    });

    return message;
};

export const blockConversationService = async (userId: string, conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || (conversation.tenant_id !== userId && conversation.owner_id !== userId)) {
        throw NotFoundError("Conversation");
    }

    return prisma.conversation.update({
        where: { id: conversationId },
        data: { conversation_status: "blocked" }
    });
};

export const deleteMessageService = async (userId: string, messageId: string) => {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
        throw NotFoundError("Message");
    }
    if (message.sender_id !== userId) {
        throw new Error("You are not authorized to delete this message");
    }

    return prisma.message.delete({
        where: { id: messageId }
    });
};
