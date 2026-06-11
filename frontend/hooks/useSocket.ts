"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addLocalMessage, deleteLocalMessage, setTypingStatus } from "@/store/slices/chatSlice";
import type { ChatMessage } from "@/store/slices/chatSlice";
import { updateRoomViews } from "@/store/slices/roomSlice";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:5000";

let globalSocket: Socket | null = null;

export const useSocket = (conversationIds: string[] = []) => {
    const dispatch = useAppDispatch();
    const socketRef = useRef<Socket | null>(null);
    const { isAuthenticated } = useAppSelector((s) => s.auth);
    const activeConversationId = useAppSelector((s) => s.chat.activeConversationId);
    
    const activeConvIdRef = useRef(activeConversationId);
    useEffect(() => {
        activeConvIdRef.current = activeConversationId;
    }, [activeConversationId]);

    const getToken = useCallback((): string | null => {
        // Try to get the access token from cookies
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : null;
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!isAuthenticated) return;

        const token = getToken();

        // Reuse existing socket or create new one
        if (!globalSocket || !globalSocket.connected) {
            globalSocket = io(SOCKET_URL, {
                auth: token ? { token } : undefined,
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
            // If the chat is currently open for this conversation, mark it as seen immediately
            if (globalSocket && message.conversation_id === activeConvIdRef.current) {
                globalSocket.emit("mark_seen", { conversationId: message.conversation_id });
            }
        };

        const handleDeleteMessage = ({ messageId }: { messageId: string }) => {
            dispatch(deleteLocalMessage({ messageId }));
        };

        const handleRoomViewed = ({ roomId, views }: { roomId: string; views: number }) => {
            dispatch(updateRoomViews({ id: roomId, views }));
        };

        const handleUserTyping = ({ conversationId }: { conversationId: string; userId: string }) => {
            dispatch(setTypingStatus({ conversationId, isTyping: true }));
        };

        const handleUserStopTyping = ({ conversationId }: { conversationId: string; userId: string }) => {
            dispatch(setTypingStatus({ conversationId, isTyping: false }));
        };

        globalSocket.on("new_message", handleNewMessage);
        globalSocket.on("delete_message", handleDeleteMessage);
        globalSocket.on("room_viewed", handleRoomViewed);
        globalSocket.on("user_typing", handleUserTyping);
        globalSocket.on("user_stop_typing", handleUserStopTyping);

        // Join all active conversation rooms
        conversationIds.forEach((id) => {
            globalSocket!.emit("join_conversation", id);
        });

        return () => {
            globalSocket?.off("new_message", handleNewMessage);
            globalSocket?.off("delete_message", handleDeleteMessage);
            globalSocket?.off("room_viewed", handleRoomViewed);
            globalSocket?.off("user_typing", handleUserTyping);
            globalSocket?.off("user_stop_typing", handleUserStopTyping);
            // DO NOT leave conversation rooms on component unmount so background notifications work
        };
    }, [dispatch, getToken, conversationIds.join(","), isAuthenticated]); // eslint-disable-line

    // Emit mark_seen when activeConversationId changes
    useEffect(() => {
        if (globalSocket && activeConversationId) {
            globalSocket.emit("mark_seen", { conversationId: activeConversationId });
        }
    }, [activeConversationId]);

    const joinConversation = useCallback((conversationId: string) => {
        globalSocket?.emit("join_conversation", conversationId);
    }, []);

    const leaveConversation = useCallback((conversationId: string) => {
        globalSocket?.emit("leave_conversation", conversationId);
    }, []);

    return { socket: globalSocket || socketRef.current, joinConversation, leaveConversation };
};
