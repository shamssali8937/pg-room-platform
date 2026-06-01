"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, X, Menu, CalendarCheck, MessageSquare, CreditCard } from "lucide-react";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface TopbarProps {
    onMenuToggle?: () => void;
    searchPlaceholder?: string;
}

interface TenantNotification {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: string;
}

const formatTime = (dateStr: string) => {
    try {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return new Date(dateStr).toLocaleDateString();
    } catch {
        return "";
    }
};

export default function TenantTopbar({ onMenuToggle, searchPlaceholder = "Search rooms, cities..." }: TopbarProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<TenantNotification[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);
    const { isDark, searchQuery, setSearchQuery } = useTenantTheme();
    const { user } = useAuth();

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
                    type: n.notification_type?.includes("booking") ? "booking" : n.notification_type?.includes("payment") ? "payment" : "system"
                }));
                setNotifications(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 30 seconds for live notifications
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

    const markAllRead = async () => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            // Sequentially mark them read in DB
            const unread = notifications.filter((n) => !n.read);
            await Promise.all(unread.map(n => api.patch(`/users/me/notifications/${n.id}/read`)));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const markAsRead = async (id: string) => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
        try {
            await api.patch(`/users/me/notifications/${id}/read`);
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const notifIconMap: Record<string, React.ReactNode> = {
        booking: <CalendarCheck size={14} className="text-emerald-400" />,
        message: <MessageSquare size={14} className="text-[#a27cff]" />,
        payment: <CreditCard size={14} className="text-amber-400" />,
        system: <Bell size={14} className="text-[#699cff]" />,
    };


    const headerBg = isDark
        ? "bg-[#0e0e0e]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        : "bg-white/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-b border-slate-200";
    const inputBg = isDark
        ? "bg-[#131313] text-white placeholder:text-zinc-600 focus:ring-[#a27cff]/40"
        : "bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:ring-violet-400/40";
    const iconBtn = isDark
        ? "text-zinc-400 hover:bg-white/5 hover:text-white"
        : "text-slate-500 hover:bg-slate-100";
    const searchIcon = isDark ? "text-zinc-500" : "text-slate-400";
    const profileBorder = isDark ? "border-[#484847]/15" : "border-slate-200";
    const notifBg = isDark
        ? "bg-[#201f1f]/95 backdrop-blur-xl border-[#484847]/15"
        : "bg-white border-slate-200";
    const notifHeader = isDark ? "border-[#484847]/15" : "border-slate-100";
    const notifItemHover = isDark ? "hover:bg-white/[0.04] border-[#484847]/15" : "hover:bg-slate-50 border-slate-100";
    const notifItemUnread = isDark ? "bg-[#a27cff]/[0.05]" : "bg-violet-50";

    return (
        <header className={`fixed top-0 right-0 w-full z-40 h-16 lg:h-20 px-4 sm:px-6 lg:px-10 flex justify-between items-center transition-colors duration-300 ${headerBg}`}>
            {/* Left: Hamburger + Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                <button
                    onClick={onMenuToggle}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${iconBtn}`}
                >
                    <Menu size={22} />
                </button>

                <div className="relative w-full group">
                    <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${searchIcon} group-focus-within:text-[#a27cff] transition-colors`} />
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
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 relative ${iconBtn}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ff97b5] rounded-full border-2 border-transparent"
                            />
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
                                    <h4 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Notifications</h4>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-[11px] text-[#a27cff] hover:text-white font-medium transition-colors">
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <button
                                            key={notif.id}
                                            onClick={() => markAsRead(notif.id)}
                                            className={`w-full text-left px-4 py-3 transition-colors border-b last:border-0 ${notifItemHover} ${!notif.read ? notifItemUnread : ""}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="mt-0.5 shrink-0">{notifIconMap[notif.type]}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{notif.title}</p>
                                                    <p className={`text-xs mt-0.5 ${isDark ? "text-[#adaaaa]" : "text-slate-500"}`}>{notif.description}</p>
                                                    <p className={`text-[10px] mt-1 ${isDark ? "text-zinc-500" : "text-slate-400"}`}>{notif.time}</p>
                                                </div>
                                                {!notif.read && <span className="w-2 h-2 rounded-full bg-[#a27cff] mt-1.5 shrink-0" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile */}
                <div className={`flex items-center gap-3 sm:gap-4 border-l ${profileBorder} pl-3 sm:pl-6`}>
                    <div className="text-right hidden sm:block">
                        <p className={`text-xs font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{user?.full_name ?? "Tenant User"}</p>
                        <p className={`text-[10px] ${isDark ? "text-zinc-500" : "text-slate-500"}`}>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Tenant"}</p>
                    </div>
                    {user?.image ? (
                        <img
                            src={user.image}
                            alt="Tenant avatar"
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-black bg-[#a27cff]/10 text-[#a27cff]`}>
                            {user?.full_name?.[0] ?? "?"}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
