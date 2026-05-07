"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import OwnerSidebar from "@/components/owner/OwnerSidebar";
import OwnerTopbar from "@/components/owner/OwnerTopbar";
import { OwnerThemeProvider, useOwnerTheme } from "@/context/OwnerThemeContext";
import { Home, MessageSquare, Wallet, Settings } from "lucide-react";

function OwnerLayoutInner({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isDark } = useOwnerTheme();
    const pathname = usePathname();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) { // xl
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        
        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const bgClass = isDark ? "bg-[#0e0e0e] text-white" : "bg-slate-50 text-slate-900";
    
    // Margin when sidebar is open on xl screens
    const mainMargin = sidebarOpen ? "xl:ml-64" : "ml-0";

    // Determine active nav item
    let activeId = "dashboard";
    if (pathname?.includes("settings")) activeId = "settings";
    else if (pathname?.includes("listings")) activeId = "listings";
    else if (pathname?.includes("inquiries")) activeId = "inquiries";
    else if (pathname?.includes("wallet")) activeId = "wallet";
    else if (pathname?.includes("dashboard")) activeId = "dashboard";

    const router = useRouter();

    return (
        <div className={`min-h-screen font-body transition-colors ${bgClass} selection:bg-violet-500/30 selection:text-violet-200`}>
            
            <OwnerSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                activeId={activeId} 
            />
            
            <div className={`flex flex-col min-h-screen transition-all duration-300 ${mainMargin}`}>
                <OwnerTopbar onMenuToggle={() => setSidebarOpen(true)} />
                <main className="flex-1 p-6 md:p-10 pb-32 md:pb-10 mt-16 lg:mt-20">
                    {children}
                </main>
            </div>
            
            {/* Floating Dock (Navigation Fallback for Small Screens) */}
            <div className={`md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-full border z-[45] flex items-center gap-8 shadow-2xl backdrop-blur-[20px] transition-colors ${
                isDark ? 'bg-[#262626]/60 border-white/10' : 'bg-white/80 border-slate-200 shadow-[0_10px_40px_-10px_rgba(138,92,246,0.15)]'
            }`}>
                <button onClick={() => router.push('/owner/dashboard')}>
                    <Home size={24} className={activeId === 'dashboard' ? 'text-violet-500' : isDark ? 'text-zinc-400' : 'text-slate-400'} />
                </button>
                <button onClick={() => router.push('/owner/inquiries')}>
                    <MessageSquare size={24} className={activeId === 'inquiries' ? 'text-violet-500' : isDark ? 'text-zinc-400' : 'text-slate-400'} />
                </button>
                <button onClick={() => router.push('/owner/wallet')}>
                    <Wallet size={24} className={activeId === 'wallet' ? 'text-violet-500' : isDark ? 'text-zinc-400' : 'text-slate-400'} />
                </button>
                <button onClick={() => router.push('/owner/settings')}>
                    <Settings size={24} className={activeId === 'settings' ? 'text-violet-500' : isDark ? 'text-zinc-400' : 'text-slate-400'} />
                </button>
            </div>
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
