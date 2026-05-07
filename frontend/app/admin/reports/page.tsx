"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye,
    MessageSquare,
    CheckCircle2,
    Ban,
    AlertTriangle,
    Flag,
    ChevronLeft,
    ChevronRight,
    Download,
    SlidersHorizontal,
    X,
    Send,
    ShieldAlert,
    TrendingUp,
    Timer,
    Gavel,
    ShieldCheck,
    MessageCircle,
} from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import StatsCard from "@/components/admin/StatsCard";
import {
    mockAdminReports,
    mockReportStats,
    reportCategoryLabels,
    type AdminReport,
    type ReportCategory,
    type ReportPriority,
    type ReportTab,
} from "@/components/admin/mockData";
import { AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";

// ── Priority config ──
const priorityConfig: Record<ReportPriority, { dot: string; label: string }> = {
    high: { dot: "bg-red-500 animate-pulse", label: "High" },
    medium: { dot: "bg-blue-400", label: "Medium" },
    low: { dot: "bg-zinc-400", label: "Low" },
};

const reasonColors: Record<ReportCategory, { bg: string; text: string }> = {
    scam: { bg: "bg-red-500/15", text: "text-red-400" },
    harassment: { bg: "bg-pink-500/15", text: "text-pink-400" },
    inaccurate: { bg: "bg-blue-500/15", text: "text-blue-400" },
    spam: { bg: "bg-amber-500/15", text: "text-amber-400" },
    other: { bg: "bg-zinc-500/15", text: "text-zinc-400" },
};

const tabs: { id: ReportTab; label: string }[] = [
    { id: "active", label: "Active Queue" },
    { id: "archived", label: "Archived" },
    { id: "appeals", label: "Appeals" },
];

function ReportsContent() {
    const { isDark } = useAdminTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reports, setReports] = useState<AdminReport[]>(mockAdminReports);
    const [activeTab, setActiveTab] = useState<ReportTab>("active");
    const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
    const [moderatorNote, setModeratorNote] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterPriority, setFilterPriority] = useState<ReportPriority | "all">("all");
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const ITEMS_PER_PAGE = 5;

    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Filter by tab + priority
    const filtered = useMemo(() => {
        let result = reports;
        if (activeTab === "active") result = result.filter((r) => r.status === "open");
        else if (activeTab === "archived") result = result.filter((r) => r.status === "resolved");
        else if (activeTab === "appeals") result = result.filter((r) => r.status === "escalated");

        if (filterPriority !== "all") result = result.filter((r) => r.priority === filterPriority);

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (r) =>
                    r.id.toLowerCase().includes(q) ||
                    r.target.name.toLowerCase().includes(q) ||
                    r.reportedBy.toLowerCase().includes(q)
            );
        }
        return result;
    }, [reports, activeTab, searchQuery, filterPriority]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Actions
    const resolveReport = (id: string) => {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "resolved" as const } : r)));
        showToast(`Report ${id} resolved`, "success");
        if (selectedReport?.id === id) setSelectedReport(null);
    };

    const escalateReport = (id: string) => {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "escalated" as const } : r)));
        showToast(`Report ${id} escalated`, "info");
    };

    // Stats computed from data
    const stats = useMemo(() => {
        const open = reports.filter((r) => r.status === "open").length;
        const appeals = reports.filter((r) => r.status === "escalated").length;
        return { open, appeals };
    }, [reports]);

    return (
        <div className={`${isDark ? "bg-[#0e0e0e] text-white" : "bg-slate-50 text-slate-900"} min-h-screen transition-colors duration-300`}>
            <Sidebar activeId="reports" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Topbar
                searchQuery={searchQuery}
                onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
                searchPlaceholder="Search reports, user IDs..."
                onMenuToggle={() => setSidebarOpen(true)}
            />

            <main className="ml-0 pt-20 lg:pt-24 px-4 sm:px-6 lg:px-10 pb-20 min-h-screen">
                {/* Header */}
                <section className="mb-8 lg:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div>
                        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter mb-2 ${isDark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                            Reports &amp; Appeals
                        </h2>
                        <p className={`max-w-lg text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                            Management console for resolving platform integrity issues, user disputes, and listing violations.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${filterPriority !== "all"
                                        ? "bg-purple-500/20 border-purple-500/30 text-purple-500"
                                        : isDark
                                            ? "bg-zinc-800/60 border-white/5 text-white hover:bg-zinc-700/60"
                                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                                    }`}
                            >
                                <SlidersHorizontal size={14} /> {filterPriority === "all" ? "Filter" : filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)}
                            </button>
                            <AnimatePresence>
                                {showFilterMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className={`absolute right-0 top-full mt-2 w-44 backdrop-blur-xl border rounded-xl p-1.5 z-50 shadow-2xl ${isDark ? "bg-zinc-900/98 border-white/10" : "bg-white border-slate-200"
                                            }`}
                                    >
                                        {(["all", "high", "medium", "low"] as const).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => { setFilterPriority(p); setShowFilterMenu(false); setCurrentPage(1); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${filterPriority === p
                                                        ? "bg-purple-500/20 text-purple-500"
                                                        : isDark ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1) + " Priority"}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${isDark ? "bg-zinc-800/60 border-white/5 text-white hover:bg-zinc-700/60" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                            }`}>
                            <Download size={14} /> <span className="hidden sm:inline">Export</span> Logs
                        </button>
                    </div>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
                    <StatsCard title="Open Reports" value={stats.open.toString()} tag={mockReportStats.openReports.change} tagType="error" index={0} />
                    <StatsCard title="Avg Resolution" value={mockReportStats.avgResolution.value} tag={mockReportStats.avgResolution.label} tagType="secondary" index={1} />
                    <StatsCard title="Pending Appeals" value={stats.appeals.toString()} tag={mockReportStats.pendingAppeals.label} tagType="info" index={2} />
                    <StatsCard title="Trust Score" value={mockReportStats.trustScore.value} tag={mockReportStats.trustScore.label} tagType="tertiary" index={3} />
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                    {/* Reports Table */}
                    <div className={`xl:col-span-2 rounded-2xl border overflow-hidden ${isDark ? "bg-zinc-900/60 border-white/[0.04]" : "bg-white border-slate-200 shadow-sm"}`}>
                        {/* Table Tabs */}
                        <div className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                            <div className="flex gap-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                                        className={`text-xs sm:text-sm font-semibold pb-2 px-3 border-b-2 transition-colors ${activeTab === tab.id
                                                ? "text-purple-500 border-purple-500"
                                                : isDark ? "text-zinc-500 border-transparent hover:text-white" : "text-slate-500 border-transparent hover:text-slate-900"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <p className={`text-[11px] font-medium ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                {filtered.length} {activeTab === "active" ? "open" : activeTab} reports
                            </p>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead>
                                    <tr className={`text-[10px] uppercase tracking-widest ${isDark ? "text-zinc-500 bg-zinc-900/80" : "text-slate-500 bg-slate-50"}`}>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Report ID</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Target</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Reason</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Priority</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Time</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
                                    <AnimatePresence mode="popLayout">
                                        {paginated.length > 0 ? paginated.map((report) => {
                                            const rc = reasonColors[report.reason];
                                            const pc = priorityConfig[report.priority];
                                            return (
                                                <motion.tr
                                                    key={report.id}
                                                    layout
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className={`transition-colors group ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}
                                                >
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <span className="text-sm font-mono text-purple-400">#{report.id}</span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {report.target.avatar ? (
                                                                <img src={report.target.avatar} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-white/[0.06]" />
                                                            ) : (
                                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-zinc-800" : "bg-slate-100"}`}>
                                                                    <MessageCircle size={16} className={isDark ? "text-zinc-500" : "text-slate-400"} />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{report.target.name}</p>
                                                                <p className={`text-[11px] ${isDark ? "text-zinc-500" : "text-slate-500"}`}>{report.target.subLabel}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full ${rc.bg} ${rc.text} text-[10px] font-bold uppercase tracking-tight`}>
                                                            {reportCategoryLabels[report.reason]}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${pc.dot}`} />
                                                            <span className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{pc.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-4 sm:px-6 py-4 text-xs ${isDark ? "text-zinc-500" : "text-slate-500"}`}>{report.time}</td>
                                                    <td className="px-4 sm:px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1.5">
                                                            <button onClick={() => setSelectedReport(report)} className={`p-2 rounded-lg hover:bg-purple-500/20 hover:text-purple-400 transition-all ${isDark ? "bg-zinc-800/80 text-zinc-400" : "bg-slate-100 text-slate-500"}`} title="View">
                                                                <Eye size={15} />
                                                            </button>
                                                            <button onClick={() => resolveReport(report.id)} className="p-2 rounded-lg bg-purple-500 text-white hover:brightness-110 transition-all" title="Resolve">
                                                                <CheckCircle2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={6} className={`px-6 py-16 text-center text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                                    No reports in this category
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className={`p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                            <p className={`text-xs ${isDark ? "text-zinc-500" : "text-slate-500"}`}>Showing {paginated.length} of {filtered.length}</p>
                            <div className="flex gap-1.5">
                                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className={`w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all ${isDark ? "bg-zinc-800/80 text-white hover:bg-zinc-700" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => setCurrentPage(p)} className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${p === currentPage ? "bg-purple-500 text-white" : isDark ? "bg-zinc-800/80 text-white hover:bg-zinc-700" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{p}</button>
                                ))}
                                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all ${isDark ? "bg-zinc-800/80 text-white hover:bg-zinc-700" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inspector Panel */}
                    <div className={`rounded-2xl border p-5 sm:p-6 flex flex-col ${isDark ? "bg-zinc-900/60 border-white/[0.04]" : "bg-white border-slate-200 shadow-sm"}`}>
                        <h4 className={`text-lg font-bold mb-5 ${isDark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                            {selectedReport ? `Inspect: ${selectedReport.id}` : "Moderation Tools"}
                        </h4>

                        {selectedReport ? (
                            <div className="space-y-5 flex-1">
                                {/* Target Info */}
                                <div className={`flex items-center gap-3 rounded-xl p-4 border ${isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200"}`}>
                                    {selectedReport.target.avatar ? (
                                        <img src={selectedReport.target.avatar} alt="" className="w-11 h-11 rounded-xl object-cover border border-white/[0.06]" />
                                    ) : (
                                        <div className="w-11 h-11 rounded-xl bg-zinc-700 flex items-center justify-center"><MessageCircle size={18} className="text-zinc-400" /></div>
                                    )}
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{selectedReport.target.name}</p>
                                        <p className={`text-[11px] ${isDark ? "text-zinc-500" : "text-slate-500"}`}>{selectedReport.target.subLabel} • Reported by {selectedReport.reportedBy}</p>
                                    </div>
                                </div>

                                {selectedReport.description && (
                                    <div className={`rounded-xl p-4 border ${isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200"}`}>
                                        <p className={`text-[10px] uppercase tracking-widest font-semibold mb-1.5 ${isDark ? "text-zinc-500" : "text-slate-500"}`}>Description</p>
                                        <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-slate-700"}`}>{selectedReport.description}</p>
                                    </div>
                                )}

                                {/* Evidence thumbnails */}
                                {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">Evidence ({selectedReport.evidence.length})</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {selectedReport.evidence.map((url, i) => (
                                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/[0.04]">
                                                    <img src={url} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => { resolveReport(selectedReport.id); }} className="flex flex-col items-center p-3 bg-zinc-800/60 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-zinc-400 border border-white/[0.04]">
                                        <CheckCircle2 size={20} />
                                        <span className="text-[10px] font-bold mt-1.5 uppercase tracking-widest">Resolve</span>
                                    </button>
                                    <button onClick={() => { escalateReport(selectedReport.id); setSelectedReport(null); }} className="flex flex-col items-center p-3 bg-zinc-800/60 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 transition-all text-zinc-400 border border-white/[0.04]">
                                        <Flag size={20} />
                                        <span className="text-[10px] font-bold mt-1.5 uppercase tracking-widest">Escalate</span>
                                    </button>
                                    <button className="flex flex-col items-center p-3 bg-zinc-800/60 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-zinc-400 border border-white/[0.04]">
                                        <Ban size={20} />
                                        <span className="text-[10px] font-bold mt-1.5 uppercase tracking-widest">Ban User</span>
                                    </button>
                                    <button className="flex flex-col items-center p-3 bg-zinc-800/60 rounded-xl hover:bg-purple-500/10 hover:text-purple-400 transition-all text-zinc-400 border border-white/[0.04]">
                                        <AlertTriangle size={20} />
                                        <span className="text-[10px] font-bold mt-1.5 uppercase tracking-widest">Warn</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                                <div className="w-14 h-14 rounded-full bg-zinc-800/60 flex items-center justify-center mb-4">
                                    <ShieldAlert size={24} className="text-zinc-600" />
                                </div>
                                <p className="text-sm text-zinc-500">Select a report from the table to inspect details and take action.</p>
                            </div>
                        )}

                        {/* Moderator Note */}
                        <div className={`mt-auto pt-5 border-t ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? "text-zinc-500" : "text-slate-500"}`}>Moderator Note</p>
                            <textarea
                                value={moderatorNote}
                                onChange={(e) => setModeratorNote(e.target.value)}
                                placeholder="Type resolution details..."
                                rows={3}
                                className={`w-full rounded-xl text-sm py-3 px-4 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all mb-3 border ${isDark ? "bg-zinc-800/60 border-white/[0.04] text-white placeholder:text-zinc-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`}
                            />
                            <button
                                onClick={() => { if (selectedReport) { resolveReport(selectedReport.id); setModeratorNote(""); } }}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all active:scale-[0.98]"
                            >
                                Finalize Resolution
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 40, x: "-50%" }}
                        className={`fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-xl text-sm font-semibold shadow-2xl backdrop-blur-xl border border-white/10 whitespace-nowrap ${toast.type === "success" ? "bg-green-500/20 text-green-400" : toast.type === "error" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                            }`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <AdminThemeProvider>
            <ReportsContent />
        </AdminThemeProvider>
    );
}
