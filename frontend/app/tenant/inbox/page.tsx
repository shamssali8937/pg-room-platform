"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchConversations, fetchMessages, sendMessage,
    setActiveConversation, blockConversation, deleteMessage
} from "@/store/slices/chatSlice";
import type { Conversation } from "@/store/slices/chatSlice";
import {
    Send, Paperclip, Search, MessageSquare, Loader2,
    AlertCircle, Phone, MoreVertical, CheckCircle, Filter,
    ShieldX, Image, MapPin, Video, FileText, Trash2
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
                Loading Booking Offer details...
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400">
                Booking Offer not found or cancelled.
            </div>
        );
    }

    const isApproved = booking.status === "approved";
    const isCancelled = booking.status === "cancelled";

    return (
        <div className={`p-5 rounded-2xl border ${isDark ? "border-[#a27cff]/30 bg-[#1e1b29]/80" : "border-violet-200 bg-violet-50/80"} shadow-lg flex flex-col gap-4 max-w-sm text-left`}>
            <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isDark ? "bg-[#a27cff]/20 text-[#a27cff]" : "bg-violet-100 text-violet-600"}`}>
                    ⚡ Booking Offer
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isApproved ? "bg-emerald-500/20 text-emerald-400" :
                    isCancelled ? "bg-red-500/20 text-red-400" :
                    "bg-amber-500/20 text-amber-400 animate-pulse"
                }`}>
                    {booking.status}
                </span>
            </div>
            
            <div className="space-y-1">
                <h5 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-800"}`}>
                    {booking.room?.title ?? "Room Booking"}
                </h5>
                <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                    Rent Amount: <span className="font-extrabold text-[#a27cff]">PKR {booking.room?.rent_amount ?? "N/A"} / month</span>
                </p>
            </div>

            <div className={`p-3 rounded-xl ${isDark ? "bg-[#252233]" : "bg-white"} border ${isDark ? "border-white/5" : "border-slate-100"} text-xs space-y-1.5`}>
                <p className={`${isDark ? "text-zinc-300" : "text-slate-600"}`}>
                    <strong className="text-[#a27cff]">Tenant:</strong> {booking.tenant?.full_name}
                </p>
                <p className={`${isDark ? "text-zinc-300" : "text-slate-600"}`}>
                    <strong className="text-[#a27cff]">Contact:</strong> {booking.tenant?.mobile_number ?? "N/A"}
                </p>
            </div>
        </div>
    );
}

