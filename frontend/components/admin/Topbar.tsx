"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Settings, X, Menu } from "lucide-react";
import { mockNotifications, type Notification } from "./mockData";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/api";

const formatTime = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    } catch {
        return "Recent";
    }
};

interface TopbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchPlaceholder?: string;
    onMenuToggle?: () => void;
}

export default function Topbar({ searchQuery, onSearchChange, searchPlaceholder = "Search Listings...", onMenuToggle }: TopbarProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const { isDark } = useAdminTheme();
    const { user } = useAuth();
    const conversations = useAppSelector((s) => s.chat.conversations);
    const totalUnreadMessages = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

    useEffect(() => { setIsMounted(true); }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get("/users/me/notifications");
            if (data?.success && Array.isArray(data?.data)) {
                const mapped = data.data.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    description: n.body,
                    time: formatTime(n.created_at),
                    read: n.is_read,
                }));
                setNotifications(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch admin notifications:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

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

    const markAsRead = async (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        try {
            await api.patch(`/users/me/notifications/${id}/read`);
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            const unread = notifications.filter(n => !n.read);
            await Promise.all(unread.map(n => api.patch(`/users/me/notifications/${n.id}/read`)));
        } catch (err) {
            console.error(err);
        }
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
        <>
            <header className={`fixed top-0 right-0 w-full z-40 h-16 lg:h-20 px-4 sm:px-6 lg:px-10 flex justify-between items-center transition-colors duration-300 ${headerBg}`}>
                {/* Left: Hamburger + Search */}
                <div className="flex items-center gap-3 flex-1 max-w-md">
                    {/* Hamburger — always visible */}
                    <button
                        onClick={onMenuToggle}
                        className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors flex-shrink-0 relative ${iconBtn}`}
                    >
                        <Menu size={22} />
                        {totalUnreadMessages > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-transparent" />
                        )}
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
                        {/* Notifications bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all active:scale-95 relative ${iconBtn}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">
                                        {unreadCount}
                                    </motion.span>
                                )}
                            </button>

                            {/* Desktop dropdown only */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                        transition={{ duration: 0.18 }}
                                        className={`absolute right-0 mt-3 w-80 hidden sm:block border rounded-xl shadow-2xl overflow-hidden z-50 ${notifBg}`}
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
                                            {notifications.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-8 gap-2">
                                                    <Bell size={24} className={isDark ? "text-zinc-600" : "text-slate-300"} />
                                                    <p className={`text-xs ${isDark ? "text-zinc-500" : "text-slate-400"}`}>No notifications yet</p>
                                                </div>
                                            ) : notifications.map((notif) => (
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
                        {/* <button className={`hidden sm:flex w-10 h-10 items-center justify-center rounded-full transition-all active:scale-95 ${iconBtn}`}>
                            <Settings size={20} />
                        </button> */}
                    </div>

                    {/* Profile */}
                    <div className={`flex items-center gap-3 sm:gap-4 border-l ${profileBorder} pl-3 sm:pl-6`}>
                        <div className="text-right hidden sm:block">
                            <p className={`text-xs font-bold tracking-tight ${profileName}`}>{user?.full_name ?? "Admin User"}</p>
                            <p className={`text-[10px] ${profileSub}`}>{user?.role ? user.role.toUpperCase() : "Admin"}</p>
                        </div>
                        {user?.image ? (
                            <img
                                src={user.image}
                                alt="Admin avatar"
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-purple-500/20"
                            />
                        ) : (
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-black bg-purple-500/10 text-purple-400 border-2 border-purple-500/20`}>
                                {user?.full_name?.[0] ?? "?"}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile bottom sheet — portal escapes backdrop-filter containing block on the fixed header */}
            {isMounted && createPortal(
                <AnimatePresence>
                    {showNotifications && (
                        <>
                            <motion.div
                                key="admin-notif-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[998] bg-black/60 sm:hidden"
                                onClick={() => setShowNotifications(false)}
                            />
                            <motion.div
                                key="admin-notif-sheet"
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 30, stiffness: 320 }}
                                className={`fixed bottom-0 left-0 right-0 z-[999] rounded-t-2xl border-t overflow-hidden sm:hidden ${notifBg}`}
                                style={{ maxHeight: "80dvh" }}
                            >
                                <div className="flex justify-center pt-3 pb-1">
                                    <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-slate-300"}`} />
                                </div>
                                <div className={`flex items-center justify-between px-4 py-3 border-b ${notifHeader}`}>
                                    <h4 className={`text-sm font-semibold ${notifTitle}`}>Notifications</h4>
                                    <div className="flex items-center gap-3">
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="text-[11px] text-purple-400 font-medium">
                                                Mark all read
                                            </button>
                                        )}
                                        <button onClick={() => setShowNotifications(false)} className={`text-sm font-bold px-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>✕</button>
                                    </div>
                                </div>
                                <div className="overflow-y-auto" style={{ maxHeight: "calc(80dvh - 90px)" }}>
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                                            <Bell size={32} className={isDark ? "text-zinc-600" : "text-slate-300"} />
                                            <p className={`text-sm ${isDark ? "text-zinc-500" : "text-slate-400"}`}>No notifications yet</p>
                                        </div>
                                    ) : notifications.map((notif) => (
                                        <button
                                            key={notif.id}
                                            onClick={() => { markAsRead(notif.id); setShowNotifications(false); }}
                                            className={`w-full text-left px-4 py-4 transition-colors border-b last:border-0 ${notifItemHover} ${!notif.read ? notifItemRead : ""}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />}
                                                <div className={!notif.read ? "" : "ml-[18px]"}>
                                                    <p className={`text-sm font-semibold ${notifTitleText}`}>{notif.title}</p>
                                                    <p className={`text-xs mt-0.5 leading-relaxed ${notifDescText}`}>{notif.description}</p>
                                                    <p className={`text-[10px] mt-1.5 ${notifTimeText}`}>{notif.time}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}