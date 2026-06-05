"use client";

import { useState } from "react";
import { AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { usePathname } from "next/navigation";

// Map pathnames to active sidebar IDs
function getActiveId(pathname: string): string {
    if (pathname.includes("/admin/users")) return "users";
    if (pathname.includes("/admin/listings")) return "listings";
    if (pathname.includes("/admin/reports")) return "reports";
    if (pathname.includes("/admin/points")) return "points";
    if (pathname.includes("/admin/reviews")) return "reviews";
    if (pathname.includes("/admin/inquiries")) return "inquiries";
    if (pathname.includes("/admin/inbox")) return "inbox";
    return "dashboard";
}

// Map pathnames to search placeholder text
function getPlaceholder(pathname: string): string {
    if (pathname.includes("/admin/users")) return "Search accounts, UID, or names...";
    if (pathname.includes("/admin/listings")) return "Search listings, owners, or IDs...";
    if (pathname.includes("/admin/reports")) return "Search reports, user IDs...";
    if (pathname.includes("/admin/points")) return "Search transactions, users or IDs...";
    if (pathname.includes("/admin/reviews")) return "Search reviews, rooms, reviewers...";
    if (pathname.includes("/admin/inquiries")) return "Search by tenant, owner, room...";
    if (pathname.includes("/admin/inbox")) return "Search support tickets...";
    return "Search Listings...";
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { isDark } = useAdminTheme();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const activeId = getActiveId(pathname);
    const placeholder = getPlaceholder(pathname);

    return (
        <div
            className={`${isDark ? "bg-[#0e0e0e] text-white" : "bg-slate-50 text-slate-900"} min-h-screen transition-colors duration-300`}
        >
            <Sidebar
                activeId={activeId}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <Topbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={placeholder}
                onMenuToggle={() => setSidebarOpen(true)}
            />
            {/* Pass searchQuery down via data attribute so pages can pick it up if needed */}
            <div data-search={searchQuery}>
                {children}
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminThemeProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminThemeProvider>
    );
}
