"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import StatsCard from "@/components/admin/StatsCard";
import ListingsTable from "@/components/admin/ListingsTable";
import ActivityPanel from "@/components/admin/ActivityPanel";
import FloatingAction from "@/components/admin/FloatingAction";
import { AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";

function DashboardContent() {
    const { isDark } = useAdminTheme();

    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={`${isDark ? "bg-[#0e0e0e] text-white" : "bg-slate-50 text-slate-900"} min-h-screen transition-colors duration-300`}>
            <Sidebar activeId="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Topbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search Listings..."
                onMenuToggle={() => setSidebarOpen(true)}
            />

            <main className="ml-0 pt-20 lg:pt-24 px-4 sm:px-6 lg:px-10 pb-20 min-h-screen">
                {/* Header */}
                <section className="mb-8 lg:mb-12">
                    <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter mb-2 ${isDark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                        Curator Dashboard
                    </h2>
                    <p className={`text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>Welcome back, Elite Administrator.</p>
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
                    <StatsCard title="Active Listings" value="1,284" tag="+12% from last month" tagType="trend" index={0} />
                    <StatsCard title="Pending Approvals" value="42" tag="New entries" tagType="info" index={1} />
                    <StatsCard title="Reported Items" value="08" tag="Action required" tagType="danger" index={2} />
                    <StatsCard title="Active Users" value="8,920" tag="Live now" tagType="secondary" index={3} />
                </section>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <ListingsTable searchQuery={searchQuery} />
                    <ActivityPanel />
                </div>
            </main>

            <FloatingAction />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <AdminThemeProvider>
            <DashboardContent />
        </AdminThemeProvider>
    );
}