export default function TenantInbox() {
    const { isDark } = useTenantTheme();
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const { conversations, messages, activeConversationId, isLoading, isSending, error } = useAppSelector((s) => s.chat);

    const [inputText, setInputText] = useState("");
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setInputText(`🖼️ Shared an Image: https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600 [file: ${file.name}]`);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setInputText(`🎥 Shared a Video: property_walkthrough.mp4 [file: ${file.name}]`);
        }
    };

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? conversations[0] ?? null;

    useEffect(() => {
        if (activeConversation?.id && !messages[activeConversation.id]) {
            dispatch(fetchMessages(activeConversation.id));
        }
        if (activeConversation && !activeConversationId) {
            dispatch(setActiveConversation(activeConversation.id));
        }
    }, [activeConversation?.id, dispatch, activeConversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeConversationId]);

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313]" : "bg-white border border-slate-200";
    const divider = isDark ? "border-white/5" : "border-slate-200";
    const inputBg = isDark ? "bg-[#131313] text-white placeholder:text-zinc-600" : "bg-slate-100 text-slate-900 placeholder:text-slate-400";

    const filteredConversations = conversations.filter((c) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const other = c.participants.find((p) => p.id !== user?.id);
        return (
            other?.full_name?.toLowerCase().includes(q) ||
            c.room?.title?.toLowerCase().includes(q) ||
            c.last_message?.toLowerCase().includes(q)
        );
    });

    const handleSend = async () => {
        if (!inputText.trim() || !activeConversationId) return;
        const content = inputText.trim();
        setInputText("");
        await dispatch(sendMessage({ conversationId: activeConversationId, content }));
    };

    const handleBlock = async (conversationId: string) => {
        await dispatch(blockConversation(conversationId));
    };

    const handleAttachmentSelect = async (type: "image" | "location" | "video" | "offer") => {
        setShowAttachmentMenu(false);
        if (!activeConversationId) return;

        if (type === "image") {
            imageInputRef.current?.click();
        } else if (type === "location") {
            setInputText("📍 Shared Location: Phase 5 DHA, Lahore, Pakistan (31.4697° N, 74.4084° E)");
        } else if (type === "video") {
            videoInputRef.current?.click();
        } else if (type === "offer") {
            if (!activeConversation?.room?.id) return;
            try {
                const res = await api.post(`/bookings/room/${activeConversation.room.id}`, {
                    request_type: "booking",
                    message: `Automated booking offer from ${user?.full_name}`
                });
                if (res.data?.success && res.data?.data?.id) {
                    const bookingId = res.data.data.id;
                    setInputText(`✨ Automated Booking Offer (Draft): Let's lock this! [BOOKING_OFFER] booking_id: ${bookingId}`);
                }
            } catch (err) {
                console.error("Failed to create booking offer:", err);
            }
        }
    };

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants.find((p) => p.id !== user?.id) ?? conv.participants[0];
    };

    const activeMessages = activeConversationId ? (messages[activeConversationId] ?? []) : [];

    return (
        <div className="max-w-[1400px] mx-auto h-[calc(100vh-5rem)] flex flex-col md:flex-row gap-6 pl-14 xl:pl-0 pb-24 lg:pb-0">

            {/* Left Panel: Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 flex flex-col rounded-2xl overflow-hidden shrink-0 ${surfaceLow}`}>
                {/* Header */}
                <div className={`p-5 border-b ${divider}`}>
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <h3 className={`text-xl font-headline font-extrabold tracking-tight ${textPrimary}`}>Inbox</h3>
                            <p className={`text-xs mt-0.5 ${textVariant}`}>
                                {conversations.reduce((a, c) => a + c.unread_count, 0)} unread
                            </p>
                        </div>
                        <button className={`p-2 rounded-lg transition-colors ${isDark ? "text-zinc-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}>
                            <Filter size={16} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textVariant}`} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-sm border-none outline-none focus:ring-1 focus:ring-[#a27cff]/40 ${inputBg}`}
                        />
                    </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto space-y-1 p-3">
                    {isLoading ? (
                        <div className="space-y-2 p-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`h-16 rounded-xl animate-pulse ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`} />
                            ))}
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                            <MessageSquare size={28} className={textVariant} />
                            <p className={`text-sm mt-2 font-bold ${textPrimary}`}>No conversations</p>
                            <p className={`text-xs mt-1 ${textVariant}`}>Message a landlord from a listing</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredConversations.map((conv) => {
                                const other = getOtherParticipant(conv);
                                const isActive = conv.id === activeConversationId;
                                return (
                                    <motion.button
                                        key={conv.id}
                                        onClick={() => {
                                            dispatch(setActiveConversation(conv.id));
                                            if (!messages[conv.id]) dispatch(fetchMessages(conv.id));
                                        }}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`w-full text-left p-4 rounded-xl transition-all relative ${
                                            isActive
                                                ? isDark ? "bg-[#a27cff]/10 border border-[#a27cff]/20" : "bg-violet-50 border border-violet-200"
                                                : isDark ? "hover:bg-white/5 border border-transparent" : "hover:bg-slate-50 border border-transparent"
                                        }`}
                                    >
                                        {conv.unread_count > 0 && (
                                            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-[#a27cff] rounded-full" />
                                        )}
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 shrink-0">
                                                    {other?.profile_photo_url || other?.image ? (
                                                        <img
                                                            src={other.profile_photo_url || other.image || ""}
                                                            alt={other.full_name}
                                                            className="w-9 h-9 rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-[#a27cff]/20" : "bg-violet-100"}`}>
                                                            <span className="text-[#a27cff] text-sm font-bold">{other?.full_name?.[0] ?? "?"}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${textPrimary}`}>{other?.full_name ?? "Unknown"}</p>
                                                    {conv.room && (
                                                        <p className={`text-[10px] truncate max-w-[130px] ${conv.unread_count > 0 ? "text-[#a27cff]" : textVariant}`}>
                                                            {conv.room.title}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                {conv.last_message_at && (
                                                    <span className={`text-[10px] block ${textVariant}`}>
                                                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                )}
                                                {conv.unread_count > 0 && (
                                                    <span className="min-w-[18px] h-[18px] bg-[#a27cff] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 ml-auto mt-1">
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {conv.last_message && (
                                            <p className={`text-xs line-clamp-1 mt-2 ${textVariant}`}>{conv.last_message}</p>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Right Panel: Chat Window */}
            {activeConversation ? (
                <div className={`flex-1 flex flex-col rounded-2xl overflow-hidden ${surfaceLow}`}>
                    {/* Chat Header */}
                    <div className={`p-5 flex items-center justify-between border-b ${isDark ? "border-white/5 bg-[#201f1f]/60 backdrop-blur-xl" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center gap-4">
                            <div className="relative w-11 h-11 shrink-0">
                                {getOtherParticipant(activeConversation)?.profile_photo_url || getOtherParticipant(activeConversation)?.image ? (
                                    <img
                                        src={getOtherParticipant(activeConversation)?.profile_photo_url || getOtherParticipant(activeConversation)?.image || ""}
                                        alt={getOtherParticipant(activeConversation)?.full_name}
                                        className="w-11 h-11 rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? "bg-[#a27cff]/20" : "bg-violet-100"}`}>
                                        <span className="text-[#a27cff] text-lg font-bold">
                                            {getOtherParticipant(activeConversation)?.full_name?.[0] ?? "?"}
                                        </span>
                                    </div>
                                )}
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#131313]" />
                            </div>
                            <div>
                                <h4 className={`font-headline font-bold text-base ${textPrimary}`}>
                                    {getOtherParticipant(activeConversation)?.full_name ?? "Unknown"}
                                </h4>
                                {activeConversation.room && (
                                    <p className="text-[10px] font-bold text-[#a27cff] uppercase tracking-widest">
                                        {activeConversation.room.title}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {getOtherParticipant(activeConversation)?.mobile_number && (
                                <a
                                    href={`tel:${getOtherParticipant(activeConversation).mobile_number}`}
                                    title={`Call ${getOtherParticipant(activeConversation).full_name}`}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-white/5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10" : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-400"}`}
                                >
                                    <Phone size={16} />
                                </a>
                            )}
                            <div className="relative animate-fade-in">
                                <button
                                    onClick={() => setShowHeaderDropdown(!showHeaderDropdown)}
                                    title="More Options"
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                                >
                                    <MoreVertical size={16} />
                                </button>
                                <AnimatePresence>
                                    {showHeaderDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 4, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className={`absolute right-0 top-full mt-1 w-44 rounded-xl shadow-xl border p-1.5 flex flex-col gap-1 z-50 ${
                                                isDark ? "bg-[#1d1b26] border-white/10" : "bg-white border-slate-200"
                                            }`}
                                        >
                                            <button
                                                onClick={() => {
                                                    setShowHeaderDropdown(false);
                                                    handleBlock(activeConversation.id);
                                                }}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left text-red-500 hover:bg-red-500/10 w-full`}
                                            >
                                                <ShieldX size={14} />
                                                Block Contact
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        {activeMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className={`text-sm ${textVariant}`}>No messages yet. Say hello!</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-center">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full ${isDark ? "bg-[#201f1f] text-zinc-600" : "bg-slate-100 text-slate-400"}`}>
                                        Today
                                    </span>
                                </div>
                                {activeMessages.map((msg) => {
                                    const isMine = msg.sender_id === user?.id;
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex items-end gap-3 ${isMine ? "flex-row-reverse" : ""}`}
                                        >
                                            <div className="w-8 h-8 shrink-0">
                                                {msg.sender?.profile_photo_url || msg.sender?.image ? (
                                                    <img
                                                        src={msg.sender.profile_photo_url || msg.sender.image || ""}
                                                        alt={msg.sender?.full_name}
                                                        className="w-8 h-8 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-[#a27cff]/20" : "bg-violet-100"}`}>
                                                        <span className="text-[#a27cff] text-[10px] font-bold">
                                                            {msg.sender?.full_name?.[0] ?? "?"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col relative group`}>
                                                {isMine && (
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm("Delete message for everyone?")) {
                                                                await dispatch(deleteMessage(msg.id));
                                                            }
                                                        }}
                                                        className={`absolute ${msg.content?.includes("[BOOKING_OFFER]") ? "-left-12" : "-left-8"} top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10`}
                                                        title="Delete message"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                                {msg.content?.includes("[BOOKING_OFFER]") ? (
                                                    <BookingOfferCard
                                                        bookingId={msg.content.match(/booking_id:\s*([a-f0-9\-]+)/i)?.[1] ?? ""}
                                                        isDark={isDark}
                                                    />
                                                ) : (
                                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                                        isMine
                                                            ? isDark
                                                                ? "bg-[#a27cff]/15 text-white border border-[#a27cff]/20 rounded-tr-none"
                                                                : "bg-violet-100 text-slate-900 rounded-tr-none"
                                                            : isDark
                                                            ? "bg-[#201f1f] text-[#adaaaa] rounded-tl-none"
                                                            : "bg-slate-100 text-slate-700 rounded-tl-none"
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                )}
                                                <div className={`flex items-center gap-1 mt-1 ${isMine ? "flex-row-reverse" : ""}`}>
                                                    <span className={`text-[10px] ${textVariant}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                    {isMine && (
                                                        <CheckCircle size={12} className="text-[#a27cff]" fill="currentColor" />
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={`p-4 border-t ${isDark ? "border-white/5 bg-[#201f1f]/60 backdrop-blur-xl" : "border-slate-200 bg-white"}`}>
                        <div className={`flex items-center gap-3 rounded-2xl px-3 py-2 focus-within:ring-1 focus-within:ring-[#a27cff]/40 transition-all ${isDark ? "bg-[#131313]" : "bg-slate-100"}`}>
                            <div className="relative shrink-0 flex items-center">
                                <button
                                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                                    title="Attachments"
                                    className={`transition-colors ${textVariant} hover:text-[#a27cff] p-1`}
                                >
                                    <Paperclip size={18} />
                                </button>
                                <AnimatePresence>
                                    {showAttachmentMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: -8, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className={`absolute bottom-full left-0 mb-2 w-48 rounded-xl shadow-xl border p-2 flex flex-col gap-1 z-50 ${
                                                isDark ? "bg-[#1d1b26] border-white/10" : "bg-white border-slate-200"
                                            }`}
                                        >
                                            <button
                                                onClick={() => handleAttachmentSelect("image")}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                                                    isDark ? "text-zinc-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-[#a27cff]"
                                                }`}
                                            >
                                                <Image size={14} className="text-[#a27cff]" />
                                                Send Image
                                            </button>
                                            <button
                                                onClick={() => handleAttachmentSelect("location")}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                                                    isDark ? "text-zinc-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-[#a27cff]"
                                                }`}
                                            >
                                                <MapPin size={14} className="text-[#a27cff]" />
                                                Send Location
                                            </button>
                                            <button
                                                onClick={() => handleAttachmentSelect("video")}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                                                    isDark ? "text-zinc-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-[#a27cff]"
                                                }`}
                                            >
                                                <Video size={14} className="text-[#a27cff]" />
                                                Send Video
                                            </button>
                                            {activeConversation?.room && (
                                                <button
                                                    onClick={() => handleAttachmentSelect("offer")}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                                                        isDark ? "text-zinc-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-[#a27cff]"
                                                    }`}
                                                >
                                                    <FileText size={14} className="text-[#a27cff]" />
                                                    Send Booking Offer
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                placeholder={`Message ${getOtherParticipant(activeConversation)?.full_name ?? "..."}...`}
                                className={`flex-1 bg-transparent border-none outline-none text-sm ${isDark ? "text-white placeholder:text-zinc-600" : "text-slate-900 placeholder:text-slate-400"}`}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isSending || !inputText.trim()}
                                className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#a27cff] to-[#6e3bd7] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 shadow-[0_4px_14px_rgba(162,124,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} fill="currentColor" />}
                            </button>
                        </div>
                    </div>
                    <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                    <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoChange} />
                </div>
            ) : (
                <div className={`flex-1 flex flex-col items-center justify-center rounded-2xl ${surfaceLow}`}>
                    <MessageSquare size={48} className={textVariant} />
                    <p className={`mt-4 font-bold text-lg ${textPrimary}`}>Select a conversation</p>
                    <p className={`text-sm mt-1 ${textVariant}`}>Choose from the left panel to start messaging</p>
                </div>
            )}
        </div>
    );
}
