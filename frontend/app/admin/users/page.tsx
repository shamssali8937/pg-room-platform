"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import StatsCard from "@/components/admin/StatsCard";
import UserTable from "@/components/admin/UserTable";
import { Filter, Download } from "lucide-react";

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="bg-[#0e0e0e] text-white min-h-screen">
            <Sidebar activeId="users" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Topbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search accounts, UID, or names..."
                onMenuToggle={() => setSidebarOpen(true)}
            />

            <main className="ml-0 lg:ml-[280px] pt-24 lg:pt-32 px-4 sm:px-6 lg:px-10 pb-20 min-h-screen">
                {/* Header Section */}
                <section className="mb-8 lg:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter text-white mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                            User Management
                        </h2>
                        <p className="text-zinc-500 max-w-lg text-sm">
                            Manage PG Nexus ecosystem participants. Review verification requests and handle account standing actions.
                        </p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                        <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-800/60 rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-700/60 transition-colors border border-white/5 text-white">
                            <Filter size={14} />
                            <span className="hidden sm:inline">Advanced</span> Filters
                        </button>
                        <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-800/60 rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-700/60 transition-colors border border-white/5 text-white">
                            <Download size={14} />
                            <span className="hidden sm:inline">Export</span> CSV
                        </button>
                    </div>
                </section>

                {/* Stats Bento Grid */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-10">
                    <StatsCard title="Total Users" value="12,842" tag="+14% from last month" tagType="info" index={0} />
                    <StatsCard title="Active Now" value="3,104" tag="Real-time engagement" tagType="secondary" index={1} />
                    <StatsCard title="Pending Verification" value="128" tag="Action required" tagType="tertiary" index={2} />
                    <StatsCard title="Suspended" value="42" tag="Policy violations" tagType="error" index={3} />
                </section>

                {/* User Table */}
                <UserTable searchQuery={searchQuery} />
            </main>
        </div>
    );
}
