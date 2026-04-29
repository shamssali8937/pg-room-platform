"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    LayoutDashboard,
    Building2,
    Users,
    BarChart3,
    Star,
    HelpCircle,
    LogOut,
    X,
    Sun,
    Moon
} from "lucide-react";
import { useAdminTheme } from "@/context/AdminThemeContext";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "Users", id: "users", href: "/admin/users" },
    { icon: Building2, label: "Listings", id: "listings", href: "/admin/listings" },
    { icon: BarChart3, label: "Reports", id: "reports", href: "/admin/reports" },
    { icon: Star, label: "Points", id: "points", href: "/admin/points" },
];

interface SidebarProps {
    activeId?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ activeId = "dashboard", isOpen = false, onClose }: SidebarProps) {
    const touchStartX = useRef(0);
    const { isDark, toggleTheme } = useAdminTheme();

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && onClose) onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 60 && onClose) onClose();
    };

    // Theme-aware tokens
    const sidebarBg = isDark
        ? "bg-[#0e0e0e] border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.6)]"
        : "bg-white border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.08)]";
    const brandTitle = isDark ? "text-white" : "text-slate-900";
    const closeBtnColor = isDark
        ? "text-zinc-500 hover:text-white hover:bg-white/5"
        : "text-slate-400 hover:text-slate-900 hover:bg-slate-100";
    const navActiveClass = isDark
        ? "bg-gradient-to-r from-purple-500/20 to-transparent text-white border-l-4 border-purple-400"
        : "bg-gradient-to-r from-purple-500/10 to-transparent text-slate-900 border-l-4 border-purple-500";
    const navInactiveClass = isDark
        ? "text-zinc-500 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-l-4 border-transparent";
    const bottomBtnColor = isDark
        ? "text-zinc-500 hover:text-white"
        : "text-slate-500 hover:text-slate-900";
    const themeToggleBg = isDark
        ? "hover:bg-white/5"
        : "hover:bg-slate-100";

    return (
        <>
            {/* Backdrop overlay — shown on ALL screen sizes when sidebar is open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className={`fixed inset-0 z-[45] backdrop-blur-sm ${isDark ? "bg-black/60" : "bg-slate-900/30"}`}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar panel */}
            <aside
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`fixed left-0 top-0 h-full w-[280px] flex flex-col border-r z-50 py-8
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    ${sidebarBg}`}
            >
                {/* Brand + Close */}
                <div className="px-8 mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <LayoutDashboard size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-xl font-black tracking-tighter ${brandTitle}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                                PG Nexus
                            </h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500/60 font-semibold">
                                Admin Console
                            </p>
                        </div>
                    </div>
                    {/* Close button — visible on ALL screen sizes */}
                    <button
                        onClick={onClose}
                        className={`p-2 -mr-2 rounded-lg transition-colors active:scale-90 ${closeBtnColor}`}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.id === activeId;
                        return (
                            <Link key={item.id} href={item.href} onClick={onClose}>
                                <motion.div
                                    whileTap={{ scale: 0.98 }}
                                    whileHover={{ scale: 1.02 }}
                                    className={`flex items-center gap-4 py-3 px-6 text-sm font-medium transition-all duration-300 relative cursor-pointer rounded-r-xl
                                        ${isActive ? navActiveClass : navInactiveClass}`}
                                >
                                    <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                                    <span>{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="px-8 mt-auto space-y-6">
                    <div className="space-y-1">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl w-full text-sm transition-colors group ${bottomBtnColor} ${themeToggleBg}`}
                        >
                            <div className="flex items-center gap-4">
                                {isDark
                                    ? <Sun size={18} strokeWidth={1.8} className="text-amber-400" />
                                    : <Moon size={18} strokeWidth={1.8} className="text-purple-500" />
                                }
                                <span className="font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>
                            </div>
                            {/* Toggle pill */}
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? "bg-zinc-700" : "bg-purple-500"}`}>
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${isDark ? "left-0.5" : "left-[1.375rem]"}`} />
                            </div>
                        </button>

                        <button className={`flex items-center gap-4 py-2 transition-colors w-full text-sm ${bottomBtnColor}`}>
                            <HelpCircle size={18} strokeWidth={1.8} />
                            <span>Help Center</span>
                        </button>
                        <button className="flex items-center gap-4 py-2 text-slate-500 hover:text-red-500 transition-colors w-full text-sm">
                            <LogOut size={18} strokeWidth={1.8} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}