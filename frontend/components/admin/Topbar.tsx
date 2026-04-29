"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Settings, X, Menu } from "lucide-react";
import { mockNotifications, type Notification } from "./mockData";
import { useAdminTheme } from "@/context/AdminThemeContext";

interface TopbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchPlaceholder?: string;
    onMenuToggle?: () => void;
}

export default function Topbar({ searchQuery, onSearchChange, searchPlaceholder = "Search Listings...", onMenuToggle }: TopbarProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const notifRef = useRef<HTMLDivElement>(null);
    const { isDark } = useAdminTheme();

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

    // Theme classes
    const headerBg = isDark
        ? "bg-[#0e0e0e]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        : "bg-white/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-b border-slate-200";
    const inputBg = isDark
        ? "bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:ring-purple-500/40"
        : "bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:ring-purple-400/40";
    const iconBtn = isDark
        ? "text-zinc-500 hover:bg-white/5"
        : "text-slate-500 hover:bg-slate-100";
    const searchIcon = isDark ? "text-zinc-500/40" : "text-slate-400";
    const profileBorder = isDark ? "border-white/10" : "border-slate-200";
    const profileName = isDark ? "text-white" : "text-slate-900";
    const profileSub = isDark ? "text-zinc-500" : "text-slate-500";
    const notifBg = isDark
        ? "bg-zinc-900/95 backdrop-blur-xl border-white/[0.08]"
        : "bg-white border-slate-200";
    const notifHeader = isDark ? "border-white/[0.06]" : "border-slate-100";
    const notifTitle = isDark ? "text-white" : "text-slate-900";
    const notifItemHover = isDark ? "hover:bg-white/[0.04] border-white/[0.03]" : "hover:bg-slate-50 border-slate-100";
    const notifItemRead = isDark ? "bg-purple-500/[0.05]" : "bg-purple-50";
    const notifTitleText = isDark ? "text-white" : "text-slate-900";
    const notifDescText = isDark ? "text-zinc-500" : "text-slate-500";
    const notifTimeText = isDark ? "text-zinc-600" : "text-slate-400";

    return (
        <header className={`fixed top-0 right-0 w-full z-40 h-16 lg:h-20 px-4 sm:px-6 lg:px-10 flex justify-between items-center transition-colors duration-300 ${headerBg}`}>
            {/* Left: Hamburger + Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                {/* Hamburger — always visible */}
                <button
                    onClick={onMenuToggle}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${iconBtn}`}
                >
                    <Menu size={22} />
                </button>

                {/* Search */}
                <div className="relative w-full group">
                    <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${searchIcon} group-focus-within:text-purple-400 transition-colors`} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={`w-full border-none rounded-xl py-2.5 pl-12 pr-10 text-sm focus:outline-none focus:ring-1 transition-all ${inputBg}`}
                    />
                    {searchQuery && (
                        <button onClick={() => onSearchChange("")} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-zinc-500 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}>
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
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">
                                    {unreadCount}
                                </motion.span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                    transition={{ duration: 0.2 }}
                                    className={`absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 border rounded-xl shadow-2xl overflow-hidden z-50 ${notifBg}`}
                                >
                                    <div className={`flex items-center justify-between px-4 py-3 border-b ${notifHeader}`}>
                                        <h4 className={`text-sm font-semibold ${notifTitle}`}>Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="text-[11px] text-purple-400 hover:text-purple-300 font-medium transition-colors">
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
                                                    {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />}
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

                    {/* Settings */}
                    <button className={`hidden sm:flex w-10 h-10 items-center justify-center rounded-full transition-all active:scale-95 ${iconBtn}`}>
                        <Settings size={20} />
                    </button>
                </div>

                {/* Profile */}
                <div className={`flex items-center gap-3 sm:gap-4 border-l ${profileBorder} pl-3 sm:pl-6`}>
                    <div className="text-right hidden sm:block">
                        <p className={`text-xs font-bold tracking-tight ${profileName}`}>Admin Unit-01</p>
                        <p className={`text-[10px] ${profileSub}`}>Super Admin</p>
                    </div>
                    <img
                        src="https://i.pravatar.cc/100?img=12"
                        alt="Admin avatar"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-purple-500/20"
                    />
                </div>
            </div>
        </header>
    );
}