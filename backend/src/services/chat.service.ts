import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../middleware/errorHandler.middleware.js";

export const getConversationsService = async (userId: string, role: string) => {
    const where = role === "owner" ? { owner_id: userId } : { tenant_id: userId };
    
    return prisma.conversation.findMany({
        where,
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true } },
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
        orderBy: { created_at: "asc" }
    });
};

export const createConversationService = async (tenantId: string, roomId: string, ownerId: string) => {
    return prisma.conversation.create({
        data: {
            room_id: roomId,
            tenant_id: tenantId,
            owner_id: ownerId,
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
