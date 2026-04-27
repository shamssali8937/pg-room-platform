"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Settings, X, Menu } from "lucide-react";
import { mockNotifications, type Notification } from "./mockData";

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

    return (
        <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-280px)] z-40 bg-[#0e0e0e]/80 backdrop-blur-xl h-16 lg:h-20 px-4 sm:px-6 lg:px-10 flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {/* Left: Hamburger + Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                {/* Mobile hamburger */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 transition-colors flex-shrink-0"
                >
                    <Menu size={22} />
                </button>

                {/* Search */}
                <div className="relative w-full group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500/40 group-focus-within:text-purple-400 transition-colors" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-zinc-900/60 border-none rounded-xl py-2.5 pl-12 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
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
                            className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-500 hover:bg-white/5 transition-all active:scale-95 relative"
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
                                    className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                                        <h4 className="text-sm font-semibold text-white">Notifications</h4>
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
                                                className={`w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0 ${!notif.read ? "bg-purple-500/[0.05]" : ""}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />}
                                                    <div className={!notif.read ? "" : "ml-[18px]"}>
                                                        <p className="text-sm font-medium text-white">{notif.title}</p>
                                                        <p className="text-xs text-zinc-500 mt-0.5">{notif.description}</p>
                                                        <p className="text-[10px] text-zinc-600 mt-1">{notif.time}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Settings — hidden on very small screens */}
                    <button className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-zinc-500 hover:bg-white/5 transition-all active:scale-95">
                        <Settings size={20} />
                    </button>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 sm:gap-4 border-l border-white/10 pl-3 sm:pl-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-white tracking-tight">Admin Unit-01</p>
                        <p className="text-[10px] text-zinc-500">Super Admin</p>
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