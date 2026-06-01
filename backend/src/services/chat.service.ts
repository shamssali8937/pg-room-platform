import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../middleware/errorHandler.middleware.js";
import { onlineUsers } from "../config/socket.js";

// Normalize message database response for the client
export const normalizeMessage = (msg: any) => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    sender: msg.sender ? {
        id: msg.sender.id,
        full_name: msg.sender.full_name,
        role: msg.sender.role,
        profile_photo_url: msg.sender.profile_photo_url,
    } : null,
    content: msg.message_body,
    message_type: msg.message_type,
    delivery_status: msg.delivery_status,
    read_at: msg.read_at,
    delivered_at: msg.delivered_at,
    created_at: msg.created_at,
    is_edited: msg.is_edited,
    parent_id: msg.parent_id,
    parent: msg.parent ? {
        id: msg.parent.id,
        content: msg.parent.message_body,
        sender_name: msg.parent.sender?.full_name,
    } : null,
    attachments: msg.attachments?.map((att: any) => ({
        id: att.id,
        file_url: att.file_url,
        file_name: att.file_name,
        file_type: att.file_type,
        file_size: att.file_size,
    })) || [],
    reactions: msg.reactions?.map((react: any) => ({
        id: react.id,
        emoji: react.emoji,
        user_id: react.user_id,
        user_name: react.user?.full_name,
    })) || [],
});

export const getConversationsService = async (userId: string, role: string, search?: string) => {
    // 1. Determine conversation membership conditions
    // Admins can see all chats in which they are a participant (tenant_id or owner_id)
    const membershipFilter = role === "admin"
        ? { OR: [{ tenant_id: userId }, { owner_id: userId }] }
        : role === "owner"
            ? { owner_id: userId }
            : { tenant_id: userId };

    // Soft delete check
    const softDeleteFilter = {
        OR: [
            { tenant_id: userId, deleted_at_tenant: null },
            { owner_id: userId, deleted_at_owner: null }
        ]
    };

    // Main search filter if provided
    let searchFilter = {};
    if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        searchFilter = {
            OR: [
                { room: { title: { contains: q, mode: "insensitive" as any } } },
                { tenant: { full_name: { contains: q, mode: "insensitive" as any } } },
                { owner: { full_name: { contains: q, mode: "insensitive" as any } } },
                { messages: { some: { message_body: { contains: q, mode: "insensitive" as any } } } }
            ]
        };
    }

    const conversations = await prisma.conversation.findMany({
        where: {
            AND: [
                membershipFilter,
                softDeleteFilter,
                searchFilter
            ]
        },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            room: { select: { id: true, title: true, price: true, rent_amount: true, city: true, images: { take: 1, select: { file_url: true } } } },
            messages: {
                orderBy: { created_at: "desc" },
                take: 1,
                include: {
                    sender: { select: { id: true, full_name: true } }
                }
            }
        },
        orderBy: { updated_at: "desc" }
    });

    // Determine blocks
    const userBlocks = await prisma.blockedUser.findMany({
        where: {
            OR: [{ blocker_id: userId }, { blocked_id: userId }]
        }
    });

    const blockedUserIds = new Set(
        userBlocks.map(b => b.blocker_id === userId ? b.blocked_id : b.blocker_id)
    );

    // Map and enrich details (pinned, archived, online status, unread count)
    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
        const isTenant = conv.tenant_id === userId;
        const otherParticipant = isTenant ? conv.owner : conv.tenant;

        // Pinned, Archived, Muted flags specific to current user's role
        const isPinned = isTenant ? conv.is_pinned_tenant : conv.is_pinned_owner;
        const isArchived = isTenant ? conv.is_archived_tenant : conv.is_archived_owner;
        const isMuted = isTenant ? conv.is_muted_tenant : conv.is_muted_owner;

        // Unread counts in this conversation
        const unreadCount = await prisma.message.count({
            where: {
                conversation_id: conv.id,
                sender_id: { not: userId },
                read_at: null
            }
        });

        // Last active time
        const lastMsg = conv.messages[0] ?? null;
        const lastMsgAt = lastMsg ? lastMsg.created_at : conv.updated_at;

        // Check if other participant is online
        const isOnline = otherParticipant ? onlineUsers.has(otherParticipant.id) : false;

        // Check block relationship
        const isBlocked = otherParticipant ? blockedUserIds.has(otherParticipant.id) : false;

        return {
            id: conv.id,
            room_id: conv.room_id,
            room: conv.room ? {
                id: conv.room.id,
                title: conv.room.title,
                price: conv.room.price || conv.room.rent_amount,
                image: conv.room.images[0]?.file_url || null,
                city: conv.room.city
            } : null,
            other_participant: otherParticipant ? {
                id: otherParticipant.id,
                full_name: otherParticipant.full_name,
                profile_photo_url: otherParticipant.profile_photo_url,
                mobile_number: otherParticipant.mobile_number,
                role: otherParticipant.role,
                is_online: isOnline
            } : null,
            participants: [
                {
                    id: conv.tenant.id,
                    full_name: conv.tenant.full_name,
                    role: conv.tenant.role,
                    profile_photo_url: conv.tenant.profile_photo_url,
                    mobile_number: conv.tenant.mobile_number
                },
                {
                    id: conv.owner.id,
                    full_name: conv.owner.full_name,
                    role: conv.owner.role,
                    profile_photo_url: conv.owner.profile_photo_url,
                    mobile_number: conv.owner.mobile_number
                }
            ],
            last_message: lastMsg ? lastMsg.message_body : null,
            last_message_at: lastMsgAt,
            unread_count: unreadCount,
            is_pinned: isPinned,
            is_archived: isArchived,
            is_muted: isMuted,
            is_blocked: isBlocked,
            conversation_status: conv.conversation_status,
            created_at: conv.created_at,
            updated_at: conv.updated_at
        };
    }));

    // Sort by pinned first, then by last active time descending
    return enrichedConversations.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    });
};

