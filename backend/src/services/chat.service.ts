import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../middleware/errorHandler.middleware.js";

export const getConversationsService = async (userId: string, role: string) => {
    const where = role === "admin"
        ? { OR: [{ tenant_id: userId }, { owner_id: userId }] }
        : role === "owner"
            ? { owner_id: userId }
            : { tenant_id: userId };
    
    return prisma.conversation.findMany({
        where,
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
            messages: { orderBy: { created_at: "desc" }, take: 1 }
        },
        orderBy: { updated_at: "desc" }
    });
};

export const getMessagesService = async (userId: string, conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) {
        throw NotFoundError("Conversation");
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const isAdmin = user?.role === "admin";

    if (!isAdmin && conversation.tenant_id !== userId && conversation.owner_id !== userId) {
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
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
        }
    });
    if (existing) {
        if (existing.room_id !== roomId) {
            const updated = await prisma.conversation.update({
                where: { id: existing.id },
                data: { room_id: roomId },
                include: {
                    tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
                    owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
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
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
        }
    });
};

export const createConversationByEmailService = async (initiatorId: string, recipientEmail: string) => {
    const recipient = await prisma.user.findUnique({
        where: { email: recipientEmail }
    });
    if (!recipient) {
        throw new Error("User with this email address does not exist.");
    }
    if (recipient.id === initiatorId) {
        throw new Error("You cannot start a chat with yourself.");
    }

    let tenantId = initiatorId;
    let ownerId = recipient.id;

    const initiator = await prisma.user.findUnique({ where: { id: initiatorId } });
    if (initiator?.role === "owner" && recipient.role === "tenant") {
        tenantId = recipient.id;
        ownerId = initiatorId;
    }

    // Find a room to satisfy DB constraint
    let room = await prisma.room.findFirst({
        where: { owner_id: ownerId }
    });

    if (!room) {
        room = await prisma.room.findFirst({
            where: { owner_id: tenantId }
        });
    }

    if (!room) {
        room = await prisma.room.findFirst();
    }

    if (!room) {
        let defaultOwner = await prisma.user.findFirst({ where: { role: "admin" } });
        if (!defaultOwner) {
            defaultOwner = await prisma.user.findFirst();
        }
        if (!defaultOwner) {
            throw new Error("Platform setup is incomplete: No rooms or users found to attach chat.");
        }
        room = await prisma.room.create({
            data: {
                title: "General Discussion",
                city: "Default",
                address: "Platform Chat",
                room_type: "discussion",
                owner_id: defaultOwner.id,
                status: "active"
            }
        });
    }

    const existing = await prisma.conversation.findFirst({
        where: {
            tenant_id: tenantId,
            owner_id: ownerId
        },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
        }
    });

    if (existing) {
        return existing;
    }

    return prisma.conversation.create({
        data: {
            room_id: room.id,
            tenant_id: tenantId,
            owner_id: ownerId
        },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
        }
    });
};

export const sendMessageService = async (senderId: string, conversationId: string, messageBody: string) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) {
        throw NotFoundError("Conversation");
    }

    const user = await prisma.user.findUnique({ where: { id: senderId }, select: { role: true } });
    const isAdmin = user?.role === "admin";

    if (!isAdmin && conversation.tenant_id !== senderId && conversation.owner_id !== senderId) {
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

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const isAdmin = user?.role === "admin";

    if (!isAdmin && message.sender_id !== userId) {
        throw new Error("You are not authorized to delete this message");
    }

    return prisma.message.delete({
        where: { id: messageId }
    });
};
