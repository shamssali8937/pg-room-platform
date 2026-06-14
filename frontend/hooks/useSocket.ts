"use client";

import { useEffect, useRef, useCallback, useState } from "react";
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
    const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">("disconnected");
    
    const activeConvIdRef = useRef(activeConversationId);
    useEffect(() => {
        activeConvIdRef.current = activeConversationId;
    }, [activeConversationId]);

    // Keep a ref of all joined conversation IDs for re-join on reconnect
    const joinedConvIdsRef = useRef<Set<string>>(new Set());

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
                // Gap 5: Improved reconnection strategy with exponential backoff
                reconnection: true,
                reconnectionAttempts: Infinity,      // Never give up
                reconnectionDelay: 1000,             // Start at 1s
                reconnectionDelayMax: 30000,         // Cap at 30s
                randomizationFactor: 0.5,            // Jitter: ±50% to prevent thundering herd
            });
        }

        socketRef.current = globalSocket;

        // ─── Connection lifecycle handlers ─────────────────────────────────

        const handleConnect = () => {
            setConnectionStatus("connected");
            // Re-join all previously joined conversation rooms after reconnect
            joinedConvIdsRef.current.forEach((id) => {
                globalSocket?.emit("join_conversation", id);
            });
        };

        const handleDisconnect = (reason: string) => {
            setConnectionStatus("disconnected");
            console.warn("[Socket] Disconnected:", reason);
        };

        const handleReconnectAttempt = (attempt: number) => {
            setConnectionStatus("reconnecting");
            console.info(`[Socket] Reconnection attempt #${attempt}`);
        };

        const handleReconnect = () => {
            setConnectionStatus("connected");
            // Re-join all conversation rooms on successful reconnect
            joinedConvIdsRef.current.forEach((id) => {
                globalSocket?.emit("join_conversation", id);
            });
            // Re-mark active conversation as seen
            if (activeConvIdRef.current) {
                globalSocket?.emit("mark_seen", { conversationId: activeConvIdRef.current });
            }
        };

        const handleConnectError = async (err: Error) => {
            console.error("[Socket] Connection error:", err.message);
            // If authentication error, try refreshing the token
            if (err.message?.includes("Authentication") || err.message?.includes("Invalid token")) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
                        method: "POST",
                        credentials: "include",
                    });
                    if (res.ok) {
                        const newToken = getToken();
                        if (globalSocket && newToken) {
                            globalSocket.auth = { token: newToken };
                            globalSocket.connect();
                        }
                    }
                } catch (refreshErr) {
                    console.error("[Socket] Token refresh failed during reconnect:", refreshErr);
                }
            }
        };

        const handleReconnectError = (err: Error) => {
            console.error("[Socket] Reconnection error:", err.message);
        };

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

        // Register connection lifecycle events
        globalSocket.on("connect", handleConnect);
        globalSocket.on("disconnect", handleDisconnect);
        globalSocket.io.on("reconnect_attempt", handleReconnectAttempt);
        globalSocket.io.on("reconnect", handleReconnect);
        globalSocket.on("connect_error", handleConnectError);
        globalSocket.io.on("reconnect_error", handleReconnectError);

        // Register message events
        globalSocket.on("new_message", handleNewMessage);
        globalSocket.on("delete_message", handleDeleteMessage);
        globalSocket.on("room_viewed", handleRoomViewed);
        globalSocket.on("user_typing", handleUserTyping);
        globalSocket.on("user_stop_typing", handleUserStopTyping);

        // Join all active conversation rooms and track them
        conversationIds.forEach((id) => {
            globalSocket!.emit("join_conversation", id);
            joinedConvIdsRef.current.add(id);
        });

        return () => {
            globalSocket?.off("connect", handleConnect);
            globalSocket?.off("disconnect", handleDisconnect);
            globalSocket?.io.off("reconnect_attempt", handleReconnectAttempt);
            globalSocket?.io.off("reconnect", handleReconnect);
            globalSocket?.off("connect_error", handleConnectError);
            globalSocket?.io.off("reconnect_error", handleReconnectError);
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
        joinedConvIdsRef.current.add(conversationId);
    }, []);

    const leaveConversation = useCallback((conversationId: string) => {
        globalSocket?.emit("leave_conversation", conversationId);
        joinedConvIdsRef.current.delete(conversationId);
    }, []);

    return { socket: globalSocket || socketRef.current, joinConversation, leaveConversation, connectionStatus };
};

