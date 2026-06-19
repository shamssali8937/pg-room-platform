"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import OwnerSidebar from "@/components/owner/OwnerSidebar";
import OwnerTopbar from "@/components/owner/OwnerTopbar";
import { OwnerThemeProvider, useOwnerTheme } from "@/context/OwnerThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Home, MessageSquare, Wallet, Settings, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchConversations } from "@/store/slices/chatSlice";
import { useSocket } from "@/hooks/useSocket";

// Map owner pathnames to search placeholder text
function getOwnerPlaceholder(pathname: string): string {
    if (pathname.includes("/owner/bookings")) return "Search bookings, tenants, rooms...";
    if (pathname.includes("/owner/listings")) return "Search my listings, status, location...";
    if (pathname.includes("/owner/inquiries")) return "Search inquiries, tenants...";
    if (pathname.includes("/owner/wallet")) return "Search transactions, details...";
    if (pathname.includes("/owner/settings")) return "Search disabled on this page";
    return "Search Properties...";
}

function OwnerLayoutInner({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isDark, searchQuery, setSearchQuery } = useOwnerTheme();
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const dispatch = useAppDispatch();
    const conversations = useAppSelector((s) => s.chat.conversations);
    const activeConversationId = useAppSelector((s) => s.chat.activeConversationId);
    const conversationIds = useMemo(() => conversations.map((c) => c.id), [conversations]);
    // Global socket listener for real-time messages on any page
    useSocket(conversationIds);

    // Fetch conversations globally so badges work on all pages
    useEffect(() => {
        if (isAuthenticated && user) {
            dispatch(fetchConversations());
        }
    }, [isAuthenticated, user, dispatch]);

    const prevPathnameRef = useRef(pathname);

    // Clear global search query on page transition, EXCEPT when redirecting from dashboard to listings with search query
    useEffect(() => {
        const isSearchRedirect = prevPathnameRef.current === "/owner/dashboard" && pathname === "/owner/listings";
        if (!isSearchRedirect) {
            setSearchQuery("");
        }
        prevPathnameRef.current = pathname;
    }, [pathname, setSearchQuery]);

    // Redirection rule: if user types in search bar from dashboard, redirect to listings
    useEffect(() => {
        if (searchQuery && pathname === "/owner/dashboard") {
            router.push("/owner/listings");
        }
    }, [searchQuery, pathname, router]);

    // ── Auth Guard ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== "owner" && user?.role !== "admin"))) {
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

    // Show loader while auth is resolving or redirecting
    if (isLoading || !isAuthenticated || (user?.role !== "owner" && user?.role !== "admin")) {
        return (
            <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin text-violet-500 mb-4" size={48} />
                <p className="text-gray-400">Loading Owner Portal...</p>
            </div>
        );
    }

    const bgClass = isDark ? "bg-[#0e0e0e] text-white" : "bg-slate-50 text-slate-900";
    const mainMargin = sidebarOpen ? "xl:ml-64" : "ml-0";

    let activeId = "dashboard";
    if (pathname?.includes("settings")) activeId = "settings";
    else if (pathname?.includes("listings")) activeId = "listings";
    else if (pathname?.includes("bookings")) activeId = "bookings";
    else if (pathname?.includes("inquiries")) activeId = "inquiries";
    else if (pathname?.includes("wallet")) activeId = "wallet";
    else if (pathname?.includes("dashboard")) activeId = "dashboard";

    const placeholder = getOwnerPlaceholder(pathname);

    return (
        <div className={`min-h-screen font-body transition-colors ${bgClass} selection:bg-violet-500/30 selection:text-violet-200`}>

            <OwnerSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeId={activeId}
            />

            <div className={`flex flex-col min-h-screen transition-all duration-300 ${mainMargin}`}>
                <OwnerTopbar 
                    onMenuToggle={() => setSidebarOpen(true)} 
                    sidebarOpen={sidebarOpen} 
                    searchPlaceholder={placeholder}
                    searchDisabled={pathname.includes("/owner/settings")}
                />
                {(() => {
                    const isChatPage = pathname?.includes("/inquiries");
                    const mainPadding = isChatPage
                        ? "p-0 md:p-6 lg:p-8 mt-16 lg:mt-20 pb-0"
                        : "p-6 md:p-10 pb-32 md:pb-10 mt-16 lg:mt-20";
                    return (
                        <main className={`flex-1 ${mainPadding}`}>
                            {children}
                        </main>
                    );
                })()}
            </div>

            {/* Floating Dock (Navigation Fallback for Small Screens) */}
            {!(pathname?.includes("/inquiries") && activeConversationId) && (
                <div className={`md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-full border z-[45] flex items-center gap-8 shadow-2xl backdrop-blur-[20px] transition-colors ${
                    isDark ? 'bg-[#262626]/60 border-white/10' : 'bg-white/80 border-slate-200 shadow-[0_10px_40px_-10px_rgba(138,92,246,0.15)]'
                }`}>
                    <button onClick={() => router.push('/owner/dashboard')}>
                        <Home size={24} className={activeId === 'dashboard' ? 'text-violet-500' : isDark ? 'text-zinc-400' : 'text-slate-400'} />
                    </button>
                    <button onClick={() => router.push('/owner/inquiries')} className="relative">
                        <MessageSquare size={24} className={activeId === 'inquiries' ? 'text-violet-500' : isDark ? 'text-zinc-400' : 'text-slate-400'} />
                        {conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0) > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </button>
                    <button onClick={() => router.push('/owner/wallet')}>
                        <Wallet size={24} className={activeId === 'wallet' ? 'text-violet-500' : isDark ? 'text-zinc-400' : 'text-slate-400'} />
                    </button>
                    <button onClick={() => router.push('/owner/settings')}>
                        <Settings size={24} className={activeId === 'settings' ? 'text-violet-500' : isDark ? 'text-zinc-400' : 'text-slate-400'} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <OwnerThemeProvider>
            <OwnerLayoutInner>{children}</OwnerLayoutInner>
        </OwnerThemeProvider>
    );
}
