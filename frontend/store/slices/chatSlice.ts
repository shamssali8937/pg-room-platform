import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    sender: {
        id: string;
        full_name: string;
        role: string;
        profile_photo_url?: string | null;
        image?: string | null;
        mobile_number?: string | null;
    };
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    id: string;
    room_id: string | null;
    participants: Array<{
        id: string;
        full_name: string;
        role: string;
        profile_photo_url?: string | null;
        image?: string | null;
        mobile_number?: string | null;
    }>;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
    room?: {
        id: string;
        title: string;
        images: Array<{ url: string }>;
    };
}

interface ChatState {
    conversations: Conversation[];
    messages: Record<string, ChatMessage[]>;
    activeConversationId: string | null;
    isLoading: boolean;
    isSending: boolean;
    error: string | null;
}

const initialState: ChatState = {
    conversations: [],
    messages: {},
    activeConversationId: null,
    isLoading: false,
    isSending: false,
    error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchConversations = createAsyncThunk(
    "chat/fetchConversations",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/chat/conversations");
            return data.data as Conversation[];
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch conversations");
        }
    }
);

export const fetchMessages = createAsyncThunk(
    "chat/fetchMessages",
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/chat/conversations/${conversationId}/messages`);
            return { conversationId, messages: data.data as ChatMessage[] };
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch messages");
        }
    }
);

export const sendMessage = createAsyncThunk(
    "chat/sendMessage",
    async (
        { conversationId, content }: { conversationId: string; content: string },
        { rejectWithValue }
    ) => {
        try {
            const { data } = await api.post("/chat/messages", { conversation_id: conversationId, content });
            return { conversationId, message: data.data as ChatMessage };
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to send message");
        }
    }
);

export const createConversation = createAsyncThunk(
    "chat/createConversation",
    async (
        { roomId, recipientId }: { roomId?: string; recipientId: string },
        { rejectWithValue }
    ) => {
        try {
            const { data } = await api.post("/chat/conversations", { room_id: roomId, recipient_id: recipientId });
            return data.data as Conversation;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to create conversation");
        }
    }
);

export const createConversationByEmail = createAsyncThunk(
    "chat/createConversationByEmail",
    async (
        { email }: { email: string },
        { rejectWithValue }
    ) => {
        try {
            const { data } = await api.post("/chat/conversations", { email });
            return data.data as Conversation;
        } catch (err: any) {
            const msg = err.response?.data?.message ?? err.message ?? "Failed to create conversation";
            return rejectWithValue(msg);
        }
    }
);

export const blockConversation = createAsyncThunk(
    "chat/blockConversation",
    async (conversationId: string, { rejectWithValue }) => {
        try {
            await api.post(`/chat/conversations/${conversationId}/block`);
            return conversationId;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to block conversation");
        }
    }
);

export const deleteMessage = createAsyncThunk(
    "chat/deleteMessage",
    async (messageId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/chat/messages/${messageId}`);
            return messageId;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to delete message");
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setActiveConversation(state, action: PayloadAction<string | null>) {
            state.activeConversationId = action.payload;
            if (action.payload) {
                const conv = state.conversations.find((c) => c.id === action.payload);
                if (conv) conv.unread_count = 0;
            }
        },
        addLocalMessage(state, action: PayloadAction<{ conversationId: string; message: ChatMessage }>) {
            const { conversationId, message } = action.payload;
            if (!state.messages[conversationId]) state.messages[conversationId] = [];
            state.messages[conversationId].push(message);
            const conv = state.conversations.find((c) => c.id === conversationId);
            if (conv) {
                conv.last_message = message.content;
                conv.last_message_at = message.created_at;
            }
        },
        clearChatError(state) {
            state.error = null;
        },
        deleteLocalMessage(state, action: PayloadAction<{ messageId: string }>) {
            const { messageId } = action.payload;
            Object.keys(state.messages).forEach((convId) => {
                state.messages[convId] = state.messages[convId].filter((msg) => msg.id !== messageId);
            });
            // Update last_message if the deleted message was the last one
            state.conversations.forEach((conv) => {
                const convMsgs = state.messages[conv.id] ?? [];
                if (convMsgs.length > 0) {
                    const lastMsg = convMsgs[convMsgs.length - 1];
                    conv.last_message = lastMsg.content;
                    conv.last_message_at = lastMsg.created_at;
                } else {
                    conv.last_message = null;
                    conv.last_message_at = null;
                }
            });
        },
    },
    extraReducers: (builder) => {
        // Conversations
        builder.addCase(fetchConversations.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchConversations.fulfilled, (state, action) => {
            state.isLoading = false;
            state.conversations = (action.payload || []).map((c: any) => {
                const participants = c.participants ?? [
                    ...(c.tenant ? [{ id: c.tenant.id, full_name: c.tenant.full_name, role: c.tenant.role ?? "tenant", profile_photo_url: c.tenant.profile_photo_url }] : []),
                    ...(c.owner ? [{ id: c.owner.id, full_name: c.owner.full_name, role: c.owner.role ?? "owner", profile_photo_url: c.owner.profile_photo_url }] : []),
                ];
                const lastMsg = c.last_message ?? (c.messages?.[0]?.message_body ?? null);
                const lastMsgAt = c.last_message_at ?? (c.messages?.[0]?.created_at ?? null);
                return {
                    ...c,
                    participants,
                    last_message: lastMsg,
                    last_message_at: lastMsgAt,
                    unread_count: c.unread_count ?? 0,
                };
            });
        });
        builder.addCase(fetchConversations.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Messages
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            state.messages[action.payload.conversationId] = action.payload.messages;
        });

        // Send
        builder.addCase(sendMessage.pending, (state) => {
            state.isSending = true;
        });
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            state.isSending = false;
            const { conversationId, message } = action.payload;
            if (!state.messages[conversationId]) state.messages[conversationId] = [];
            state.messages[conversationId].push(message);
            const conv = state.conversations.find((c) => c.id === conversationId);
            if (conv) {
                conv.last_message = message.content;
                conv.last_message_at = message.created_at;
            }
        });
        builder.addCase(sendMessage.rejected, (state, action) => {
            state.isSending = false;
            state.error = action.payload as string;
        });

        // Create Conversation
        builder.addCase(createConversation.fulfilled, (state, action) => {
            const mappedConv = {
                ...action.payload,
                participants: (action.payload as any).participants ?? [
                    ...((action.payload as any).tenant ? [{ id: (action.payload as any).tenant.id, full_name: (action.payload as any).tenant.full_name, role: (action.payload as any).tenant.role ?? "tenant", profile_photo_url: (action.payload as any).tenant.profile_photo_url }] : []),
                    ...((action.payload as any).owner ? [{ id: (action.payload as any).owner.id, full_name: (action.payload as any).owner.full_name, role: (action.payload as any).owner.role ?? "owner", profile_photo_url: (action.payload as any).owner.profile_photo_url }] : []),
                ]
            };
            const exists = state.conversations.find((c) => c.id === mappedConv.id);
            if (!exists) state.conversations.unshift(mappedConv as any);
            state.activeConversationId = mappedConv.id;
        });
        builder.addCase(createConversationByEmail.fulfilled, (state, action) => {
            const mappedConv = {
                ...action.payload,
                participants: (action.payload as any).participants ?? [
                    ...((action.payload as any).tenant ? [{ id: (action.payload as any).tenant.id, full_name: (action.payload as any).tenant.full_name, role: (action.payload as any).tenant.role ?? "tenant", profile_photo_url: (action.payload as any).tenant.profile_photo_url }] : []),
                    ...((action.payload as any).owner ? [{ id: (action.payload as any).owner.id, full_name: (action.payload as any).owner.full_name, role: (action.payload as any).owner.role ?? "owner", profile_photo_url: (action.payload as any).owner.profile_photo_url }] : []),
                ]
            };
            const exists = state.conversations.find((c) => c.id === mappedConv.id);
            if (!exists) state.conversations.unshift(mappedConv as any);
            state.activeConversationId = mappedConv.id;
        });

        // Delete Message
        builder.addCase(deleteMessage.fulfilled, (state, action) => {
            const messageId = action.payload;
            Object.keys(state.messages).forEach((convId) => {
                state.messages[convId] = state.messages[convId].filter((msg) => msg.id !== messageId);
            });
            // Update last_message if the deleted message was the last one
            state.conversations.forEach((conv) => {
                const convMsgs = state.messages[conv.id] ?? [];
                if (convMsgs.length > 0) {
                    const lastMsg = convMsgs[convMsgs.length - 1];
                    conv.last_message = lastMsg.content;
                    conv.last_message_at = lastMsg.created_at;
                } else {
                    conv.last_message = null;
                    conv.last_message_at = null;
                }
            });
        });
    },
});

export const { setActiveConversation, addLocalMessage, deleteLocalMessage, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
