import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "../config/prisma.js";
import jwt from "jsonwebtoken";

let io: SocketIOServer;

// Map of userId -> array of socketIds
export const onlineUsers = new Map<string, string[]>();

export const initSocket = (server: HttpServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(",").map(o => o.trim()),
            credentials: true,
        },
    });

    io.use(async (socket: Socket, next) => {
        try {
            // Try to get token from cookie or auth header
            let token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(" ")[1];

            if (!token && socket.handshake.headers.cookie) {
                const match = socket.handshake.headers.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
                if (match && match[1]) {
                    token = decodeURIComponent(match[1]);
                }
            }

            if (!token) return next(new Error("Authentication required"));

            const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
            socket.data.userId = payload.id ?? payload.userId;
            socket.data.role = payload.role;
            next();
        } catch {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket: Socket) => {
        const userId = socket.data.userId as string;

        // Add socket to online list
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, []);
        }
        onlineUsers.get(userId)!.push(socket.id);

        // Join personal room for direct messages
        socket.join(`user:${userId}`);

        // Broadcast to all that this user is online
        io.emit("user_status", { userId, status: "online" });

        // Provide list of currently online users to the newly connected user
        socket.emit("online_users", Array.from(onlineUsers.keys()));

        // Join a conversation room
        socket.on("join_conversation", (conversationId: string) => {
            socket.join(`conv:${conversationId}`);
        });

        // Leave a conversation room
        socket.on("leave_conversation", (conversationId: string) => {
            socket.leave(`conv:${conversationId}`);
        });

        // Typing status
        socket.on("typing", ({ conversationId }: { conversationId: string }) => {
            socket.to(`conv:${conversationId}`).emit("user_typing", { conversationId, userId });
        });

        socket.on("stop_typing", ({ conversationId }: { conversationId: string }) => {
            socket.to(`conv:${conversationId}`).emit("user_stop_typing", { conversationId, userId });
        });

        // Mark Seen
        socket.on("mark_seen", async ({ conversationId }: { conversationId: string }) => {
            try {
                const now = new Date();
                
                // Update messages in database
                await prisma.message.updateMany({
                    where: {
                        conversation_id: conversationId,
                        sender_id: { not: userId },
                        read_at: null
                    },
                    data: {
                        read_at: now,
                        delivery_status: "seen"
                    }
                });

                // Notify room
                socket.to(`conv:${conversationId}`).emit("messages_seen", { conversationId, readAt: now });
            } catch (err) {
                console.error("Socket mark_seen error:", err);
            }
        });

        // Handle message send via socket
        socket.on("send_message", async ({ conversationId, content }: { conversationId: string; content: string }) => {
            try {
                const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
                if (!conversation || (conversation.tenant_id !== userId && conversation.owner_id !== userId)) return;

                const receiverId = conversation.tenant_id === userId ? conversation.owner_id : conversation.tenant_id;
                const isReceiverOnline = onlineUsers.has(receiverId);

                const message = await prisma.message.create({
                    data: {
                        conversation_id: conversationId,
                        sender_id: userId,
                        receiver_id: receiverId,
                        message_body: content,
                        delivery_status: isReceiverOnline ? "delivered" : "sent",
                        delivered_at: isReceiverOnline ? new Date() : null,
                    },
                    include: {
                        sender: { select: { id: true, full_name: true, role: true, profile_photo_url: true } }
                    }
                });

                await prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updated_at: new Date() }
                });

                const normalized = {
                    id: message.id,
                    conversation_id: message.conversation_id,
                    sender_id: message.sender_id,
                    sender: message.sender,
                    content: message.message_body,
                    message_type: message.message_type,
                    delivery_status: message.delivery_status,
                    read_at: message.read_at,
                    delivered_at: message.delivered_at,
                    created_at: message.created_at,
                    attachments: [],
                    reactions: []
                };

                // Emit to all in the conversation room
                io.to(`conv:${conversationId}`).emit("new_message", normalized);
                // Also emit to receiver's personal room (in case they are not in conversation view)
                io.to(`user:${receiverId}`).emit("new_message", normalized);
            } catch (err) {
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        socket.on("disconnect", () => {
            const sockets = onlineUsers.get(userId) || [];
            const remaining = sockets.filter(id => id !== socket.id);

            if (remaining.length === 0) {
                onlineUsers.delete(userId);
                // Broadcast that user went offline
                io.emit("user_status", { userId, status: "offline" });
            } else {
                onlineUsers.set(userId, remaining);
            }
        });
    });

    return io;
};

export const getIO = (): SocketIOServer => {
    if (!io) throw new Error("Socket.IO not initialized");
    return io;
};
