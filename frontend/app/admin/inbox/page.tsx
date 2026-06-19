"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import {
    fetchConversations,
    fetchMessages,
    sendMessage,
    setActiveConversation,
    deleteMessage,
    createConversationByEmail,
    pinConversation,
    muteConversation,
    blockConversation,
    unblockConversation
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
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Phone,
    MoreVertical,
    ShieldX,
    Volume2,
    VolumeX,
    Pin,
    Paperclip,
    Image,
    Video,
    FileText,
    MapPin
} from "lucide-react";
import api from "@/lib/api";

function BookingOfferCard({ bookingId, isDark }: { bookingId: string, isDark: boolean }) {
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchBooking = async () => {
            try {
                const res = await api.get("/bookings/tenant");
                if (res.data?.success && isMounted) {
                    const found = res.data.data.find((b: any) => b.id === bookingId);
                    setBooking(found);
                }
            } catch (err) {
                console.error("Error fetching booking details:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchBooking();
        return () => { isMounted = false; };
    }, [bookingId]);

    if (loading) {
        return (
            <div className="p-4 rounded-xl border border-dashed border-[#a27cff]/30 bg-[#a27cff]/5 animate-pulse text-xs text-[#a27cff]">
                Loading booking details...
            </div>
        );
    }

    if (!booking) return null;

    return (
        <div className={`p-4 rounded-xl border ${isDark ? "border-[#a27cff]/30 bg-[#1e1b29]" : "border-violet-200 bg-violet-50"} text-xs space-y-2`}>
            <div className="flex justify-between items-center">
                <span className="font-extrabold uppercase text-[#a27cff]">⚡ Direct Offer</span>
                <span className="capitalize font-bold text-zinc-400">{booking.status}</span>
            </div>
            <p className="font-bold text-sm">{booking.room?.title}</p>
            <p className="text-zinc-400">Rent amount: <span className="text-[#a27cff] font-extrabold">PKR {booking.room?.price ?? booking.room?.rent_amount} / month</span></p>
        </div>
    );
}

export default function AdminInbox() {
    const { isDark, searchQuery, setSearchQuery } = useAdminTheme();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const { conversations, messages, activeConversationId, isLoading, isSending, error, typing } = useAppSelector((s) => s.chat);

    const [inputText, setInputText] = useState("");
    const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isSendingTyping, setIsSendingTyping] = useState(false);

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

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && activeConversationId) {
            await dispatch(sendMessage({ conversationId: activeConversationId, content: "Shared an image", files: [file] }));
        }
    };

    const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && activeConversationId) {
            await dispatch(sendMessage({ conversationId: activeConversationId, content: "Shared a video", files: [file] }));
        }
    };

    const handleAttachmentSelect = async (type: "image" | "location" | "video") => {
        setShowAttachmentMenu(false);
        if (!activeConversationId) return;

        if (type === "image") {
            imageInputRef.current?.click();
        } else if (type === "location") {
            setInputText("📍 Shared Location: Phase 5 DHA, Lahore, Pakistan (31.4697° N, 74.4084° E)");
        } else if (type === "video") {
            videoInputRef.current?.click();
        }
    };

    // Initial Fetch of all conversations
    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const conversationIds = useMemo(() => conversations.map((c) => c.id), [conversations]);
    const { socket } = useSocket(conversationIds);

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
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (socket) {
            socket.emit("stop_typing", { conversationId: activeConversationId });
        }
        setIsSendingTyping(false);

        await dispatch(sendMessage({ conversationId: activeConversationId, content }));
    };

    const handleInputChange = (val: string) => {
        setInputText(val);
        if (!activeConversationId || !socket) return;
        if (!isSendingTyping) {
            setIsSendingTyping(true);
            socket.emit("typing", { conversationId: activeConversationId });
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", { conversationId: activeConversationId });
            setIsSendingTyping(false);
        }, 2000);
    };

    const handleDelete = async (messageId: string) => {
        if (confirm("Are you sure you want to delete this message?")) {
            await dispatch(deleteMessage(messageId));
        }
    };

    // Styling constants mapped to tenant-grade design tokens
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313]" : "bg-white border border-slate-200 shadow-sm";
    const divider = isDark ? "border-white/5" : "border-slate-200";
    const inputBg = isDark ? "bg-[#1d1b26] text-white placeholder:text-zinc-600" : "bg-slate-100 text-slate-900 placeholder:text-slate-400";
    const headerBg = isDark ? "bg-[#1b1926]/90 border-white/5 backdrop-blur-xl" : "bg-slate-50/80 border-slate-200";

    return (
        <main className="flex-1 ml-0 pt-20 lg:pt-24 px-0 sm:px-6 lg:px-10 pb-0 sm:pb-6 flex flex-col overflow-hidden max-w-[1400px] mx-auto w-full">
            {/* Header */}
            <div className="mb-4 px-4 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                    <MessageSquare size={22} className="text-purple-500" /> Admin Support Inbox
                </h2>
                <p className={`text-xs ${textVariant}`}>
                    Manage active direct chat support tickets with tenants and owners in real-time.
                </p>
            </div>

            {/* Main Bento split */}
            <div className="w-full h-[calc(110vh-12rem)] md:h-[calc(110vh-14rem)] lg:h-[calc(110vh-15rem)] flex flex-col md:flex-row gap-4 md:gap-6 pb-2 overflow-hidden">
                {/* Left Panel: Conversations List */}
                <div className={`w-full md:w-80 lg:w-96 ${activeConversationId ? "hidden md:flex" : "flex"} flex-col rounded-none md:rounded-2xl overflow-hidden shrink-0 ${surfaceLow}`}>
                    {/* Search & Actions */}
                    <div className={`p-5 border-b ${divider}`}>
                        <div className="flex gap-2 mb-3 items-center justify-between">
                            <h4 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>Inbox Threads</h4>
                            <button
                                onClick={() => setShowStartChatModal(true)}
                                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25"
                                title="Start Chat by Email"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${textVariant}`} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border-none outline-none focus:ring-1 focus:ring-purple-500/50 transition-all ${inputBg}`}
                            />
                        </div>
                    </div>

                    {/* Conversations list container */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 p-3">
                        {isLoading && conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Loader2 className="animate-spin text-purple-500 mb-3" size={24} />
                                <p className="text-xs text-zinc-500">Retrieving support threads...</p>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 p-4">
                                <MessageCircle size={28} className="text-zinc-600 mb-2" />
                                <p className="text-xs font-semibold">No support tickets found</p>
                                <p className="text-[10px] text-zinc-500 mt-1">Direct support chat threads will show here.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filteredConversations.map((conv) => {
                                    const isActive = conv.id === activeConversationId;
                                    const other = getOtherParticipant(conv);
                                    return (
                                        <motion.button
                                            key={conv.id}
                                            onClick={() => {
                                                dispatch(setActiveConversation(conv.id));
                                            }}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`w-full text-left p-4 rounded-xl transition-all relative flex gap-3 border ${isActive
                                                    ? isDark
                                                        ? "bg-purple-500/10 border-purple-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.15)]"
                                                        : "bg-violet-50 border-violet-200"
                                                    : isDark
                                                        ? "bg-transparent border-transparent hover:bg-white/5"
                                                        : "bg-transparent border-transparent hover:bg-slate-50"
                                                }`}
                                        >
                                            {conv.unread_count > 0 && (
                                                <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-purple-500 rounded-full" />
                                            )}
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
                                                        <span className={`text-[9px] ${textVariant}`}>
                                                            {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center gap-1.5 mt-0.5">
                                                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider ${other?.role === "owner" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                                        }`}>
                                                        {other?.role ?? "User"}
                                                    </span>
                                                    {conv.room?.title && (
                                                        <span className={`text-[9px] truncate max-w-[120px] font-medium ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
                                                            {conv.room.title === "General Discussion" ? "Direct Chat" : conv.room.title}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-[10px] truncate mt-2 ${isActive ? "text-zinc-300" : textVariant}`}>
                                                    {conv.last_message ?? "No messages yet"}
                                                </p>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Right Panel: Chat view */}
                <div className={`flex-1 min-h-0 ${activeConversationId ? "flex" : "hidden md:flex"} flex-col rounded-none md:rounded-2xl overflow-hidden ${surfaceLow}`}>
                    {activeConversation ? (
                        <>
                            {/* Conversation Header */}
                            {(() => {
                                const other = getOtherParticipant(activeConversation);
                                return (
                                    <div className={`p-4 border-b flex items-center justify-between relative z-20 ${headerBg}`}>
                                        <div className="flex items-center gap-3">
                                            {/* Back button on mobile */}
                                            <button
                                                onClick={() => dispatch(setActiveConversation(null))}
                                                className={`p-2 -ml-2 rounded-xl transition-all md:hidden ${isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}
                                                title="Back to Chats"
                                            >
                                                <ArrowLeft size={18} />
                                            </button>
                                            <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/5 flex-shrink-0 flex items-center justify-center bg-purple-500/10 text-purple-500">
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

                                        {/* Action modifiers dropdown */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowHeaderDropdown(!showHeaderDropdown)}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            <AnimatePresence>
                                                {showHeaderDropdown && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 4, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className={`absolute right-0 top-full mt-2 w-48 rounded-2xl shadow-2xl border p-2 flex flex-col gap-1 z-[200] ${isDark ? "bg-[#1d1b26] border-white/10" : "bg-white border-slate-200"
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={async () => {
                                                                setShowHeaderDropdown(false);
                                                                const isPinned = !activeConversation.is_pinned;
                                                                await dispatch(pinConversation({ conversationId: activeConversation.id, isPinned }));
                                                            }}
                                                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap w-full ${isDark ? "hover:bg-white/5 text-zinc-300" : "hover:bg-slate-50 text-slate-700"
                                                                }`}
                                                        >
                                                            <Pin size={14} className={activeConversation.is_pinned ? "text-purple-400 fill-purple-400" : ""} />
                                                            <span>{activeConversation.is_pinned ? "Unpin Support Chat" : "Pin Support Chat"}</span>
                                                        </button>

                                                        <button
                                                            onClick={async () => {
                                                                setShowHeaderDropdown(false);
                                                                const isMuted = !activeConversation.is_muted;
                                                                await dispatch(muteConversation({ conversationId: activeConversation.id, isMuted }));
                                                            }}
                                                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap w-full ${isDark ? "hover:bg-white/5 text-zinc-300" : "hover:bg-slate-50 text-slate-700"
                                                                }`}
                                                        >
                                                            {activeConversation.is_muted ? <Volume2 size={14} className="text-purple-400" /> : <VolumeX size={14} className="text-zinc-500" />}
                                                            <span>{activeConversation.is_muted ? "Unmute Alerts" : "Mute Alerts"}</span>
                                                        </button>

                                                        <div className={`h-px my-1 ${divider}`} />

                                                        <button
                                                            onClick={async () => {
                                                                setShowHeaderDropdown(false);
                                                                if (activeConversation.is_blocked) {
                                                                    await dispatch(unblockConversation(activeConversation.id));
                                                                } else {
                                                                    await dispatch(blockConversation(activeConversation.id));
                                                                }
                                                            }}
                                                            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap w-full text-red-500 hover:bg-red-500/10"
                                                        >
                                                            <ShieldX size={14} />
                                                            <span>{activeConversation.is_blocked ? "Unblock Contact" : "Block Contact"}</span>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Messages scrolling window */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
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

                                                <div className="flex flex-col gap-2">
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="rounded-xl overflow-hidden max-w-xs border border-white/5 shadow-md flex flex-col gap-1">
                                                            {msg.attachments.map((att: any) => {
                                                                if (att.file_type === "image") {
                                                                    return (
                                                                        <img
                                                                            key={att.id}
                                                                            src={att.file_url}
                                                                            alt={att.file_name}
                                                                            className="w-full object-cover max-h-48 cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
                                                                            onClick={() => window.open(att.file_url, "_blank")}
                                                                        />
                                                                    );
                                                                } else if (att.file_type === "video") {
                                                                    return (
                                                                        <video
                                                                            key={att.id}
                                                                            src={att.file_url}
                                                                            controls
                                                                            className="w-full max-h-48 object-cover rounded-lg"
                                                                        />
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <a
                                                                            key={att.id}
                                                                            href={att.file_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-xs rounded-xl"
                                                                        >
                                                                            <FileText size={16} className="text-purple-400" />
                                                                            <span className="truncate max-w-[150px]">{att.file_name}</span>
                                                                        </a>
                                                                    );
                                                                }
                                                            })}
                                                        </div>
                                                    )}
                                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isSelf
                                                        ? isDark
                                                            ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-tr-none shadow-[0_4px_20px_rgba(147,51,234,0.2)]"
                                                            : "bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-tr-none shadow-[0_4px_20px_rgba(147,51,234,0.15)]"
                                                        : isDark
                                                            ? "bg-[#201f1f] text-zinc-200 border border-white/5 rounded-tl-none"
                                                            : "bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm"
                                                        }`}>
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center gap-1 mt-1 ${isSelf ? "flex-row-reverse" : ""}`}>
                                                    <span className={`text-[8px] ${textVariant}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isSelf && (
                                                        <CheckCircle size={10} className="text-purple-400" fill="currentColor" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {activeConversationId && typing && typing[activeConversationId] && (
                                    <div className="flex justify-start px-1">
                                        <div className="max-w-[70%] flex flex-col gap-1.5">
                                            <div className={`px-4 py-3.5 rounded-2xl ${isDark ? "bg-[#201f1f] text-zinc-200 border border-white/5" : "bg-white text-slate-800 border border-slate-100 shadow-sm"} rounded-tl-none`}>
                                                <div className="flex gap-1 items-center justify-center h-4 w-9">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Action bar at bottom: Send Message & Attachments */}
                            <div className={`p-4 border-t ${divider}`}>
                                <div className="flex gap-2 items-center relative">
                                    {/* Hidden File Inputs */}
                                    <input
                                        type="file"
                                        ref={imageInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <input
                                        type="file"
                                        ref={videoInputRef}
                                        onChange={handleVideoChange}
                                        accept="video/*"
                                        className="hidden"
                                    />

                                    {/* Paperclip button */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isDark ? "bg-[#1d1b26] text-zinc-400 hover:text-purple-400" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                                        >
                                            <Paperclip size={18} />
                                        </button>

                                        <AnimatePresence>
                                            {showAttachmentMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 4, scale: 1 }}
                                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    className={`absolute left-0 bottom-full mb-2 w-40 rounded-2xl shadow-2xl border p-2 flex flex-col gap-1 z-50 ${isDark ? "bg-[#1b1926] border-white/5" : "bg-white border-slate-200"
                                                        }`}
                                                >
                                                    <button
                                                        onClick={() => handleAttachmentSelect("image")}
                                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isDark ? "hover:bg-white/5 text-zinc-300" : "hover:bg-slate-50 text-slate-700"}`}
                                                    >
                                                        <Image size={14} className="text-purple-400" />
                                                        <span>Send Photo</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAttachmentSelect("video")}
                                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isDark ? "hover:bg-white/5 text-zinc-300" : "hover:bg-slate-50 text-slate-700"}`}
                                                    >
                                                        <Video size={14} className="text-indigo-400" />
                                                        <span>Send Video</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAttachmentSelect("location")}
                                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isDark ? "hover:bg-white/5 text-zinc-300" : "hover:bg-slate-50 text-slate-700"}`}
                                                    >
                                                        <MapPin size={14} className="text-emerald-400" />
                                                        <span>Share Location</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Write your support message..."
                                        value={inputText}
                                        onChange={(e) => handleInputChange(e.target.value)}
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
                                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${isDark
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
        </main>
    );
}
