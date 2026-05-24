"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import {
    fetchConversations,
    fetchMessages,
    sendMessage,
    setActiveConversation,
    deleteMessage,
    createConversationByEmail
} from "@/store/slices/chatSlice";
import {
    Send,
    Search,
    MessageCircle,
    Loader2,
    Trash2,
    MessageSquare,
    Plus,
    X,
    AlertCircle
} from "lucide-react";

function AdminInboxContent() {
    const { isDark } = useAdminTheme();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const { conversations, messages, activeConversationId, isLoading, isSending } = useAppSelector((s) => s.chat);

    const [inputText, setInputText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [showStartChatModal, setShowStartChatModal] = useState(false);
    const [newChatEmail, setNewChatEmail] = useState("");
    const [startChatError, setStartChatError] = useState("");
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    const handleStartChatByEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChatEmail.trim()) return;
        setIsCreatingChat(true);
        setStartChatError("");
        try {
            const resultAction = await dispatch(createConversationByEmail({ email: newChatEmail.trim() }));
            if (createConversationByEmail.fulfilled.match(resultAction)) {
                setShowStartChatModal(false);
                setNewChatEmail("");
            } else {
                setStartChatError(resultAction.payload as string || "Failed to start chat.");
            }
        } catch (err: any) {
            setStartChatError("An unexpected error occurred.");
        } finally {
            setIsCreatingChat(false);
        }
    };

    // Initial Fetch of all conversations
    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

    // Fetch messages for active conversation
    useEffect(() => {
        if (activeConversationId) {
            dispatch(fetchMessages(activeConversationId));
        }
    }, [activeConversationId, dispatch]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeConversationId]);

    const getOtherParticipant = (conv: any) => {
        return conv.participants?.find((p: any) => p.id !== user?.id) ?? conv.participants?.[0] ?? null;
    };

    // Filter conversations based on query
    const filteredConversations = conversations.filter((c) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const other = getOtherParticipant(c);
        return (
            other?.full_name?.toLowerCase().includes(q) ||
            c.room?.title?.toLowerCase().includes(q) ||
            c.last_message?.toLowerCase().includes(q)
        );
    });

    const handleSendMessage = async () => {
        if (!inputText.trim() || !activeConversationId) return;
        const content = inputText.trim();
        setInputText("");
        await dispatch(sendMessage({ conversationId: activeConversationId, content }));
    };

    const handleDelete = async (messageId: string) => {
        if (confirm("Are you sure you want to delete this message?")) {
            await dispatch(deleteMessage(messageId));
        }
    };

    // Styling constants
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textSecondary = isDark ? "text-zinc-400" : "text-slate-500";
    const surfaceBg = isDark ? "bg-[#121212]/90 border-white/[0.04]" : "bg-white border-slate-200 shadow-sm";
    const headerBg = isDark ? "bg-[#181818]/90 border-white/[0.04]" : "bg-slate-50/80 border-slate-200";
    const chatListBg = isDark ? "bg-[#141414]/90" : "bg-white";
    const inputBg = isDark ? "bg-[#181818] border-white/[0.04] text-white" : "bg-slate-100 border-slate-200 text-slate-900";

    return (
        <div className={`${isDark ? "bg-[#0c0c0c] text-white" : "bg-slate-50 text-slate-900"} min-h-screen transition-colors duration-300 flex flex-col`}>
            <Sidebar activeId="inbox" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Topbar
                searchQuery=""
                onSearchChange={() => {}}
                searchPlaceholder="Search inbox..."
                onMenuToggle={() => setSidebarOpen(true)}
            />

            <main className="flex-1 lg:ml-64 pt-20 lg:pt-24 px-4 sm:px-6 lg:px-10 pb-6 flex flex-col max-h-[calc(100vh-1rem)] overflow-hidden">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                        <MessageSquare size={22} className="text-purple-500" /> Admin Support Inbox
                    </h2>
                    <p className={`text-xs ${textSecondary}`}>
                        Direct real-time conversations with tenants and property owners.
                    </p>
                </div>

                {/* Main Workspace split */}
                <div className={`flex-1 flex rounded-2xl border overflow-hidden ${surfaceBg} min-h-[500px] h-[calc(100vh-200px)]`}>
                    {/* Left Column: Conversations List */}
                    <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r ${isDark ? "border-white/[0.04]" : "border-slate-200"} ${chatListBg}`}>
                        {/* Search in conversations */}
                        <div className={`p-4 border-b flex gap-2 items-center ${isDark ? "border-white/[0.04]" : "border-slate-200"}`}>
                            <div className="relative flex-1">
                                <Search className={`absolute left-3 top-2.5 h-4 w-4 ${textSecondary}`} />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none transition-all ${inputBg}`}
                                />
                            </div>
                            <button
                                onClick={() => setShowStartChatModal(true)}
                                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center justify-center shrink-0"
                                title="Start Chat by Email"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Conversations list container */}
                        <div className="flex-1 overflow-y-auto space-y-1.5 p-3">
                            {isLoading && conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Loader2 className="animate-spin text-purple-500 mb-3" size={24} />
                                    <p className="text-xs text-zinc-500">Retrieving chats...</p>
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 p-4">
                                    <MessageCircle size={28} className="text-zinc-600 mb-2" />
                                    <p className="text-xs font-semibold">No direct conversations found</p>
                                    <p className="text-[10px] text-zinc-500 mt-1">Direct support tickets or user messages will appear here.</p>
                                </div>
                            ) : (
                                filteredConversations.map((conv) => {
                                    const isActive = conv.id === activeConversationId;
                                    const other = getOtherParticipant(conv);
                                    return (
                                        <motion.button
                                            key={conv.id}
                                            onClick={() => {
                                                dispatch(setActiveConversation(conv.id));
                                                if (!messages[conv.id]) dispatch(fetchMessages(conv.id));
                                            }}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`w-full text-left p-4 rounded-xl transition-all relative flex gap-3 ${
                                                isActive
                                                    ? isDark
                                                        ? "bg-[#201f1f]/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-purple-500/20"
                                                        : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100"
                                                    : isDark
                                                        ? "bg-transparent border border-transparent hover:bg-white/[0.02]"
                                                        : "bg-transparent border border-transparent hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-500/10 border border-purple-500/20 flex-shrink-0 flex items-center justify-center text-purple-500">
                                                {other?.profile_photo_url ? (
                                                    <img src={other.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold uppercase">{other?.full_name?.[0] ?? "?"}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <h4 className={`text-xs font-bold truncate ${textPrimary}`}>
                                                        {other?.full_name ?? "User"}
                                                    </h4>
                                                    {conv.last_message_at && (
                                                        <span className="text-[9px] text-zinc-500">
                                                            {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center gap-1.5 mt-0.5">
                                                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider ${
                                                        other?.role === "owner" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                                    }`}>
                                                        {other?.role ?? "User"}
                                                    </span>
                                                    {conv.room?.title && (
                                                        <span className={`text-[9px] truncate max-w-[120px] font-medium ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
                                                            {conv.room.title === "General Discussion" ? "Direct Chat" : conv.room.title}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-[10px] truncate mt-1 ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
                                                    {conv.last_message ?? "No messages yet"}
                                                </p>
                                            </div>
                                        </motion.button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Column: Chat view */}
                    <div className={`flex-1 flex flex-col ${isDark ? "bg-[#101010]/50" : "bg-slate-50/50"}`}>
                        {activeConversation ? (
                            <>
                                {/* Conversation Header */}
                                {(() => {
                                    const other = getOtherParticipant(activeConversation);
                                    return (
                                        <div className={`p-4 border-b flex flex-wrap gap-4 items-center justify-between ${headerBg}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5 flex-shrink-0 flex items-center justify-center bg-purple-500/10 text-purple-500">
                                                    {other?.profile_photo_url ? (
                                                        <img src={other.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold uppercase">{other?.full_name?.[0] ?? "?"}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className={`text-sm font-bold ${textPrimary}`}>{other?.full_name}</h3>
                                                    <div className="flex gap-2 items-center text-[10px] text-purple-400 font-semibold mt-0.5 flex-wrap">
                                                        <span className="uppercase tracking-wider font-extrabold">{other?.role}</span>
                                                        <span className="text-zinc-600">•</span>
                                                        {activeConversation.room && (
                                                            <>
                                                                <span className="text-xs font-bold text-purple-500">
                                                                    {activeConversation.room.title === "General Discussion" ? "Direct Chat" : activeConversation.room.title}
                                                                </span>
                                                                <span className="text-zinc-600">•</span>
                                                            </>
                                                        )}
                                                        <span>{other?.mobile_number ?? "No phone number listed"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Messages scrolling window */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                    {messages[activeConversation.id]?.map((msg) => {
                                        const isSelf = msg.sender_id === user?.id;

                                        return (
                                            <div key={msg.id} className={`flex ${isSelf ? "justify-end" : "justify-start"} group`}>
                                                <div className="max-w-[70%] flex flex-col gap-1.5">
                                                    <div className={`flex items-center gap-2 ${isSelf ? "justify-end" : "justify-start"}`}>
                                                        <span className="text-[10px] font-bold text-zinc-500">
                                                            {isSelf ? "You" : msg.sender?.full_name}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDelete(msg.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded"
                                                            title="Delete Message"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>

                                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                                        isSelf
                                                            ? isDark
                                                                ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-tr-none shadow-[0_4px_20px_rgba(147,51,234,0.2)]"
                                                                : "bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-tr-none shadow-[0_4px_20px_rgba(147,51,234,0.15)]"
                                                            : isDark
                                                                ? "bg-[#201f1f] text-zinc-200 border border-white/5 rounded-tl-none"
                                                                : "bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm"
                                                    }`}>
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                        <span className={`block text-[8px] mt-1 text-right ${isSelf ? "text-purple-200" : "opacity-50"}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Action bar at bottom: Send Message */}
                                <div className={`p-4 border-t ${isDark ? "border-white/[0.04]" : "border-slate-200"}`}>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Write your message..."
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                            className={`flex-1 px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-purple-500/50 transition-all ${inputBg}`}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={isSending || !inputText.trim()}
                                            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl flex items-center gap-1.5 transition-all text-sm font-bold disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-500/10"
                                        >
                                            {isSending ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Send size={16} />
                                                    <span>Send</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                                <MessageCircle size={40} className="text-zinc-700 mb-3 animate-pulse" />
                                <h3 className={`text-base font-bold mb-1 ${textPrimary}`}>Select a Conversation</h3>
                                <p className="text-xs max-w-sm">
                                    Click any active conversation thread on the left pane to chat directly in real-time.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Start Chat by Email Modal */}
            <AnimatePresence>
                {showStartChatModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-md p-6 rounded-2xl border ${isDark ? "bg-[#181818] border-white/5 text-white" : "bg-white border-slate-200 text-slate-900"} shadow-2xl`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-headline font-bold">Start New Chat</h3>
                                <button
                                    onClick={() => { setShowStartChatModal(false); setStartChatError(""); }}
                                    className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleStartChatByEmail} className="space-y-4">
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                                        User Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="tenant@example.com or owner@example.com"
                                        value={newChatEmail}
                                        onChange={(e) => setNewChatEmail(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                                            isDark
                                                ? "bg-[#121212] border-white/5 text-white focus:ring-1 focus:ring-purple-500/40"
                                                : "bg-slate-100 border-slate-200 text-slate-900 focus:ring-1 focus:ring-purple-600/40"
                                        }`}
                                    />
                                </div>

                                {startChatError && (
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                        <AlertCircle size={14} />
                                        <span>{startChatError}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isCreatingChat || !newChatEmail.trim()}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(147,51,234,0.3)]"
                                >
                                    {isCreatingChat ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Creating Chat...
                                        </>
                                    ) : (
                                        "Start Chat"
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AdminInbox() {
    return (
        <AdminThemeProvider>
            <AdminInboxContent />
        </AdminThemeProvider>
    );
}
