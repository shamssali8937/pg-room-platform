"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { useAuth } from "@/context/AuthContext";
import AlertModal from "@/components/AlertModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchConversations, fetchMessages, sendMessage,
    setActiveConversation, blockConversation, deleteMessage,
    createConversationByEmail, pinConversation, muteConversation, unblockConversation
} from "@/store/slices/chatSlice";
import type { Conversation } from "@/store/slices/chatSlice";
import { useSocket } from "@/hooks/useSocket";
import {
    Send, Paperclip, Search, MessageSquare, Loader2,
    AlertCircle, Phone, MoreVertical, CheckCircle, Filter,
    ShieldX, Image, MapPin, Video, FileText, Trash2, Plus, X,
    ArrowLeft, Pin, Volume2, VolumeX
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
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isApproved ? "bg-emerald-500/20 text-emerald-400" :
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
                    Rent Amount: <span className="font-extrabold text-[#a27cff]">PKR {(booking.rent_amount ?? booking.room?.rent_amount ?? 0).toLocaleString()} / month</span>
                </p>
                {booking.requested_date && (
                    <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                        Requested Move-In: <span className="font-bold text-[#a27cff]">{new Date(booking.requested_date).toLocaleDateString()}</span>
                    </p>
                )}
            </div>

            <div className={`p-3 rounded-xl ${isDark ? "bg-[#252233]" : "bg-white"} border ${isDark ? "border-white/5" : "border-slate-100"} text-xs space-y-1.5`}>
                <p className={`${isDark ? "text-zinc-300" : "text-slate-600"}`}>
                    <strong className="text-[#a27cff]">Owner:</strong> {booking.room?.owner?.full_name ?? "Room Owner"}
                </p>
                <p className={`${isDark ? "text-zinc-300" : "text-slate-600"}`}>
                    <strong className="text-[#a27cff]">Status Note:</strong> {booking.owner_note ?? "Awaiting confirmation from host."}
                </p>
            </div>
        </div>
    );
}

