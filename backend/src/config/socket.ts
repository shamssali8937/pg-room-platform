import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "../config/prisma.js";
import jwt from "jsonwebtoken";

let io: SocketIOServer;

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
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(" ")[1];

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

        // Join personal room for direct messages
        socket.join(`user:${userId}`);

        // Join a conversation room
        socket.on("join_conversation", (conversationId: string) => {
            socket.join(`conv:${conversationId}`);
        });

        // Leave a conversation room
        socket.on("leave_conversation", (conversationId: string) => {
            socket.leave(`conv:${conversationId}`);
        });

        // Handle message send via socket (alternative to REST)
        socket.on("send_message", async ({ conversationId, content }: { conversationId: string; content: string }) => {
            try {
                const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
                if (!conversation || (conversation.tenant_id !== userId && conversation.owner_id !== userId)) return;

                const receiverId = conversation.tenant_id === userId ? conversation.owner_id : conversation.tenant_id;

                const message = await prisma.message.create({
                    data: {
                        conversation_id: conversationId,
                        sender_id: userId,
                        receiver_id: receiverId,
                        message_body: content,
                    },
                    include: {
                        sender: { select: { id: true, full_name: true, role: true } }
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
                    is_read: false,
                    created_at: message.created_at,
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
            // cleanup handled automatically by socket.io
        });
    });

    return io;
};

export const getIO = (): SocketIOServer => {
    if (!io) throw new Error("Socket.IO not initialized");
    return io;
};