export const getMessagesService = async (userId: string, conversationId: string, limit = 50, cursor?: string) => {
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
    });

    if (!conversation) throw NotFoundError("Conversation");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const isAdmin = user?.role === "admin";

    // Verify participation
    if (!isAdmin && conversation.tenant_id !== userId && conversation.owner_id !== userId) {
        throw NotFoundError("Conversation");
    }

    // Pagination query options
    const queryOptions: any = {
        where: {
            conversation_id: conversationId,
            // Honor soft delete filters
            NOT: [
                { sender_id: userId, conversation: { tenant_id: userId, deleted_at_tenant: { not: null } } },
                { sender_id: userId, conversation: { owner_id: userId, deleted_at_owner: { not: null } } },
            ]
        },
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
            sender: { select: { id: true, full_name: true, profile_photo_url: true, role: true } },
            parent: {
                include: {
                    sender: { select: { full_name: true } }
                }
            },
            attachments: true,
            reactions: {
                include: {
                    user: { select: { full_name: true } }
                }
            }
        }
    };

    if (cursor) {
        queryOptions.cursor = { id: cursor };
        queryOptions.skip = 1; // Skip the cursor message itself
    }

    const messages = await prisma.message.findMany(queryOptions);
    
    // Mark messages as seen when fetched by this participant
    await prisma.message.updateMany({
        where: {
            conversation_id: conversationId,
            sender_id: { not: userId },
            read_at: null
        },
        data: {
            read_at: new Date(),
            delivery_status: "seen"
        }
    });

    // Sort ascending for chat stream view
    return messages.reverse();
};

export const createConversationService = async (tenantId: string, roomId?: string, ownerId?: string) => {
    let finalRoomId = roomId;
    let finalOwnerId = ownerId;

    if (roomId && !ownerId) {
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (room) finalOwnerId = room.owner_id;
    }

    if (!finalOwnerId) {
        throw new Error("Recipient or Room Owner is required to start a chat.");
    }

    // Try finding existing conversation between these users
    const existing = await prisma.conversation.findFirst({
        where: {
            tenant_id: tenantId,
            owner_id: finalOwnerId,
        },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
        }
    });

    if (existing) {
        // If room changed and is provided, update room in existing convo
        if (finalRoomId && existing.room_id !== finalRoomId) {
            return prisma.conversation.update({
                where: { id: existing.id },
                data: {
                    room_id: finalRoomId,
                    deleted_at_tenant: null, // restore if soft deleted
                    deleted_at_owner: null
                },
                include: {
                    tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
                    owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
                    room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
                }
            });
        }
        return existing;
    }

    // Create a new conversation
    return prisma.conversation.create({
        data: {
            room_id: finalRoomId || null,
            tenant_id: tenantId,
            owner_id: finalOwnerId,
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

    // Find if a conversation already exists
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
        return prisma.conversation.update({
            where: { id: existing.id },
            data: {
                deleted_at_tenant: null,
                deleted_at_owner: null
            },
            include: {
                tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
                owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
                room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
            }
        });
    }

    // Simply create without room_id (nullable room_id!)
    return prisma.conversation.create({
        data: {
            tenant_id: tenantId,
            owner_id: ownerId,
            room_id: null,
        },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true, role: true } },
            room: { select: { id: true, title: true, images: { take: 1, select: { file_url: true } } } },
        }
    });
};