export default function TenantInboxPage() {
    const { isDark, searchQuery, setSearchQuery } = useTenantTheme();
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const { conversations, messages, activeConversationId, isLoading, isSending, error, typing } = useAppSelector((s) => s.chat);

    const [inputText, setInputText] = useState("");
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isSendingTyping, setIsSendingTyping] = useState(false);
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });

    const [showStartChatModal, setShowStartChatModal] = useState(false);
    const [newChatEmail, setNewChatEmail] = useState("");
    const [startChatError, setStartChatError] = useState("");
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    // Booking Offer/Request Modal states
    const [showBookingOfferModal, setShowBookingOfferModal] = useState(false);
    const [offerPrice, setOfferPrice] = useState("");
    const [offerDate, setOfferDate] = useState("");
    const [offerMessage, setOfferMessage] = useState("");
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

    const handleSendBookingOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeConversation?.room?.id || isSubmittingOffer) return;
        const status = user?.account_status?.toLowerCase();
        if (status === "suspended" || status === "banned") {
            setAlertModal({
                isOpen: true,
                message: "Your account is suspended or banned. You cannot send booking offers."
            });
            return;
        }
        setIsSubmittingOffer(true);
        try {
            const res = await api.post(`/bookings/room/${activeConversation.room.id}`, {
                message: offerMessage || `Booking request via chat`,
                rent_amount: Number(offerPrice),
                requested_date: offerDate,
            });
            if (res.data?.success && res.data?.data?.id) {
                const bookingId = res.data.data.id;
                await dispatch(sendMessage({
                    conversationId: activeConversationId!,
                    content: `[BOOKING_OFFER] booking_id: ${bookingId}`
                }));
                setShowBookingOfferModal(false);
                setOfferPrice("");
                setOfferDate("");
                setOfferMessage("");
            }
        } catch (err) {
            console.error("Failed to create booking offer:", err);
        } finally {
            setIsSubmittingOffer(false);
        }
    };

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

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const conversationIds = useMemo(() => conversations.map((c) => c.id), [conversations]);
    const { socket } = useSocket(conversationIds);

    const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

    useEffect(() => {
        if (activeConversationId) {
            dispatch(fetchMessages(activeConversationId));
        }
    }, [activeConversationId, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeConversationId]);

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313]" : "bg-white border border-slate-200 shadow-sm";
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
            const status = user?.account_status?.toLowerCase();
            if (status === "suspended" || status === "banned") {
                setAlertModal({
                    isOpen: true,
                    message: "Your account is suspended or banned. You cannot send booking offers."
                });
                return;
            }
            setOfferPrice((activeConversation.room as any).rent_amount?.toString() || (activeConversation.room as any).price?.toString() || "");
            setOfferDate(new Date().toISOString().split("T")[0]);
            setOfferMessage(`Booking request via chat.`);
            setShowBookingOfferModal(true);
        }
    };

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants.find((p) => p.id !== user?.id) ?? conv.participants[0];
    };

    const activeMessages = activeConversationId ? (messages[activeConversationId] ?? []) : [];
    const isOnline = activeConversation?.other_participant?.is_online;

    return (
        <div className="max-w-[1400px] mx-auto h-[calc(110vh-12rem)] md:h-[calc(110vh-14rem)] lg:h-[calc(110vh-15rem)] flex flex-col md:flex-row gap-4 md:gap-6 pb-2 overflow-hidden">
            {/* Left Panel: Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 ${activeConversationId ? "hidden md:flex" : "flex"} flex-col rounded-none md:rounded-2xl overflow-hidden shrink-0 ${surfaceLow}`}>
                {/* Header */}
                <div className={`p-5 border-b ${divider}`}>
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <h3 className={`text-xl font-headline font-extrabold tracking-tight ${textPrimary}`}>Inbox</h3>
                            <p className={`text-xs mt-0.5 ${textVariant}`}>
                                {conversations.reduce((a, c) => a + c.unread_count, 0)} unread
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowStartChatModal(true)}
                                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center shadow-lg shadow-purple-500/25"
                                title="Start Chat by Email"
                            >
                                <Plus size={16} />
                            </button>
                            <button className={`p-2 rounded-lg transition-colors ${isDark ? "text-zinc-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}>
                                <Filter size={16} />
                            </button>
                        </div>
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
                    {isLoading && conversations.length === 0 ? (
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
                                        }}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`w-full text-left p-4 rounded-xl transition-all relative border ${isActive
                                            ? isDark ? "bg-[#a27cff]/10 border-[#a27cff]/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]" : "bg-violet-50 border-violet-200"
                                            : isDark ? "bg-transparent border-transparent hover:bg-white/5" : "hover:bg-slate-50 border-transparent"
                                            }`}
                                    >
                                        {conv.unread_count > 0 && (
                                            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-[#a27cff] rounded-full" />
                                        )}
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 shrink-0 relative">
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
                                                    {conv.other_participant?.is_online && (
                                                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#131313]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className={`text-sm font-bold truncate max-w-[100px] ${textPrimary}`}>{other?.full_name ?? "Unknown"}</p>
                                                        {conv.is_pinned && (
                                                            <Pin size={10} className="text-[#a27cff] fill-[#a27cff]" />
                                                        )}
                                                    </div>
                                                    {conv.room && (
                                                        <p className={`text-[10px] truncate max-w-[130px] ${conv.unread_count > 0 ? "text-[#a27cff]" : textVariant}`}>
                                                            {conv.room.title === "General Discussion" ? "Direct Chat" : conv.room.title}
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
                <div className={`flex-1 ${activeConversationId ? "flex" : "hidden md:flex"} flex-col rounded-none md:rounded-2xl overflow-hidden ${surfaceLow}`}>
                    {/* Chat Header */}
                    <div className={`p-5 flex items-center justify-between border-b relative z-20 ${isDark ? "border-white/5 bg-[#201f1f]/60 backdrop-blur-xl" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center gap-4">
                            {/* Back button on mobile */}
                            <button
                                onClick={() => dispatch(setActiveConversation(null))}
                                className={`p-2 -ml-2 rounded-xl transition-all md:hidden ${isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}
                                title="Back to Chats"
                            >
                                <ArrowLeft size={18} />
                            </button>
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
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isDark ? "border-[#131313]" : "border-white"} ${isOnline ? "bg-emerald-400" : "bg-zinc-400"}`} />
                            </div>
                            <div>
                                <h4 className={`font-headline font-bold text-base ${textPrimary}`}>
                                    {getOtherParticipant(activeConversation)?.full_name ?? "Unknown"}
                                </h4>
                                {activeConversation.room && (
                                    <p className="text-[10px] font-bold text-[#a27cff] uppercase tracking-widest">
                                        {activeConversation.room.title === "General Discussion" ? "Direct Chat" : activeConversation.room.title}
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
                                                <Pin size={14} className={activeConversation.is_pinned ? "text-[#a27cff] fill-[#a27cff]" : ""} />
                                                <span>{activeConversation.is_pinned ? "Unpin Chat" : "Pin Chat"}</span>
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
                                                {activeConversation.is_muted ? <Volume2 size={14} className="text-[#a27cff]" /> : <VolumeX size={14} className="text-zinc-500" />}
                                                <span>{activeConversation.is_muted ? "Unmute Alerts" : "Mute Alerts"}</span>
                                            </button>

                                            <div className={`h-[1px] my-1 ${isDark ? "bg-white/5" : "bg-slate-100"}`} />

                                            {getOtherParticipant(activeConversation)?.role !== "admin" && (
                                                <button
                                                    onClick={async () => {
                                                        setShowHeaderDropdown(false);
                                                        if (activeConversation.blocked_by_me) {
                                                            await dispatch(unblockConversation(activeConversation.id));
                                                        } else {
                                                            await dispatch(blockConversation(activeConversation.id));
                                                        }
                                                    }}
                                                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap w-full text-red-500 hover:bg-red-500/10"
                                                >
                                                    <ShieldX size={14} />
                                                    <span>{activeConversation.blocked_by_me ? "Unblock Contact" : "Block Contact"}</span>
                                                </button>
                                            )}
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
                                    const otherParticipant = getOtherParticipant(activeConversation);
                                    const senderPhoto = isMine ? user?.profile_photo_url : (msg.sender?.profile_photo_url || msg.sender?.image || otherParticipant?.profile_photo_url);
                                    const senderName = isMine ? user?.full_name : (msg.sender?.full_name || otherParticipant?.full_name);

                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex items-end gap-3 ${isMine ? "flex-row-reverse" : ""}`}
                                        >
                                            <div className="w-8 h-8 shrink-0">
                                                {senderPhoto ? (
                                                    <img
                                                        src={senderPhoto}
                                                        alt={senderName ?? "User"}
                                                        className="w-8 h-8 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-[#a27cff]/20" : "bg-violet-100"}`}>
                                                        <span className="text-[#a27cff] text-[10px] font-bold">
                                                            {(senderName?.[0] ?? "?").toUpperCase()}
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
                                                                                <FileText size={16} className="text-[#a27cff]" />
                                                                                <span className="truncate max-w-[150px]">{att.file_name}</span>
                                                                            </a>
                                                                        );
                                                                    }
                                                                })}
                                                            </div>
                                                        )}
                                                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMine
                                                            ? isDark
                                                                ? "bg-[#a27cff]/15 text-white border border-[#a27cff]/20 rounded-tr-none"
                                                                : "bg-violet-100 text-slate-900 rounded-tr-none"
                                                            : isDark
                                                                ? "bg-[#201f1f] text-[#adaaaa] rounded-tl-none"
                                                                : "bg-slate-100 text-slate-700 rounded-tl-none"
                                                            }`}>
                                                            {msg.content}
                                                        </div>
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
                                {activeConversationId && typing && typing[activeConversationId] && (
                                    <div className="flex items-end gap-3 px-1">
                                        <div className="w-8 h-8 shrink-0">
                                            {getOtherParticipant(activeConversation)?.profile_photo_url || getOtherParticipant(activeConversation)?.image ? (
                                                <img
                                                    src={getOtherParticipant(activeConversation)?.profile_photo_url || getOtherParticipant(activeConversation)?.image || ""}
                                                    alt={getOtherParticipant(activeConversation)?.full_name ?? "User"}
                                                    className="w-8 h-8 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-[#a27cff]/20" : "bg-violet-100"}`}>
                                                    <span className="text-[#a27cff] text-[10px] font-bold">
                                                        {(getOtherParticipant(activeConversation)?.full_name?.[0] ?? "?").toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`px-4 py-3.5 rounded-2xl ${isDark ? "bg-[#201f1f] text-[#adaaaa]" : "bg-slate-100 text-slate-700"} rounded-tl-none`}>
                                            <div className="flex gap-1 items-center justify-center h-4 w-9">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                    {/* Chat Input */}
                    <div className={`p-4 border-t ${isDark ? "border-white/5 bg-[#171616]/80" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center gap-3 relative">
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

                            <div className="relative">
                                <button
                                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? "bg-white/5 text-zinc-400 hover:text-[#a27cff]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
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
                                            <button
                                                onClick={() => handleAttachmentSelect("offer")}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border-t ${isDark ? "hover:bg-white/5 text-zinc-300 border-white/5" : "hover:bg-slate-50 text-slate-700 border-slate-100"}`}
                                            >
                                                <Plus size={14} className="text-[#a27cff]" />
                                                <span>Booking Offer</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className={`flex-grow rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-[#a27cff]/40 ${inputBg}`}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isSending || !inputText.trim()}
                                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#a27cff] to-[#8d69e8] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_4px_12px_rgba(162,124,255,0.25)] shrink-0 disabled:opacity-50"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`flex-grow ${activeConversationId ? "flex" : "hidden md:flex"} flex-col items-center justify-center rounded-none md:rounded-2xl p-8 text-center ${surfaceLow}`}>
                    <MessageSquare size={40} className={`mb-3 animate-pulse text-[#a27cff]`} />
                    <h3 className={`text-lg font-headline font-bold mb-1 ${textPrimary}`}>Welcome to your PG Inbox</h3>
                    <p className={`text-xs max-w-sm ${textVariant}`}>
                        Select a conversation thread from the left menu to start typing and negotiating.
                    </p>
                </div>
            )}

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
                                        placeholder="owner@example.com or admin@example.com"
                                        value={newChatEmail}
                                        onChange={(e) => setNewChatEmail(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${isDark
                                            ? "bg-[#121212] border-white/5 text-white focus:ring-1 focus:ring-[#a27cff]/40"
                                            : "bg-slate-100 border-slate-200 text-slate-900 focus:ring-1 focus:ring-[#a27cff]/40"
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
                                    className="w-full py-3 bg-gradient-to-r from-[#a27cff] to-[#8d69e8] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_4px_14px_rgba(162,124,255,0.3)]"
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

            {/* Booking Offer Modal */}
            <AnimatePresence>
                {showBookingOfferModal && activeConversation?.room && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-md p-6 rounded-2xl border ${
                                isDark
                                    ? "bg-[#181818] border-white/5 text-white"
                                    : "bg-white border-slate-200 text-slate-900"
                            } shadow-2xl`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-headline font-bold">Send Booking Request</h3>
                                <button
                                    onClick={() => { setShowBookingOfferModal(false); }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        isDark
                                            ? "hover:bg-white/5 text-zinc-400 hover:text-white"
                                            : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                    }`}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleSendBookingOffer} className="space-y-4">
                                <div className={`p-3.5 rounded-xl border mb-2 ${isDark ? "bg-[#121212] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                                    <h4 className="text-xs font-bold text-[#a27cff] uppercase tracking-wider mb-0.5">Selected Listing</h4>
                                    <p className={`text-sm font-bold truncate ${textPrimary}`}>{activeConversation.room.title}</p>
                                    <p className={`text-[11px] mt-0.5 ${textVariant}`}>
                                        Listing Rent: <span className="font-semibold text-emerald-400">PKR {(activeConversation.room as any).rent_amount?.toLocaleString() ?? (activeConversation.room as any).price?.toLocaleString() ?? "N/A"}/mo</span>
                                    </p>
                                </div>

                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                                        Proposed Counter Rent (PKR/month)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="e.g. 35000"
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                                            isDark
                                                ? "bg-[#121212] border-white/5 text-white focus:ring-1 focus:ring-[#a27cff]/40"
                                                : "bg-slate-100 border-slate-200 text-slate-900 focus:ring-1 focus:ring-[#a27cff]/40"
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                                        Requested Move-In Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={offerDate}
                                        onChange={(e) => setOfferDate(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                                            isDark
                                                ? "bg-[#121212] border-white/5 text-white focus:ring-1 focus:ring-[#a27cff]/40"
                                                : "bg-slate-100 border-slate-200 text-slate-900 focus:ring-1 focus:ring-[#a27cff]/40"
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                                        Message to Landlord (Optional)
                                    </label>
                                    <textarea
                                        placeholder="Add notes, e.g. visit hours request..."
                                        value={offerMessage}
                                        onChange={(e) => setOfferMessage(e.target.value)}
                                        rows={3}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all ${
                                            isDark
                                                ? "bg-[#121212] border-white/5 text-white focus:ring-1 focus:ring-[#a27cff]/40"
                                                : "bg-slate-100 border-slate-200 text-slate-900 focus:ring-1 focus:ring-[#a27cff]/40"
                                        }`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingOffer}
                                    className="w-full py-3 bg-gradient-to-r from-[#a27cff] to-[#8d69e8] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_4px_14px_rgba(162,124,255,0.3)]"
                                >
                                    {isSubmittingOffer ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Sending Request...
                                        </>
                                    ) : (
                                        "Send Booking Request"
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AlertModal
                isOpen={alertModal.isOpen}
                message={alertModal.message}
                onClose={() => setAlertModal({ isOpen: false, message: "" })}
                isDark={isDark}
            />
        </div>
    );
}
