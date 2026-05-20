"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import TenantSidebar from "@/components/tenant/TenantSidebar";
import TenantTopbar from "@/components/tenant/TenantTopbar";
import { TenantThemeProvider, useTenantTheme } from "@/context/TenantThemeContext";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Search, CalendarCheck, MessageSquare, ShieldCheck, Loader2 } from "lucide-react";

function TenantLayoutInner({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isDark } = useTenantTheme();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== "tenant" && user?.role !== "admin"))) {
            router.replace("/auth/signin");
        }
    }, [user, isLoading, isAuthenticated, router]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isLoading || !isAuthenticated || (user?.role !== "tenant" && user?.role !== "admin")) {
        return (
            <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
                <p className="text-gray-400">Loading Tenant Portal...</p>
            </div>
        );
    }

    const bgClass = isDark
        ? "bg-[#0f0f11] text-white"
        : "bg-[#f8fafc] text-slate-900";

    const mainMargin = sidebarOpen ? "xl:ml-64" : "ml-0";

    let activeId = "dashboard";
    if (pathname?.includes("browse")) activeId = "browse";
    else if (pathname?.includes("bookings")) activeId = "bookings";
    else if (pathname?.includes("inbox")) activeId = "inbox";
    else if (pathname?.includes("identity")) activeId = "identity";
    else if (pathname?.includes("preferences")) activeId = "preferences";
    else if (pathname?.includes("dashboard")) activeId = "dashboard";

    const dockItems = [
        { id: "dashboard", icon: LayoutDashboard, href: "/tenant/dashboard" },
        { id: "browse", icon: Search, href: "/tenant/browse" },
        { id: "bookings", icon: CalendarCheck, href: "/tenant/bookings" },
        { id: "inbox", icon: MessageSquare, href: "/tenant/inbox" },
        { id: "identity", icon: ShieldCheck, href: "/tenant/identity" },
    ];

    return (
        <div className={`min-h-screen font-body transition-colors ${bgClass} selection:bg-violet-500/30 selection:text-violet-200`}>
            <TenantSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeId={activeId}
            />

            <div className={`flex flex-col min-h-screen transition-all duration-300 ${mainMargin}`}>
                <TenantTopbar onMenuToggle={() => setSidebarOpen(true)} />
                <main className="flex-1 p-6 md:p-10 pb-32 md:pb-10 mt-16 lg:mt-20">
                    {children}
                </main>
            </div>

            {/* Floating Dock (Mobile) */}
            <div className={`md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3.5 rounded-full border z-[45] flex items-center gap-6 shadow-2xl backdrop-blur-[20px] transition-colors ${isDark ? "bg-[#262626]/60 border-white/10" : "bg-white/80 border-slate-200 shadow-[0_10px_40px_-10px_rgba(138,92,246,0.15)]"
                }`}>
                {dockItems.map(({ id, icon: Icon, href }) => (
                    <button key={id} onClick={() => router.push(href)}>
                        <Icon size={22} className={activeId === id ? "text-[#a27cff]" : isDark ? "text-zinc-400" : "text-slate-400"} />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    return (
        <TenantThemeProvider>
            <TenantLayoutInner>{children}</TenantLayoutInner>
        </TenantThemeProvider>
    );
}