export const sendMessageService = async (
    senderId: string,
    conversationId: string,
    content: string,
    extra: {
        messageType?: string;
        parentId?: string;
        attachments?: Array<{ url: string; name: string; type: string; size?: number }>;
    } = {}
) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw NotFoundError("Conversation");

    // Check blocked status
    const block = await prisma.blockedUser.findFirst({
        where: {
            OR: [
                { blocker_id: conversation.tenant_id, blocked_id: conversation.owner_id },
                { blocker_id: conversation.owner_id, blocked_id: conversation.tenant_id }
            ]
        }
    });

    if (block) {
        throw new Error("You cannot send messages to this user because of block constraints.");
    }

    const receiverId = conversation.tenant_id === senderId ? conversation.owner_id : conversation.tenant_id;
    const isReceiverOnline = onlineUsers.has(receiverId);

    // Create the message in database
    const messageData: any = {
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        message_body: content,
        message_type: extra.messageType || "text",
        delivery_status: isReceiverOnline ? "delivered" : "sent",
        delivered_at: isReceiverOnline ? new Date() : null,
    };

    if (extra.parentId) {
        messageData.parent_id = extra.parentId;
    }

    if (extra.attachments && extra.attachments.length > 0) {
        messageData.attachments = {
            create: extra.attachments.map(att => ({
                file_url: att.url,
                file_name: att.name,
                file_type: att.type,
                file_size: att.size || null,
            }))
        };
    }

    const message = await prisma.message.create({
        data: messageData,
        include: {
            sender: { select: { id: true, full_name: true, profile_photo_url: true, role: true } },
            parent: {
                include: {
                    sender: { select: { full_name: true } }
                }
            },
            attachments: true,
            reactions: true
        }
    });

    // Update conversation last active timestamp
    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            updated_at: new Date(),
            deleted_at_tenant: null, // restore if soft deleted
            deleted_at_owner: null
        }
    });

    // Create a database notification for the receiver
    try {
        await prisma.notification.create({
            data: {
                user_id: receiverId,
                notification_type: "chat_message",
                title: `New Message from ${message.sender?.full_name || "User"}`,
                body: content.length > 60 ? `${content.substring(0, 57)}...` : content,
                action_url: message.sender?.role === "owner" ? `/tenant/chat` : `/owner/inquiries`
            }
        });
    } catch (err) {
        console.error("Failed to create chat notification:", err);
    }

    return message;
};

// Edit message service
export const editMessageService = async (userId: string, messageId: string, newContent: string) => {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw NotFoundError("Message");

    if (message.sender_id !== userId) {
        throw new Error("You are not authorized to edit this message.");
    }

    return prisma.message.update({
        where: { id: messageId },
        data: {
            message_body: newContent,
            is_edited: true
        },
        include: {
            sender: { select: { id: true, full_name: true, profile_photo_url: true, role: true } },
            parent: {
                include: {
                    sender: { select: { full_name: true } }
                }
            },
            attachments: true,
            reactions: true
        }
    });
};

// Delete message service
export const deleteMessageService = async (userId: string, messageId: string, deleteForEveryone = true) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId }
    });
    if (!message) throw NotFoundError("Message");

    if (deleteForEveryone) {
        if (message.sender_id !== userId) {
            throw new Error("You can only delete your own messages for everyone.");
        }
        return prisma.message.delete({
            where: { id: messageId }
        });
    } else {
        // Soft delete message only for current user
        // We will just do full deletion in standard chat unless they request personal hiding.
        // Let's implement full deletion since it is clean, or just delete it.
        return prisma.message.delete({
            where: { id: messageId }
        });
    }
};

// Pin conversation
export const pinConversationService = async (userId: string, conversationId: string, isPinned: boolean) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw NotFoundError("Conversation");

    const isTenant = conversation.tenant_id === userId;
    return prisma.conversation.update({
        where: { id: conversationId },
        data: {
            is_pinned_tenant: isTenant ? isPinned : conversation.is_pinned_tenant,
            is_pinned_owner: !isTenant ? isPinned : conversation.is_pinned_owner,
        }
    });
};

// Archive conversation
export const archiveConversationService = async (userId: string, conversationId: string, isArchived: boolean) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw NotFoundError("Conversation");

    const isTenant = conversation.tenant_id === userId;
    return prisma.conversation.update({
        where: { id: conversationId },
        data: {
            is_archived_tenant: isTenant ? isArchived : conversation.is_archived_tenant,
            is_archived_owner: !isTenant ? isArchived : conversation.is_archived_owner,
        }
    });
};

