"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Settings, X, Menu } from "lucide-react";
import { useOwnerTheme } from "@/context/OwnerThemeContext";

// Reuse admin mock notifications structure
interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
}

const mockNotifications: Notification[] = [
    { id: "1", title: "New Inquiry", description: "Sara Ahmed asked about Executive 2BR Penthouse", time: "2 mins ago", read: false },
    { id: "2", title: "Listing Approved", description: "Your listing 'Seaside Luxury Studio' is now live", time: "1 hour ago", read: true },
];

interface TopbarProps {
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    searchPlaceholder?: string;
    onMenuToggle?: () => void;
}

export default function OwnerTopbar({ 
    searchPlaceholder = "Search Properties...", 
    onMenuToggle 
}: TopbarProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const notifRef = useRef<HTMLDivElement>(null);
    const { isDark, searchQuery, setSearchQuery } = useOwnerTheme();

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    // Theme classes mapped to Owner theme
    const headerBg = isDark
        ? "bg-[#0e0e0e]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        : "bg-white/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-b border-slate-200";
    const inputBg = isDark
        ? "bg-[#131313] text-white placeholder:text-zinc-600 focus:ring-violet-500/40"
        : "bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:ring-violet-400/40";
    const iconBtn = isDark
        ? "text-zinc-400 hover:bg-white/5 hover:text-white"
        : "text-slate-500 hover:bg-slate-100";
    const searchIcon = isDark ? "text-zinc-500" : "text-slate-400";
    const profileBorder = isDark ? "border-[#484847]/15" : "border-slate-200";
    const profileName = isDark ? "text-white" : "text-slate-900";
    const profileSub = isDark ? "text-zinc-500" : "text-slate-500";
    
    const notifBg = isDark
        ? "bg-[#201f1f]/95 backdrop-blur-xl border-[#484847]/15"
        : "bg-white border-slate-200";
    const notifHeader = isDark ? "border-[#484847]/15" : "border-slate-100";
    const notifTitle = isDark ? "text-white" : "text-slate-900";
    const notifItemHover = isDark ? "hover:bg-white/[0.04] border-[#484847]/15" : "hover:bg-slate-50 border-slate-100";
    const notifItemRead = isDark ? "bg-[#ba9eff]/[0.05]" : "bg-violet-50";
    const notifTitleText = isDark ? "text-white" : "text-slate-900";
    const notifDescText = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const notifTimeText = isDark ? "text-zinc-500" : "text-slate-400";

    return (
        <header className={`fixed top-0 right-0 w-full z-40 h-16 lg:h-20 px-4 sm:px-6 lg:px-10 flex justify-between items-center transition-colors duration-300 ${headerBg}`}>
            {/* Left: Hamburger + Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                {/* Hamburger — visible to toggle sidebar */}
                <button
                    onClick={onMenuToggle}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${iconBtn}`}
                >
                    <Menu size={22} />
                </button>

                {/* Search */}
                <div className="relative w-full group">
                    <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${searchIcon} group-focus-within:text-[#ba9eff] transition-colors`} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full border-none rounded-xl py-2.5 pl-12 pr-10 text-sm focus:outline-none focus:ring-1 transition-all ${inputBg}`}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-zinc-500 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}>
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-6">
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 relative ${iconBtn}`}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ff97b5] rounded-full border-2 border-transparent" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                    transition={{ duration: 0.2 }}
                                    className={`absolute right-[-60px] sm:right-0 mt-3 w-80 max-w-[calc(100vw-32px)] border rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right ${notifBg}`}
                                >
                                    <div className={`flex items-center justify-between px-4 py-3 border-b ${notifHeader}`}>
                                        <h4 className={`text-sm font-semibold ${notifTitle}`}>Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="text-[11px] text-[#ae8dff] hover:text-white font-medium transition-colors">
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        {notifications.map((notif) => (
                                            <button
                                                key={notif.id}
                                                onClick={() => markAsRead(notif.id)}
                                                className={`w-full text-left px-4 py-3 transition-colors border-b last:border-0 ${notifItemHover} ${!notif.read ? notifItemRead : ""}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#ae8dff] mt-1.5 flex-shrink-0" />}
                                                    <div className={!notif.read ? "" : "ml-[18px]"}>
                                                        <p className={`text-sm font-medium ${notifTitleText}`}>{notif.title}</p>
                                                        <p className={`text-xs mt-0.5 ${notifDescText}`}>{notif.description}</p>
                                                        <p className={`text-[10px] mt-1 ${notifTimeText}`}>{notif.time}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Profile */}
                <div className={`flex items-center gap-3 sm:gap-4 border-l ${profileBorder} pl-3 sm:pl-6`}>
                    <div className="text-right hidden sm:block">
                        <p className={`text-xs font-bold tracking-tight ${profileName}`}>Zubair Khan</p>
                        <p className={`text-[10px] ${profileSub}`}>Owner</p>
                    </div>
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC83hUmp8-Zou7yX7CUPDz4mXecdWYUvEQS-3-GaBh6XMFC3C6y7hFNpBBZ2LPf7ynDqsG97gE4_JHP23jepV64eh-QTkc8m2wTyGmB3dmx8hAFaQ_AUOtbNGv8zfdie3V1FA8sMmSjCli3HzFDBEB6Xz5lwhBZicwsg5HfSfFj2EpP1AmNFETmQIvfIwZxmxcBt92tTI1dKUlht8tuua1LlA6D6FJKN9ZBGrftUNY6DtRVcl6ik-kDeDZ66Ghj7oLPTcQFghbYTg"
                        alt="Owner avatar"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
}
