"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch } from "@/store/hooks";
import { addLocalMessage, deleteLocalMessage } from "@/store/slices/chatSlice";
import type { ChatMessage } from "@/store/slices/chatSlice";
import { updateRoomViews } from "@/store/slices/roomSlice";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:5000";

let globalSocket: Socket | null = null;

export const useSocket = (conversationIds: string[] = []) => {
    const dispatch = useAppDispatch();
    const socketRef = useRef<Socket | null>(null);

    const getToken = useCallback((): string | null => {
        // Try to get the access token from cookies
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : null;
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const token = getToken();
        if (!token) return;

        // Reuse existing socket or create new one
        if (!globalSocket || !globalSocket.connected) {
            globalSocket = io(SOCKET_URL, {
                auth: { token },
                withCredentials: true,
                transports: ["websocket", "polling"],
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });
        }

        socketRef.current = globalSocket;

        // Listen for incoming messages
        const handleNewMessage = (message: ChatMessage) => {
            dispatch(addLocalMessage({ conversationId: message.conversation_id, message }));
        };

        const handleDeleteMessage = ({ messageId }: { messageId: string }) => {
            dispatch(deleteLocalMessage({ messageId }));
        };

        const handleRoomViewed = ({ roomId, views }: { roomId: string; views: number }) => {
            dispatch(updateRoomViews({ id: roomId, views }));
        };

        globalSocket.on("new_message", handleNewMessage);
        globalSocket.on("delete_message", handleDeleteMessage);
        globalSocket.on("room_viewed", handleRoomViewed);

        // Join all active conversation rooms
        conversationIds.forEach((id) => {
            globalSocket!.emit("join_conversation", id);
        });

        return () => {
            globalSocket?.off("new_message", handleNewMessage);
            globalSocket?.off("delete_message", handleDeleteMessage);
            globalSocket?.off("room_viewed", handleRoomViewed);
            // Leave rooms on unmount
            conversationIds.forEach((id) => {
                globalSocket?.emit("leave_conversation", id);
            });
        };
    }, [dispatch, getToken, conversationIds.join(",")]); // eslint-disable-line

    const joinConversation = useCallback((conversationId: string) => {
        globalSocket?.emit("join_conversation", conversationId);
    }, []);

    const leaveConversation = useCallback((conversationId: string) => {
        globalSocket?.emit("leave_conversation", conversationId);
    }, []);

    return { socket: socketRef.current, joinConversation, leaveConversation };
};