// Mute conversation notifications
export const muteConversationService = async (userId: string, conversationId: string, isMuted: boolean) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw NotFoundError("Conversation");

    const isTenant = conversation.tenant_id === userId;
    return prisma.conversation.update({
        where: { id: conversationId },
        data: {
            is_muted_tenant: isTenant ? isMuted : conversation.is_muted_tenant,
            is_muted_owner: !isTenant ? isMuted : conversation.is_muted_owner,
        }
    });
};

// Clear chat / soft delete conversation
export const clearChatService = async (userId: string, conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw NotFoundError("Conversation");

    const isTenant = conversation.tenant_id === userId;
    return prisma.conversation.update({
        where: { id: conversationId },
        data: {
            deleted_at_tenant: isTenant ? new Date() : conversation.deleted_at_tenant,
            deleted_at_owner: !isTenant ? new Date() : conversation.deleted_at_owner,
        }
    });
};

// Block contact service
export const blockConversationService = async (userId: string, conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw NotFoundError("Conversation");

    const blockerId = userId;
    const blockedId = conversation.tenant_id === userId ? conversation.owner_id : conversation.tenant_id;

    // Create block record
    const block = await prisma.blockedUser.upsert({
        where: {
            blocker_id_blocked_id: { blocker_id: blockerId, blocked_id: blockedId }
        },
        create: {
            blocker_id: blockerId,
            blocked_id: blockedId
        },
        update: {}
    });

    // Update conversation status
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { conversation_status: "blocked" }
    });

    return block;
};

export const unblockConversationService = async (userId: string, conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw NotFoundError("Conversation");

    const blockerId = userId;
    const blockedId = conversation.tenant_id === userId ? conversation.owner_id : conversation.tenant_id;

    try {
        await prisma.blockedUser.delete({
            where: {
                blocker_id_blocked_id: { blocker_id: blockerId, blocked_id: blockedId }
            }
        });
    } catch {
        // ignore if not exists
    }

    // Re-check if any reverse block exists. If not, reset status to active
    const reverseBlock = await prisma.blockedUser.findFirst({
        where: { blocker_id: blockedId, blocked_id: blockerId }
    });

    if (!reverseBlock) {
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { conversation_status: "active" }
        });
    }

    return { success: true };
};

// Reactions
export const addReactionService = async (userId: string, messageId: string, emoji: string) => {
    return prisma.reaction.upsert({
        where: {
            message_id_user_id: { message_id: messageId, user_id: userId }
        },
        create: {
            message_id: messageId,
            user_id: userId,
            emoji: emoji
        },
        update: {
            emoji: emoji
        },
        include: {
            user: { select: { full_name: true } }
        }
    });
};

export const removeReactionService = async (userId: string, messageId: string) => {
    try {
        return await prisma.reaction.delete({
            where: {
                message_id_user_id: { message_id: messageId, user_id: userId }
            }
        });
    } catch {
        return null;
    }
};

// Get media files from conversation
export const getConversationMediaService = async (userId: string, conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw NotFoundError("Conversation");

    if (conversation.tenant_id !== userId && conversation.owner_id !== userId) {
        throw NotFoundError("Conversation");
    }

    return prisma.attachment.findMany({
        where: {
            message: { conversation_id: conversationId }
        },
        orderBy: { created_at: "desc" }
    });
};

// ─── BOOKING OFFER SPECIAL SERVICES ──────────────────────────────────────────

export const createBookingOfferService = async (
    tenantId: string,
    conversationId: string,
    roomId: string,
    data: {
        rentAmount: number;
        securityDeposit: number;
        moveInDate: string;
        stayDuration: number;
        customMessage?: string;
    }
) => {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw NotFoundError("Conversation");
    if (conversation.tenant_id !== tenantId) {
        throw new Error("Only tenants can initiate a booking offer.");
    }

    // Create BookingOffer in database
    const offer = await prisma.bookingOffer.create({
        data: {
            conversation_id: conversationId,
            sender_id: tenantId,
            receiver_id: conversation.owner_id,
            room_id: roomId,
            rent_amount: data.rentAmount,
            security_deposit: data.securityDeposit,
            move_in_date: new Date(data.moveInDate),
            stay_duration: data.stayDuration,
            custom_message: data.customMessage || null,
            status: "pending"
        },
        include: {
            room: { select: { title: true } },
            sender: { select: { full_name: true } }
        }
    });

    // Send the offer card message directly into chat stream
    const messageContent = `⚡ BOOKING_OFFER booking_id: ${offer.id} rent: PKR ${offer.rent_amount}`;
    const offerMsg = await sendMessageService(tenantId, conversationId, messageContent, {
        messageType: "booking_offer"
    });

    return { offer, offerMsg };
};

