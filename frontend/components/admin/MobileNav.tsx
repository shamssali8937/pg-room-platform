"use client";

import Link from "next/link";
import { LayoutDashboard, Building2, Users, BarChart3, Star } from "lucide-react";

const items = [
    { icon: LayoutDashboard, id: "dashboard", href: "/admin/dashboard" },
    { icon: Building2, id: "listings", href: "/admin/listings" },
    { icon: Users, id: "users", href: "/admin/users" },
    { icon: BarChart3, id: "reports", href: "/admin/reports" },
    { icon: Star, id: "points", href: "/admin/points" },
];

interface MobileNavProps {
    activeId?: string;
}

export default function MobileNav({ activeId = "dashboard" }: MobileNavProps) {
    return (
        <nav className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-zinc-900/70 backdrop-blur-xl rounded-full px-8 py-4 z-50 flex justify-between items-center border border-white/[0.08] shadow-2xl shadow-black/50">
            {items.map((item) => {
                const isActive = item.id === activeId;
                return (
                    <Link key={item.id} href={item.href}>
                        <div className={`p-2 rounded-full transition-colors ${isActive ? "text-purple-400" : "text-zinc-500 hover:text-zinc-300"}`}>
                            <item.icon size={22} fill={isActive ? "currentColor" : "none"} />
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
