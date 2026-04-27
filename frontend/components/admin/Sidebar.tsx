"use client";

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
} from "lucide-react";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "Users", id: "users", href: "/admin/users" },
    { icon: Building2, label: "Listings", id: "listings", href: "/admin/dashboard" },
    { icon: BarChart3, label: "Reports", id: "reports", href: "/admin/dashboard" },
    { icon: Star, label: "Points", id: "points", href: "/admin/dashboard" },
];

interface SidebarProps {
    activeId?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ activeId = "dashboard", isOpen = false, onClose }: SidebarProps) {
    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full w-[280px] bg-[#0e0e0e] flex flex-col border-r border-white/5 z-50 py-8 shadow-[4px_0_24px_rgba(0,0,0,0.5)]
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0`}
            >
                {/* Brand + Close */}
                <div className="px-8 mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <LayoutDashboard size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
                                PG Nexus
                            </h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500/60 font-semibold">
                                Admin Console
                            </p>
                        </div>
                    </div>
                    {/* Close button — mobile only */}
                    <button onClick={onClose} className="lg:hidden text-zinc-500 hover:text-white transition-colors p-1">
                        <X size={20} />
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
                                    className={`flex items-center gap-4 py-3 px-6 text-sm font-medium transition-all duration-300 relative cursor-pointer
                                        ${isActive
                                            ? "bg-gradient-to-r from-purple-500/20 to-transparent text-white border-l-4 border-purple-400"
                                            : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
                                        }`}
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
                        <button className="flex items-center gap-4 text-zinc-500 py-2 hover:text-white transition-colors w-full text-sm">
                            <HelpCircle size={18} strokeWidth={1.8} />
                            <span>Help Center</span>
                        </button>
                        <button className="flex items-center gap-4 text-zinc-500 py-2 hover:text-red-400 transition-colors w-full text-sm">
                            <LogOut size={18} strokeWidth={1.8} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}