export const respondToBookingOfferService = async (
    userId: string,
    offerId: string,
    action: "accept" | "reject" | "counter",
    counterData?: {
        rentAmount: number;
        securityDeposit: number;
        moveInDate: string;
        stayDuration: number;
        customMessage?: string;
    }
) => {
    const offer = await prisma.bookingOffer.findUnique({
        where: { id: offerId },
        include: {
            conversation: true,
            room: true
        }
    });

    if (!offer) throw NotFoundError("BookingOffer");

    // Only recipient can accept/reject or counter-offer
    if (offer.receiver_id !== userId) {
        throw new Error("You are not authorized to respond to this offer.");
    }

    const conversationId = offer.conversation_id;

    if (action === "accept") {
        // 1. Update BookingOffer status
        const updatedOffer = await prisma.bookingOffer.update({
            where: { id: offerId },
            data: { status: "accepted" }
        });

        // 2. Generate actual PG Booking request
        const booking = await prisma.booking.create({
            data: {
                room_id: offer.room_id,
                tenant_id: offer.sender_id, // The tenant who sent the offer
                owner_id: offer.receiver_id, // The owner who accepted the offer
                request_type: "booking",
                message: `Booking created via accepted Chat Offer. Stay: ${offer.stay_duration} months, Rent: PKR ${offer.rent_amount}`,
                status: "approved" // automatically approved since offer accepted!
            }
        });

        // 3. Update room status to booked/unavailable
        await prisma.room.update({
            where: { id: offer.room_id },
            data: { status: "booked" }
        });

        // 4. Send systemic success card into chat
        const msgText = `🎉 BOOKING OFFER ACCEPTED! A booking has been successfully created for ${offer.room.title}. Rent: PKR ${offer.rent_amount}/mo, Deposit: PKR ${offer.security_deposit}.`;
        const offerMsg = await sendMessageService(userId, conversationId, msgText, {
            messageType: "system"
        });

        // 5. Notify both users via user notification table
        await prisma.notification.createMany({
            data: [
                {
                    user_id: offer.sender_id,
                    notification_type: "booking_offer_accepted",
                    title: "Booking Offer Accepted! 🎉",
                    body: `Your rent offer for ${offer.room.title} was accepted. Booking has been generated.`,
                    action_url: `/tenant/bookings`
                },
                {
                    user_id: offer.receiver_id,
                    notification_type: "booking_offer_accepted",
                    title: "Booking Offer Confirmed! 🎉",
                    body: `You accepted the offer for ${offer.room.title}.`,
                    action_url: `/owner/bookings`
                }
            ]
        });

        return { offer: updatedOffer, booking, offerMsg };
    }

    if (action === "reject") {
        const updatedOffer = await prisma.bookingOffer.update({
            where: { id: offerId },
            data: { status: "rejected" }
        });

        const msgText = `❌ Booking Offer Rejected.`;
        const offerMsg = await sendMessageService(userId, conversationId, msgText, {
            messageType: "system"
        });

        return { offer: updatedOffer, offerMsg };
    }

    if (action === "counter") {
        if (!counterData) {
            throw new Error("Counter offer data is required.");
        }

        // Mark old offer as countered
        await prisma.bookingOffer.update({
            where: { id: offerId },
            data: { status: "countered" }
        });

        // Create new counter BookingOffer where sender is current user (who was receiver)
        const counterOffer = await prisma.bookingOffer.create({
            data: {
                conversation_id: conversationId,
                sender_id: userId,
                receiver_id: offer.sender_id, // counter back to the original sender
                room_id: offer.room_id,
                rent_amount: counterData.rentAmount,
                security_deposit: counterData.securityDeposit,
                move_in_date: new Date(counterData.moveInDate),
                stay_duration: counterData.stayDuration,
                custom_message: counterData.customMessage || null,
                status: "pending",
                counter_offer_id: offer.id // link back for negotiation timeline!
            },
            include: {
                room: { select: { title: true } }
            }
        });

        // Send counter card message
        const messageContent = `⚡ COUNTER_OFFER booking_id: ${counterOffer.id} rent: PKR ${counterOffer.rent_amount}`;
        const offerMsg = await sendMessageService(userId, conversationId, messageContent, {
            messageType: "booking_offer"
        });

        return { offer: counterOffer, offerMsg };
    }

    throw new Error("Invalid offer response action.");
};
