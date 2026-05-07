"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { mockOwnerInquiries, mockChatMessages, type OwnerInquiry } from "@/components/owner/mockData";
import { Send, Paperclip, Smile, Phone, MoreVertical, CheckCircle, Filter, Search } from "lucide-react";

const OWNER_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuC83hUmp8-Zou7yX7CUPDz4mXecdWYUvEQS-3-GaBh6XMFC3C6y7hFNpBBZ2LPf7ynDqsG97gE4_JHP23jepV64eh-QTkc8m2wTyGmB3dmx8hAFaQ_AUOtbNGv8zfdie3V1FA8sMmSjCli3HzFDBEB6Xz5lwhBZicwsg5HfSfFj2EpP1AmNFETmQIvfIwZxmxcBt92tTI1dKUlht8tuua1LlA6D6FJKN9ZBGrftUNY6DtRVcl6ik-kDeDZ66Ghj7oLPTcQFghbYTg";

export default function OwnerInquiriesPage() {
    const { isDark } = useOwnerTheme();
    const [activeId, setActiveId] = useState<string>("1");
    const [inputText, setInputText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [messages, setMessages] = useState(mockChatMessages);
    const [inquiries, setInquiries] = useState(mockOwnerInquiries);

    const activeInquiry = inquiries.find(i => i.id === activeId)!;
    const activeMessages = messages[activeId] ?? [];

    const filteredInquiries = inquiries.filter(i =>
        !searchQuery ||
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.property.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSend = () => {
        if (!inputText.trim()) return;
        const newMsg = {
            id: `m${Date.now()}`,
            sender: "owner" as const,
            text: inputText.trim(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), newMsg] }));
        setInquiries(prev => prev.map(i => i.id === activeId ? { ...i, status: "Replied" as const } : i));
        setInputText("");
    };

    // Theme tokens
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313]" : "bg-white border border-slate-200";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-100";
    const inputBg = isDark ? "bg-[#131313] text-white placeholder:text-zinc-600" : "bg-slate-100 text-slate-900 placeholder:text-slate-400";

    return (
        <div className="max-w-[1400px] mx-auto h-[calc(100vh-5rem)] flex flex-col md:flex-row gap-6 pl-14 xl:pl-0 pb-24 lg:pb-0">
            {/* Left Panel: Inquiry List */}
            <div className={`w-full md:w-80 lg:w-96 flex flex-col rounded-2xl overflow-hidden shrink-0 ${surfaceLow}`}>
                {/* Panel Header */}
                <div className={`p-5 border-b ${isDark ? "border-white/5" : "border-slate-200"}`}>
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <h3 className={`text-xl font-headline font-extrabold tracking-tight ${textPrimary}`}>Inquiries</h3>
                            <p className={`text-xs mt-0.5 ${textVariant}`}>
                                {inquiries.filter(i => i.status === "New").length} new this session
                            </p>
                        </div>
                        <button className={`p-2 rounded-lg transition-colors ${isDark ? "text-zinc-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}>
                            <Filter size={16} />
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textVariant}`} />
                        <input
                            type="text"
                            placeholder="Search inquiries..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-sm border-none outline-none focus:ring-1 focus:ring-[#ba9eff]/40 ${inputBg}`}
                        />
                    </div>
                </div>

                {/* Inquiry Cards */}
                <div className="flex-1 overflow-y-auto space-y-1 p-3">
                    <AnimatePresence>
                        {filteredInquiries.map(inq => (
                            <motion.button
                                key={inq.id}
                                onClick={() => setActiveId(inq.id)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`w-full text-left p-4 rounded-xl transition-all relative ${
                                    activeId === inq.id
                                        ? isDark
                                            ? "bg-[#ba9eff]/10 border border-[#ba9eff]/20"
                                            : "bg-violet-50 border border-violet-200"
                                        : isDark
                                        ? "hover:bg-white/5 border border-transparent"
                                        : "hover:bg-slate-50 border border-transparent"
                                }`}
                            >
                                {inq.status === "New" && (
                                    <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-[#ba9eff] rounded-full" />
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <img src={inq.avatarUrl} alt={inq.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                                        <div>
                                            <p className={`text-sm font-bold ${textPrimary}`}>{inq.name}</p>
                                            <p className={`text-[10px] truncate max-w-[120px] ${inq.status === "New" ? "text-[#ba9eff]" : textVariant}`}>
                                                {inq.property}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] shrink-0 ${textVariant}`}>{inq.timeAgo}</span>
                                </div>
                                <p className={`text-xs line-clamp-1 ${textVariant}`}>{inq.message}</p>
                                <div className="flex gap-2 mt-2">
                                    {inq.status === "New" ? (
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ba9eff]/15 text-[#ba9eff] font-bold uppercase tracking-wide">New</span>
                                    ) : (
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${isDark ? "bg-white/5 text-zinc-500" : "bg-slate-100 text-slate-500"}`}>Replied</span>
                                    )}
                                    {inq.priority === "High" && (
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-bold uppercase tracking-wide">High Priority</span>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Panel: Chat Window */}
            <div className={`flex-1 flex flex-col rounded-2xl overflow-hidden ${surfaceLow}`}>
                {/* Chat Header */}
                <div className={`p-5 flex items-center justify-between border-b ${isDark ? "border-white/5 bg-[#201f1f]/60 backdrop-blur-xl" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={activeInquiry.avatarUrl} alt={activeInquiry.name} className="w-11 h-11 rounded-xl object-cover" />
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#ba9eff] rounded-full border-2 border-[#131313]" />
                        </div>
                        <div>
                            <h4 className={`font-headline font-bold text-base ${textPrimary}`}>{activeInquiry.name}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#ba9eff] uppercase tracking-widest">{activeInquiry.property}</span>
                                <span className={`w-1 h-1 rounded-full ${isDark ? "bg-zinc-600" : "bg-slate-300"}`} />
                                <span className={`text-xs ${textVariant}`}>Prospective Tenant</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                            <Phone size={16} />
                        </button>
                        <button className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                            <MoreVertical size={16} />
                        </button>
                        <button className="px-4 py-2 ml-2 rounded-xl bg-gradient-to-r from-[#ba9eff] to-[#699cff] text-[#39008c] font-bold text-[10px] uppercase tracking-wider hover:brightness-110 transition-all">
                            Approve
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isDark ? "bg-[radial-gradient(circle_at_top_right,_rgba(186,158,255,0.03)_0%,_transparent_60%)]" : ""}`}>
                    <div className="flex justify-center">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full ${isDark ? "bg-[#201f1f] text-zinc-600" : "bg-slate-100 text-slate-400"}`}>
                            Today
                        </span>
                    </div>

                    {activeMessages.map(msg => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-end gap-3 ${msg.sender === "owner" ? "flex-row-reverse" : ""}`}
                        >
                            {msg.sender === "tenant" ? (
                                <img src={activeInquiry.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                            ) : (
                                <img src={OWNER_AVATAR} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                            )}
                            <div className={`max-w-[70%] ${msg.sender === "owner" ? "items-end" : "items-start"} flex flex-col`}>
                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                    msg.sender === "owner"
                                        ? isDark
                                            ? "bg-[#ba9eff]/15 text-white border border-[#ba9eff]/20 rounded-tr-none"
                                            : "bg-violet-100 text-slate-900 rounded-tr-none"
                                        : isDark
                                        ? "bg-[#201f1f] text-[#adaaaa] rounded-tl-none"
                                        : "bg-slate-100 text-slate-700 rounded-tl-none"
                                }`}>
                                    {msg.text}
                                </div>
                                <div className={`flex items-center gap-1 mt-1 ${msg.sender === "owner" ? "flex-row-reverse" : ""}`}>
                                    <span className={`text-[10px] ${textVariant}`}>{msg.time}</span>
                                    {msg.sender === "owner" && (
                                        <CheckCircle size={12} className="text-[#ba9eff]" fill="currentColor" />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Input Area */}
                <div className={`p-4 border-t ${isDark ? "border-white/5 bg-[#201f1f]/60 backdrop-blur-xl" : "border-slate-200 bg-white"}`}>
                    <div className={`flex items-center gap-3 rounded-2xl px-3 py-2 focus-within:ring-1 focus-within:ring-[#ba9eff]/40 transition-all ${isDark ? "bg-[#131313]" : "bg-slate-100"}`}>
                        <button className={`transition-colors shrink-0 ${textVariant} hover:text-[#ba9eff]`}>
                            <Paperclip size={18} />
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            placeholder={`Reply to ${activeInquiry.name}...`}
                            className={`flex-1 bg-transparent border-none outline-none text-sm ${isDark ? "text-white placeholder:text-zinc-600" : "text-slate-900 placeholder:text-slate-400"}`}
                        />
                        <button className={`transition-colors shrink-0 ${textVariant} hover:text-[#ba9eff]`}>
                            <Smile size={18} />
                        </button>
                        <button
                            onClick={handleSend}
                            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ba9eff] to-[#699cff] text-[#39008c] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 shadow-[0_4px_14px_rgba(186,158,255,0.3)]"
                        >
                            <Send size={15} fill="currentColor" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1">
                        <div className="flex gap-4">
                            {["Smart Replies", "Templates"].map(label => (
                                <button key={label} className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${textVariant} hover:text-[#ba9eff]`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                        <span className={`text-[10px] italic ${textVariant}`}>{activeInquiry.name} is typing...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
