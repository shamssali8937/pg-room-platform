"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star,
    MessageSquare,
    CheckCircle2,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Download,
    ShieldAlert,
    MessageCircle,
    Loader2,
    X,
    Check,
    AlertOctagon
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import { useAdminTheme } from "@/context/AdminThemeContext";
import api from "@/lib/api";

interface Review {
    id: string;
    room_id: string;
    reviewer_id: string;
    reviewee_id: string;
    booking_id: string;
    rating: number;
    comment: string | null;
    moderation_status: string;
    created_at: string;
    reviewer: { id: string; full_name: string; email: string; profile_photo_url: string | null };
    reviewee: { id: string; full_name: string; email: string };
    room: { id: string; title: string };
}

export default function ReviewsPage() {
    const { isDark, searchQuery } = useAdminTheme();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterRating, setFilterRating] = useState<string>("all");
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    const ITEMS_PER_PAGE = 6;

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get("/admin/reviews");
            setReviews(data.data || []);
        } catch (err: any) {
            showToast("Failed to fetch reviews", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Filter reviews
    const filteredReviews = useMemo(() => {
        return reviews.filter((r) => {
            // Status filter
            if (filterStatus !== "all" && r.moderation_status !== filterStatus) return false;
            // Rating filter
            if (filterRating !== "all" && r.rating.toString() !== filterRating) return false;
            // Search query
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (
                    r.reviewer.full_name.toLowerCase().includes(q) ||
                    r.room.title.toLowerCase().includes(q) ||
                    (r.comment && r.comment.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [reviews, filterStatus, filterRating, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
    const paginatedReviews = filteredReviews.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Actions
    const handleModerateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/admin/reviews/${id}`, { moderationStatus: status });
            showToast(`Review status updated to ${status}`, "success");
            // Update local state
            setReviews((prev) =>
                prev.map((r) => (r.id === id ? { ...r, moderation_status: status } : r))
            );
            if (selectedReview?.id === id) {
                setSelectedReview((prev) => (prev ? { ...prev, moderation_status: status } : null));
            }
        } catch (err: any) {
            showToast("Failed to update status", "error");
        }
    };

    const handleDeleteReview = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this review?")) return;
        try {
            await api.delete(`/admin/reviews/${id}`);
            showToast("Review deleted successfully", "success");
            setReviews((prev) => prev.filter((r) => r.id !== id));
            if (selectedReview?.id === id) setSelectedReview(null);
        } catch (err: any) {
            showToast("Failed to delete review", "error");
        }
    };

    // Stats
    const stats = useMemo(() => {
        const total = reviews.length;
        const pending = reviews.filter((r) => r.moderation_status === "pending").length;
        const approved = reviews.filter((r) => r.moderation_status === "approved").length;
        const average =
            total > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
                : "0.0";
        return { total, pending, approved, average };
    }, [reviews]);

    return (
        <main className="ml-0 pt-20 lg:pt-24 px-4 sm:px-6 lg:px-10 pb-20 min-h-screen">
                {/* Header */}
                <section className="mb-8 lg:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div>
                        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter mb-2 ${isDark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                            Reviews Moderation
                        </h2>
                        <p className={`max-w-lg text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                            Inspect tenant feedback, check rating distributions, and remove abusive or fake review content.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${
                                    filterStatus !== "all" || filterRating !== "all"
                                        ? "bg-purple-500/20 border-purple-500/30 text-purple-500"
                                        : isDark
                                        ? "bg-zinc-800/60 border-white/5 text-white hover:bg-zinc-700/60"
                                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                                }`}
                            >
                                <SlidersHorizontal size={14} /> Filter
                            </button>
                            <AnimatePresence>
                                {showFilterMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className={`absolute right-0 top-full mt-2 w-56 backdrop-blur-xl border rounded-xl p-3 z-50 shadow-2xl space-y-3 ${
                                            isDark ? "bg-zinc-900/98 border-white/10" : "bg-white border-slate-200"
                                        }`}
                                    >
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Status</p>
                                            <div className="space-y-1">
                                                {["all", "approved", "pending", "flagged", "hidden"].map((st) => (
                                                    <button
                                                        key={st}
                                                        onClick={() => {
                                                            setFilterStatus(st);
                                                            setCurrentPage(1);
                                                        }}
                                                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                            filterStatus === st
                                                                ? "bg-purple-500/20 text-purple-400"
                                                                : isDark
                                                                ? "text-zinc-400 hover:text-white hover:bg-white/5"
                                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        {st.charAt(0).toUpperCase() + st.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Rating</p>
                                            <div className="grid grid-cols-5 gap-1">
                                                {["all", "5", "4", "3", "2", "1"].map((rt) => (
                                                    <button
                                                        key={rt}
                                                        onClick={() => {
                                                            setFilterRating(rt);
                                                            setCurrentPage(1);
                                                        }}
                                                        className={`py-1 rounded-lg text-xs font-semibold text-center border transition-colors ${
                                                            filterRating === rt
                                                                ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                                                                : isDark
                                                                ? "bg-zinc-800 border-transparent text-zinc-400 hover:text-white"
                                                                : "bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200"
                                                        }`}
                                                    >
                                                        {rt === "all" ? "All" : rt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setFilterStatus("all");
                                                setFilterRating("all");
                                                setShowFilterMenu(false);
                                            }}
                                            className="w-full py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                                        >
                                            Reset Filters
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
                    <StatsCard title="Total Reviews" value={stats.total.toString()} tag="Lifetime" tagType="secondary" index={0} />
                    <StatsCard title="Average Rating" value={stats.average} tag="Out of 5.0" tagType="tertiary" index={1} />
                    <StatsCard title="Pending Moderation" value={stats.pending.toString()} tag="Awaiting review" tagType="info" index={2} />
                    <StatsCard title="Approved Reviews" value={stats.approved.toString()} tag="Live on site" tagType="trend" index={3} />
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                    {/* Reviews Table */}
                    <div className={`xl:col-span-2 rounded-2xl border overflow-hidden ${isDark ? "bg-zinc-900/60 border-white/[0.04]" : "bg-white border-slate-200 shadow-sm"}`}>
                        <div className={`p-4 sm:p-6 border-b flex justify-between items-center ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                            <h3 className="text-sm font-bold">Reviews List</h3>
                            <p className={`text-[11px] font-medium ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                {filteredReviews.length} match(es)
                            </p>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead>
                                    <tr className={`text-[10px] uppercase tracking-widest ${isDark ? "text-zinc-500 bg-zinc-900/80" : "text-slate-500 bg-slate-50"}`}>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Reviewer</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Room / Target</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Rating</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Comment</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Status</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-sm">
                                                <Loader2 className="animate-spin text-purple-500 mx-auto" size={24} />
                                            </td>
                                        </tr>
                                    ) : (
                                        <AnimatePresence mode="popLayout">
                                            {paginatedReviews.length > 0 ? (
                                                paginatedReviews.map((review) => (
                                                    <motion.tr
                                                        key={review.id}
                                                        layout
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        className={`transition-colors group ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}
                                                    >
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={review.reviewer.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer.full_name)}&background=8b5cf6&color=fff`}
                                                                    alt=""
                                                                    className="w-9 h-9 rounded-full object-cover border border-white/[0.06] flex-shrink-0"
                                                                />
                                                                <div className="min-w-0">
                                                                    <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{review.reviewer.full_name}</p>
                                                                    <p className={`text-[11px] ${isDark ? "text-zinc-500" : "text-slate-500"}`}>{review.reviewer.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <div className="min-w-0">
                                                                <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{review.room.title}</p>
                                                                <p className={`text-[11px] ${isDark ? "text-zinc-500" : "text-slate-500"}`}>To: {review.reviewee.full_name}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        size={12}
                                                                        fill={i < review.rating ? "currentColor" : "none"}
                                                                        className={i < review.rating ? "text-amber-400" : "text-zinc-600"}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 max-w-[200px]">
                                                            <p className={`text-xs truncate ${isDark ? "text-zinc-300" : "text-slate-600"}`}>
                                                                {review.comment ?? <span className="italic opacity-55">No comment</span>}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <span
                                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                                                                    review.moderation_status === "approved"
                                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                                        : review.moderation_status === "pending"
                                                                        ? "bg-amber-500/10 text-amber-400"
                                                                        : review.moderation_status === "flagged"
                                                                        ? "bg-red-500/10 text-red-400"
                                                                        : "bg-zinc-500/15 text-zinc-400"
                                                                }`}
                                                            >
                                                                {review.moderation_status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => setSelectedReview(review)}
                                                                    className={`p-2 rounded-lg hover:bg-purple-500/20 hover:text-purple-400 transition-all ${
                                                                        isDark ? "bg-zinc-800/80 text-zinc-400" : "bg-slate-100 text-slate-500"
                                                                    }`}
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={15} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteReview(review.id)}
                                                                    className={`p-2 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all ${
                                                                        isDark ? "bg-zinc-800/80 text-zinc-400" : "bg-slate-100 text-slate-500"
                                                                    }`}
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className={`px-6 py-16 text-center text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                                        No reviews found matching the filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className={`p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                            <p className={`text-xs ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                Showing {paginatedReviews.length} of {filteredReviews.length}
                            </p>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all ${
                                        isDark ? "bg-zinc-800/80 text-white hover:bg-zinc-700" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                                            p === currentPage
                                                ? "bg-purple-500 text-white"
                                                : isDark
                                                ? "bg-zinc-800/80 text-white hover:bg-zinc-700"
                                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all ${
                                        isDark ? "bg-zinc-800/80 text-white hover:bg-zinc-700" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inspector Panel */}
                    <div className={`rounded-2xl border p-5 sm:p-6 flex flex-col ${isDark ? "bg-zinc-900/60 border-white/[0.04]" : "bg-white border-slate-200 shadow-sm"}`}>
                        <h4 className={`text-lg font-bold mb-5 ${isDark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                            Review Inspector
                        </h4>

                        {selectedReview ? (
                            <div className="space-y-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className={`flex items-center gap-3 rounded-xl p-4 border ${isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200"}`}>
                                        <img
                                            src={selectedReview.reviewer.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedReview.reviewer.full_name)}&background=8b5cf6&color=fff`}
                                            alt=""
                                            className="w-11 h-11 rounded-xl object-cover border border-white/[0.06]"
                                        />
                                        <div className="min-w-0">
                                            <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{selectedReview.reviewer.full_name}</p>
                                            <p className={`text-[11px] ${isDark ? "text-zinc-500" : "text-slate-500"}`}>{selectedReview.reviewer.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Room Listing</span>
                                            <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{selectedReview.room.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Owner / Reviewee</span>
                                            <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{selectedReview.reviewee.full_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Submitted Date</span>
                                            <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                                {new Date(selectedReview.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`rounded-xl p-4 border ${isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200"}`}>
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Comment</p>
                                        <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
                                            {selectedReview.comment ?? <span className="italic opacity-50">No review text left. Only rated.</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-5 border-t border-white/[0.04]">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">Moderator Actions</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleModerateStatus(selectedReview.id, "approved")}
                                            className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                                                selectedReview.moderation_status === "approved"
                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                    : "bg-zinc-800/40 border-white/[0.04] text-zinc-400 hover:bg-zinc-800"
                                            }`}
                                        >
                                            <CheckCircle2 size={18} />
                                            <span className="text-[9px] font-bold mt-1 uppercase tracking-widest">Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleModerateStatus(selectedReview.id, "flagged")}
                                            className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                                                selectedReview.moderation_status === "flagged"
                                                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                                                    : "bg-zinc-800/40 border-white/[0.04] text-zinc-400 hover:bg-zinc-800"
                                            }`}
                                        >
                                            <AlertOctagon size={18} />
                                            <span className="text-[9px] font-bold mt-1 uppercase tracking-widest">Flag</span>
                                        </button>
                                        <button
                                            onClick={() => handleModerateStatus(selectedReview.id, "hidden")}
                                            className={`flex flex-col items-center p-3 rounded-xl border transition-all col-span-2 ${
                                                selectedReview.moderation_status === "hidden"
                                                    ? "bg-zinc-600/20 border-zinc-500/30 text-zinc-400"
                                                    : "bg-zinc-800/40 border-white/[0.04] text-zinc-400 hover:bg-zinc-800"
                                            }`}
                                        >
                                            <X size={18} />
                                            <span className="text-[9px] font-bold mt-1 uppercase tracking-widest">Hide Review</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteReview(selectedReview.id)}
                                        className="w-full py-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                                    >
                                        Delete Review Permanently
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                                <div className="w-14 h-14 rounded-full bg-zinc-800/60 flex items-center justify-center mb-4">
                                    <ShieldAlert size={24} className="text-zinc-600" />
                                </div>
                                <p className="text-sm text-zinc-500">Select a review from the table to inspect details and moderate.</p>
                            </div>
                        )}
                    </div>
                </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 40, x: "-50%" }}
                        className={`fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-xl text-sm font-semibold shadow-2xl backdrop-blur-xl border border-white/10 whitespace-nowrap ${
                            toast.type === "success"
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
        </main>
    );
}
