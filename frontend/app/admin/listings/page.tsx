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

type FilterTab = "all" | ModerationStatus;

const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "suspended", label: "Suspended" },
    { id: "audit", label: "Audit" },
];

export default function ListingsPage() {
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
        <div className="bg-[#0e0e0e] text-white min-h-screen">
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

            <main className="ml-0 lg:ml-[280px] pt-24 lg:pt-32 px-4 sm:px-6 lg:px-10 pb-20 min-h-screen">
                {/* ── Page Header ── */}
                <section className="mb-8 lg:mb-12 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
                    <div className="space-y-2">
                        <h2
                            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter text-white"
                            style={{ fontFamily: "Manrope, sans-serif" }}
                        >
                            Listing Moderation
                        </h2>
                        <p className="text-zinc-500 max-w-lg text-sm">
                            Review and manage property submissions. Ensure quality standards and host
                            verification across the PG Nexus network.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-zinc-900/60 p-1.5 rounded-xl border border-white/5 overflow-x-auto flex-shrink-0 gap-0.5">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                                        ? "bg-zinc-800 text-white shadow-xl"
                                        : "text-zinc-500 hover:text-white"
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
                    <p className="text-sm text-zinc-500">
                        Showing{" "}
                        <span className="text-white font-bold">{paginatedListings.length}</span> of{" "}
                        <span className="text-white font-bold">{filtered.length}</span> listings
                        {activeTab !== "all" && (
                            <span className="text-zinc-600"> • filtered by {activeTab}</span>
                        )}
                    </p>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-800/60 rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-700/60 transition-colors border border-white/5 text-white">
                            <SlidersHorizontal size={14} />
                            <span className="hidden sm:inline">Advanced</span> Filters
                        </button>
                        <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-800/60 rounded-xl text-xs sm:text-sm font-semibold hover:bg-zinc-700/60 transition-colors border border-white/5 text-white">
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
                                <div className="w-16 h-16 rounded-full bg-zinc-800/60 flex items-center justify-center mb-4">
                                    <SlidersHorizontal size={24} className="text-zinc-600" />
                                </div>
                                <p className="text-zinc-500 text-sm">
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
                    <footer className="mt-12 lg:mt-16 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 pt-8 lg:pt-10">
                        <div className="text-sm text-zinc-500">
                            Page <span className="text-white font-bold">{currentPage}</span> of{" "}
                            <span className="text-white font-bold">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900/60 border border-white/5 text-white hover:bg-purple-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${page === currentPage
                                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                            : "bg-zinc-900/60 border border-white/5 text-white hover:bg-white/10"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900/60 border border-white/5 text-white hover:bg-purple-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
