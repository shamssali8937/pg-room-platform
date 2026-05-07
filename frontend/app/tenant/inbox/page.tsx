"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { mockTenantConversations, type TenantConversation, type TenantMessage } from "@/components/tenant/mockData";
import { Send, ArrowLeft, Search } from "lucide-react";

export default function TenantInbox() {
    const { isDark } = useTenantTheme();
    const [conversations, setConversations] = useState(mockTenantConversations);
    const [selectedConv, setSelectedConv] = useState<TenantConversation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceMid = isDark ? "bg-[#1a1919]" : "bg-slate-50";
    const divider = isDark ? "border-white/[0.06]" : "border-slate-100";

    const totalUnread = conversations.reduce((a, c) => a + c.unreadCount, 0);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedConv?.messages]);

    const handleSend = () => {
        if (!newMessage.trim() || !selectedConv) return;

        const msg: TenantMessage = {
            id: `m-${Date.now()}`,
            senderId: "tenant",
            senderName: "Ali Hassan",
            senderAvatar: "https://i.pravatar.cc/150?img=25",
            senderRole: "tenant",
            content: newMessage.trim(),
            timestamp: new Date().toISOString(),
            timeAgo: "Just now",
            isRead: true,
        };

        setConversations(prev => prev.map(c =>
            c.id === selectedConv.id
                ? { ...c, messages: [...c.messages, msg], lastMessage: msg.content, unreadCount: 0 }
                : c
        ));
        setSelectedConv(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
        setNewMessage("");
    };

    const handleSelectConv = (conv: TenantConversation) => {
        setSelectedConv(conv);
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
    };

    const filtered = conversations.filter(c =>
        c.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.listingTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const roleColors: Record<string, string> = {
        owner: "text-[#a27cff]",
        admin: "text-[#699cff]",
        tenant: isDark ? "text-white" : "text-slate-900",
    };

    return (
        <div className="max-w-[1200px] mx-auto pb-24 lg:pb-4">
            <header className="flex items-center gap-4 mb-6 pl-14 xl:pl-0">
                {selectedConv && (
                    <button
                        onClick={() => setSelectedConv(null)}
                        className="md:hidden p-2 rounded-lg"
                    >
                        <ArrowLeft size={20} className={textVariant} />
                    </button>
                )}
                <div>
                    <p className="text-[#a27cff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">Messages</p>
                    <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>
                        Inbox
                        {totalUnread > 0 && (
                            <span className="ml-3 px-2 py-0.5 text-sm bg-[#a27cff] text-white rounded-full">
                                {totalUnread}
                            </span>
                        )}
                    </h2>
                </div>
            </header>

            <div className={`flex h-[calc(100vh-220px)] min-h-[500px] rounded-2xl overflow-hidden ${surfaceLow}`}>

                {/* Conversation List */}
                <div className={`${selectedConv ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 shrink-0 border-r ${divider}`}>
                    {/* Search */}
                    <div className={`p-4 border-b ${divider}`}>
                        <div className="relative">
                            <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textVariant}`} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border-none focus:outline-none focus:ring-1 focus:ring-[#a27cff]/40 ${isDark ? "bg-[#1a1919] text-white placeholder:text-zinc-600" : "bg-slate-100 text-slate-900 placeholder:text-slate-400"}`}
                            />
                        </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {filtered.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => handleSelectConv(conv)}
                                className={`w-full text-left flex items-center gap-3 px-4 py-4 border-b transition-colors ${divider}
                                    ${selectedConv?.id === conv.id
                                        ? isDark ? "bg-[#a27cff]/10" : "bg-violet-50"
                                        : isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <img src={conv.participantAvatar} alt={conv.participantName} className="w-10 h-10 rounded-xl object-cover" />
                                    {conv.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#a27cff] text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-bold truncate ${textPrimary}`}>{conv.participantName}</p>
                                        <span className={`text-[10px] shrink-0 ml-1 ${textVariant}`}>{conv.timeAgo}</span>
                                    </div>
                                    <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? (isDark ? "text-white font-medium" : "text-slate-900 font-medium") : textVariant}`}>
                                        {conv.lastMessage}
                                    </p>
                                    <p className={`text-[10px] mt-0.5 ${textVariant}`}>{conv.listingTitle}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className={`${selectedConv ? "flex" : "hidden md:flex"} flex-col flex-1`}>
                    {selectedConv ? (
                        <>
                            {/* Chat Header */}
                            <div className={`flex items-center gap-3 px-5 py-4 border-b ${divider} ${surfaceMid}`}>
                                <button onClick={() => setSelectedConv(null)} className="md:hidden mr-1">
                                    <ArrowLeft size={18} className={textVariant} />
                                </button>
                                <img src={selectedConv.participantAvatar} alt={selectedConv.participantName} className="w-9 h-9 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold ${textPrimary}`}>{selectedConv.participantName}</p>
                                    <p className={`text-xs ${textVariant} truncate`}>{selectedConv.listingTitle}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                                    selectedConv.participantRole === "owner"
                                        ? "bg-[#a27cff]/10 text-[#a27cff]"
                                        : "bg-[#699cff]/10 text-[#699cff]"
                                }`}>
                                    {selectedConv.participantRole}
                                </span>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                                {selectedConv.messages.map(msg => {
                                    const isTenant = msg.senderId === "tenant";
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-2.5 ${isTenant ? "flex-row-reverse" : ""}`}
                                        >
                                            {!isTenant && (
                                                <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-auto" />
                                            )}
                                            <div className={`max-w-[70%] ${isTenant ? "items-end" : "items-start"} flex flex-col`}>
                                                {!isTenant && (
                                                    <p className={`text-[10px] font-bold mb-1 ${roleColors[msg.senderRole]}`}>{msg.senderName}</p>
                                                )}
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                                    isTenant
                                                        ? "bg-gradient-to-br from-[#a27cff] to-[#6e3bd7] text-white rounded-br-sm"
                                                        : isDark
                                                            ? "bg-[#1a1919] text-white rounded-bl-sm"
                                                            : "bg-slate-100 text-slate-900 rounded-bl-sm"
                                                }`}>
                                                    {msg.content}
                                                </div>
                                                <p className={`text-[10px] mt-1 ${textVariant}`}>{msg.timeAgo}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className={`border-t p-4 ${divider} ${surfaceMid}`}>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSend()}
                                        placeholder="Type a message..."
                                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm border-none focus:outline-none focus:ring-1 focus:ring-[#a27cff]/40 ${isDark ? "bg-[#131313] text-white placeholder:text-zinc-600" : "bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200"}`}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!newMessage.trim()}
                                        className="w-10 h-10 rounded-xl bg-[#a27cff] text-white flex items-center justify-center hover:bg-[#9066ee] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`}>
                                <Send size={28} className={textVariant} />
                            </div>
                            <p className={`font-bold text-lg ${textPrimary}`}>Select a Conversation</p>
                            <p className={`text-sm mt-1 ${textVariant}`}>Choose a conversation from the left to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
