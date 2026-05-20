"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    LayoutDashboard,
    Search,
    CalendarCheck,
    MessageSquare,
    ShieldCheck,
    SlidersHorizontal,
    HelpCircle,
    LogOut,
    X,
    Sun,
    Moon,
    Gem,
} from "lucide-react";
import { useTenantTheme } from "@/context/TenantThemeContext";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard",   id: "dashboard",   href: "/tenant/dashboard" },
    { icon: Search,          label: "Find Rooms",  id: "browse",      href: "/tenant/browse" },
    { icon: CalendarCheck,   label: "My Bookings", id: "bookings",    href: "/tenant/bookings" },
    { icon: MessageSquare,   label: "Inbox",       id: "inbox",       href: "/tenant/inbox" },
    { icon: ShieldCheck,     label: "Identity",    id: "identity",    href: "/tenant/identity" },
    { icon: SlidersHorizontal, label: "Preferences", id: "preferences", href: "/tenant/preferences" },
];

interface SidebarProps {
    activeId?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function TenantSidebar({ activeId = "dashboard", isOpen = false, onClose }: SidebarProps) {
    const touchStartX = useRef(0);
    const { isDark, toggleTheme } = useTenantTheme();

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

    const sidebarBg = isDark
        ? "bg-[#131313] shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
        : "bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.08)]";
    const brandTitle = isDark ? "text-white" : "text-slate-900";
    const navActiveClass = isDark
        ? "bg-gradient-to-r from-[#a27cff]/10 to-transparent text-[#a27cff] border-l-2 border-[#a27cff]"
        : "bg-gradient-to-r from-violet-500/10 to-transparent text-violet-600 border-l-2 border-violet-500";
    const navInactiveClass = isDark
        ? "text-gray-500 hover:text-gray-300 hover:bg-white/5 border-l-2 border-transparent"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-l-2 border-transparent";
    const bottomBtnColor = isDark
        ? "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100";
    const themeToggleBg = isDark
        ? "hover:bg-white/5 text-gray-500 hover:text-gray-300"
        : "hover:bg-slate-100 text-slate-500 hover:text-slate-900";

    return (
        <>
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

            <aside
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`fixed left-0 top-0 h-full w-64 flex flex-col z-50 py-8 font-headline text-sm font-medium
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    ${sidebarBg}`}
            >
                {/* Brand + Close */}
                <div className="px-8 mb-8 flex flex-col gap-2 relative">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a27cff] to-[#6e3bd7] flex items-center justify-center flex-shrink-0">
                            <Gem size={18} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className={`text-lg font-black leading-none ${brandTitle}`}>
                                PG Nexus
                            </h1>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 mt-1">
                                Tenant Portal
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`absolute top-0 right-4 p-2 rounded-lg transition-colors active:scale-90 ${isDark ? "text-zinc-500 hover:text-white hover:bg-white/5" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"}`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-grow space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = item.id === activeId;
                        return (
                            <Link key={item.id} href={item.href} onClick={onClose}>
                                <motion.div
                                    whileTap={{ scale: 0.98 }}
                                    className={`py-3 px-6 flex items-center gap-4 transition-all duration-200 ${isActive ? "translate-x-1" : ""}
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
                <div className={`mt-auto border-t pt-6 space-y-1 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                    <button
                        onClick={toggleTheme}
                        className={`py-3 px-6 flex items-center justify-between w-full transition-colors ${themeToggleBg}`}
                    >
                        <div className="flex items-center gap-4">
                            {isDark
                                ? <Sun size={18} strokeWidth={1.8} className="text-amber-400" />
                                : <Moon size={18} strokeWidth={1.8} className="text-violet-500" />
                            }
                            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? "bg-zinc-700" : "bg-[#a27cff]"}`}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${isDark ? "left-0.5" : "left-[1.375rem]"}`} />
                        </div>
                    </button>

                    <button className={`py-3 px-6 flex items-center gap-4 w-full transition-colors ${bottomBtnColor}`}>
                        <HelpCircle size={18} strokeWidth={1.8} />
                        <span>Support</span>
                    </button>
                    <button className={`py-3 px-6 flex items-center gap-4 w-full transition-colors ${bottomBtnColor} hover:!text-red-500`}>
                        <LogOut size={18} strokeWidth={1.8} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
