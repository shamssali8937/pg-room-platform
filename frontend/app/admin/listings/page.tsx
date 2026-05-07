"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Download,
} from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import StatsCard from "@/components/admin/StatsCard";
import ListingModerationCard from "@/components/admin/ListingModerationCard";
import ListingDetailModal from "@/components/admin/ListingDetailModal";
import ManualAuditModal from "@/components/admin/ManualAuditModal";
import {
    mockModerationListings,
    type ModerationListing,
    type ModerationStatus,
} from "@/components/admin/mockData";
import { AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";

type FilterTab = "all" | ModerationStatus;

const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "suspended", label: "Suspended" },
    { id: "audit", label: "Audit" },
];

function ListingsContent() {
    const { isDark } = useAdminTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [listings, setListings] = useState<ModerationListing[]>(mockModerationListings);
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    // Modals
    const [detailListing, setDetailListing] = useState<ModerationListing | null>(null);
    const [auditListing, setAuditListing] = useState<ModerationListing | null>(null);

    const ITEMS_PER_PAGE = 4;

    // ── Toast helper ──
    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Action handlers ──
    const handleApprove = (id: string) => {
        setListings((prev) =>
            prev.map((l) => (l.id === id ? { ...l, status: "approved" as const } : l))
        );
        showToast(`Listing #${id} approved successfully`, "success");
    };

    const handleReject = (id: string, reason: string) => {
        setListings((prev) => prev.filter((l) => l.id !== id));
        showToast(`Listing #${id} rejected — ${reason}`, "error");
    };

    const handleSuspend = (id: string) => {
        setListings((prev) =>
            prev.map((l) =>
                l.id === id
                    ? { ...l, status: "suspended" as const, flagReason: "Suspended by admin" }
                    : l
            )
        );
        showToast(`Listing #${id} has been suspended`, "error");
    };

    const handleFlag = (id: string) => {
        setListings((prev) =>
            prev.map((l) =>
                l.id === id
                    ? { ...l, status: "audit" as const, auditNote: "Flagged for manual review by admin." }
                    : l
            )
        );
        showToast(`Listing #${id} flagged for audit`, "info");
    };

    const handleDelete = (id: string) => {
        setListings((prev) => prev.filter((l) => l.id !== id));
        showToast(`Listing #${id} permanently deleted`, "error");
    };

    const handleReviewAppeal = (id: string) => {
        // Open detail view for appeal review
        const listing = listings.find((l) => l.id === id);
        if (listing) setDetailListing(listing);
    };

    const handleAudit = (id: string) => {
        const listing = listings.find((l) => l.id === id);
        if (listing) setAuditListing(listing);
    };

    const handleSkip = (id: string) => {
        showToast(`Listing #${id} skipped`, "info");
    };

    const handleViewDetail = (listing: ModerationListing) => {
        setDetailListing(listing);
    };

    // ── Filtered + searched listings ──
    const filtered = useMemo(() => {
        return listings.filter((l) => {
            if (activeTab !== "all" && l.status !== activeTab) return false;
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                l.title.toLowerCase().includes(q) ||
                l.id.toLowerCase().includes(q) ||
                l.host.name.toLowerCase().includes(q) ||
                l.location.toLowerCase().includes(q)
            );
        });
    }, [listings, activeTab, searchQuery]);

    // ── Pagination ──
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginatedListings = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ── Stats ──
    const stats = useMemo(() => {
        const pending = listings.filter((l) => l.status === "pending").length;
        const approved = listings.filter((l) => l.status === "approved").length;
        const suspended = listings.filter((l) => l.status === "suspended").length;
        const audit = listings.filter((l) => l.status === "audit").length;
        return { pending, approved, suspended, audit, total: listings.length };
    }, [listings]);

    const pendingCountForTab = listings.filter((l) => l.status === "pending").length;

    return (
        <div className={`${isDark ? "bg-[#0e0e0e] text-white" : "bg-slate-50 text-slate-900"} min-h-screen transition-colors duration-300`}>
            <Sidebar activeId="listings" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Topbar
                searchQuery={searchQuery}
                onSearchChange={(q) => {
                    setSearchQuery(q);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Search listings, owners, or IDs..."
                onMenuToggle={() => setSidebarOpen(true)}
            />

            <main className="ml-0 pt-20 lg:pt-24 px-4 sm:px-6 lg:px-10 pb-20 min-h-screen">
                {/* ── Page Header ── */}
                <section className="mb-8 lg:mb-12 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
                    <div className="space-y-2">
                        <h2
                            className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}
                            style={{ fontFamily: "Manrope, sans-serif" }}
                        >
                            Listing Moderation
                        </h2>
                        <p className={`max-w-lg text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                            Review and manage property submissions. Ensure quality standards and host
                            verification across the PG Nexus network.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className={`flex p-1.5 rounded-xl border overflow-x-auto flex-shrink-0 gap-0.5 ${isDark ? "bg-zinc-900/60 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                                        ? isDark ? "bg-zinc-800 text-white shadow-xl" : "bg-slate-100 text-slate-900 shadow"
                                        : isDark ? "text-zinc-500 hover:text-white" : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                {tab.label}
                                {tab.id === "pending" && pendingCountForTab > 0 && (
                                    <span className="ml-1.5 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-md text-[10px] font-bold">
                                        {pendingCountForTab}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Stats Strip ── */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
                    <StatsCard
                        title="Total Listings"
                        value={stats.total.toString()}
                        tag="Active in network"
                        tagType="info"
                        index={0}
                    />
                    <StatsCard
                        title="Pending Review"
                        value={stats.pending.toString()}
                        tag="Awaiting action"
                        tagType="tertiary"
                        index={1}
                    />
                    <StatsCard
                        title="Suspended"
                        value={stats.suspended.toString()}
                        tag="Policy violations"
                        tagType="error"
                        index={2}
                    />
                    <StatsCard
                        title="Audit Queue"
                        value={stats.audit.toString()}
                        tag="Manual review needed"
                        tagType="danger"
                        index={3}
                    />
                </section>

                {/* ── Toolbar ── */}
                <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                    <p className={`text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                        Showing{" "}
                        <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{paginatedListings.length}</span> of{" "}
                        <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{filtered.length}</span> listings
                        {activeTab !== "all" && (
                            <span className={isDark ? "text-zinc-600" : "text-slate-400"}> • filtered by {activeTab}</span>
                        )}
                    </p>
                    <div className="flex gap-2">
                        <button className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${isDark ? "bg-zinc-800/60 border-white/5 text-white hover:bg-zinc-700/60" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"}`}>
                            <SlidersHorizontal size={14} />
                            <span className="hidden sm:inline">Advanced</span> Filters
                        </button>
                        <button className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${isDark ? "bg-zinc-800/60 border-white/5 text-white hover:bg-zinc-700/60" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"}`}>
                            <Download size={14} />
                            <span className="hidden sm:inline">Export</span> CSV
                        </button>
                    </div>
                </section>

                {/* ── Bento Grid of Listing Cards ── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    <AnimatePresence mode="popLayout">
                        {paginatedListings.length > 0 ? (
                            paginatedListings.map((listing, i) => (
                                <ListingModerationCard
                                    key={listing.id}
                                    listing={listing}
                                    index={i}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onSuspend={handleSuspend}
                                    onFlag={handleFlag}
                                    onDelete={handleDelete}
                                    onReviewAppeal={handleReviewAppeal}
                                    onAudit={handleAudit}
                                    onSkip={handleSkip}
                                    onViewDetail={handleViewDetail}
                                />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-zinc-800/60" : "bg-slate-100"}`}>
                                    <SlidersHorizontal size={24} className={isDark ? "text-zinc-600" : "text-slate-400"} />
                                </div>
                                <p className={`text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                    {searchQuery
                                        ? `No listings matching "${searchQuery}"`
                                        : "No listings in this category"}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Pagination ── */}
                {filtered.length > ITEMS_PER_PAGE && (
                    <footer className={`mt-12 lg:mt-16 flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-8 lg:pt-10 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                        <div className={`text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                            Page <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{currentPage}</span> of{" "}
                            <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? "bg-zinc-900/60 border-white/5 text-white hover:bg-purple-500/20" : "bg-white border-slate-200 text-slate-700 hover:bg-purple-50 shadow-sm"}`}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${page === currentPage
                                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                            : isDark ? "bg-zinc-900/60 border border-white/5 text-white hover:bg-white/10" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? "bg-zinc-900/60 border-white/5 text-white hover:bg-purple-500/20" : "bg-white border-slate-200 text-slate-700 hover:bg-purple-50 shadow-sm"}`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </footer>
                )}
            </main>

            {/* ── Listing Detail Modal ── */}
            {detailListing && (
                <ListingDetailModal
                    listing={detailListing}
                    onClose={() => setDetailListing(null)}
                    onApprove={handleApprove}
                    onSuspend={handleSuspend}
                    onFlag={handleFlag}
                    onAudit={(id) => {
                        setDetailListing(null);
                        const l = listings.find((x) => x.id === id);
                        if (l) setAuditListing(l);
                    }}
                />
            )}

            {/* ── Manual Audit Modal ── */}
            {auditListing && (
                <ManualAuditModal
                    listing={auditListing}
                    onClose={() => setAuditListing(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onSuspend={handleSuspend}
                />
            )}

            {/* ── Toast Notification ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 40, x: "-50%" }}
                        className={`fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-xl text-sm font-semibold shadow-2xl shadow-black/40 backdrop-blur-xl border border-white/10 whitespace-nowrap ${toast.type === "success"
                            ? "bg-green-500/20 text-green-400"
                            : toast.type === "error"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ListingsPage() {
    return (
        <AdminThemeProvider>
            <ListingsContent />
        </AdminThemeProvider>
    );
}
