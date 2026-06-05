"use client";

import { useState, useMemo } from "react";
import StatsCard from "@/components/admin/StatsCard";
import UserTable from "@/components/admin/UserTable";
import { Filter, Download } from "lucide-react";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { useAppSelector } from "@/store/hooks";

export default function UsersPage() {
    const { isDark } = useAdminTheme();
    const { users, isLoading } = useAppSelector((state) => state.admin);

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("All");
    const [statusFilter, setStatusFilter] = useState<string>("Any");

    // Compute real stats from Redux data
    const total = users.length;
    const active = users.filter((u) => u.account_status === "active").length;
    const suspended = users.filter((u) => u.account_status === "suspended").length;
    const owners = users.filter((u) => u.role === "owner").length;

    // Filtered users matching the table logic
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            // Role Filter
            if (roleFilter !== "All") {
                const roleFormatted = u.role.charAt(0).toUpperCase() + u.role.slice(1);
                if (roleFormatted !== roleFilter) return false;
            }
            // Status Filter
            if (statusFilter !== "Any") {
                let statusFormatted = "Active";
                if (u.account_status.toLowerCase() === "suspended") statusFormatted = "Suspended";
                if (u.account_status.toLowerCase() === "warned") statusFormatted = "Warned";
                if (statusFormatted !== statusFilter) return false;
            }
            // Search Query
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (
                    u.full_name?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q) ||
                    u.id?.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [users, roleFilter, statusFilter, searchQuery]);

    const handleExportCSV = () => {
        const headers = ["ID", "Name", "Email", "Role", "Verification Status", "Account Status", "Joined At"];
        const rows = filteredUsers.map(u => {
            const roleFormatted = u.role.charAt(0).toUpperCase() + u.role.slice(1);
            let statusFormatted = "Active";
            if (u.account_status.toLowerCase() === "suspended") statusFormatted = "Suspended";
            if (u.account_status.toLowerCase() === "warned") statusFormatted = "Warned";

            let verificationFormatted = "Pending";
            if (u.verification_status && u.verification_status.toLowerCase() === "verified") {
                verificationFormatted = "Verified";
            } else if (u.verification_status && u.verification_status.toLowerCase() === "rejected") {
                verificationFormatted = "Rejected";
            }

            return [
                u.id,
                `"${u.full_name.replace(/"/g, '""')}"`,
                u.email,
                roleFormatted,
                verificationFormatted,
                statusFormatted,
                new Date(u.created_at).toLocaleDateString()
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const pageBg = isDark ? "bg-[#0e0e0e] text-white" : "bg-slate-50 text-slate-900";
    const headingColor = isDark ? "text-white" : "text-slate-900";
    const subText = isDark ? "text-zinc-500" : "text-slate-500";
    const btnClass = isDark
        ? "bg-zinc-800/60 border-white/5 text-white hover:bg-zinc-700/60"
        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm";

    return (
        <main className="ml-0 pt-20 lg:pt-24 px-4 sm:px-6 lg:px-10 pb-20 min-h-screen">
                {/* Header Section */}
                <section className="mb-8 lg:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div>
                        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter mb-2 ${headingColor}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                            User Management
                        </h2>
                        <p className={`max-w-lg text-sm ${subText}`}>
                            Manage PG Nexus ecosystem participants. Review verification requests and handle account standing actions.
                        </p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                        <button className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${btnClass}`}>
                            <Filter size={14} />
                            <span className="hidden sm:inline">Advanced</span> Filters
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${btnClass}`}
                        >
                            <Download size={14} />
                            <span className="hidden sm:inline">Export</span> CSV
                        </button>
                    </div>
                </section>

                {/* Stats Bento Grid — real data from Redux */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-10">
                    <StatsCard title="Total Users" value={isLoading ? "..." : String(total)} tag="All registered accounts" tagType="info" index={0} />
                    <StatsCard title="Active Users" value={isLoading ? "..." : String(active)} tag="Currently active" tagType="secondary" index={1} />
                    <StatsCard title="Property Owners" value={isLoading ? "..." : String(owners)} tag="Listing owners" tagType="tertiary" index={2} />
                    <StatsCard title="Suspended" value={isLoading ? "..." : String(suspended)} tag="Policy violations" tagType="error" index={3} />
                </section>

                {/* User Table */}
                <UserTable
                    searchQuery={searchQuery}
                    roleFilter={roleFilter as any}
                    setRoleFilter={setRoleFilter}
                    statusFilter={statusFilter as any}
                    setStatusFilter={setStatusFilter}
                />
            </main>
    );
}
