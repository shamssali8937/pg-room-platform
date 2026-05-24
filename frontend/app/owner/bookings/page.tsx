"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
    ClipboardList, Search, Filter, Calendar, User, Phone, CheckCircle,
    XCircle, Clock, Loader2, ArrowUpRight, ShieldCheck, Mail
} from "lucide-react";

interface Booking {
    id: string;
    room_id: string;
    tenant_id: string;
    owner_id: string;
    request_type: string; // 'inquiry' | 'booking'
    message?: string | null;
    status: string; // 'pending' | 'approved' | 'rejected' | 'cancelled'
    created_at: string;
    owner_note?: string | null;
    tenant?: {
        id: string;
        full_name: string;
        profile_photo_url?: string | null;
        mobile_number?: string | null;
    };
    room?: {
        id: string;
        title: string;
        rent_amount: number;
        images?: Array<{ file_url: string }> | null;
    };
}

export default function OwnerBookingsPage() {
    const { isDark } = useOwnerTheme();
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Filters and Search
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "cancelled">("all");

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.get("/bookings/owner");
            if (data?.success && Array.isArray(data?.data)) {
                setBookings(data.data);
            } else {
                setBookings([]);
            }
        } catch (err: any) {
            console.error("Failed to fetch bookings:", err);
            setError(err.response?.data?.message ?? "Failed to fetch bookings list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (bookingId: string, newStatus: "approved" | "rejected") => {
        if (!confirm(`Are you sure you want to ${newStatus === "approved" ? "confirm" : "reject"} this booking offer?`)) {
            return;
        }

        try {
            setActionLoadingId(bookingId);
            const { data } = await api.patch(`/bookings/${bookingId}/status`, {
                status: newStatus,
                owner_note: newStatus === "approved" ? "Booking confirmed by Owner" : "Booking rejected by Owner"
            });

            if (data?.success) {
                // Update local state dynamically
                setBookings((prev) =>
                    prev.map((b) =>
                        b.id === bookingId ? { ...b, status: newStatus } : b
                    )
                );
            }
        } catch (err: any) {
            console.error("Failed to update status:", err);
            alert(err.response?.data?.message ?? "Failed to update booking status");
        } finally {
            setActionLoadingId(null);
        }
    };

    // Filter and search computation
    const filteredBookings = bookings.filter((b) => {
        // Status filter
        if (statusFilter !== "all" && b.status !== statusFilter) {
            return false;
        }

        // Search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const roomTitle = b.room?.title?.toLowerCase() ?? "";
            const tenantName = b.tenant?.full_name?.toLowerCase() ?? "";
            return roomTitle.includes(query) || tenantName.includes(query);
        }

        return true;
    });

    // Theme values
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textSecondary = isDark ? "text-zinc-400" : "text-slate-500";
    const bgSurface = isDark ? "bg-[#131313]" : "bg-white border border-slate-200";
    const dividerColor = isDark ? "border-white/5" : "border-slate-200";
    const inputBg = isDark ? "bg-[#1c1c1c] text-white" : "bg-slate-100 text-slate-900";

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pl-14 xl:pl-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ba9eff] to-[#699cff] flex items-center justify-center text-[#39008c]">
                            <ClipboardList size={20} />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-headline font-extrabold tracking-tight ${textPrimary}`}>Bookings Manager</h1>
                            <p className={`text-sm ${textSecondary}`}>Track and confirm your room booking requests from prospective tenants</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters bar */}
            <div className={`p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 ${bgSurface}`}>
                {/* Search */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl flex-grow w-full md:w-auto ${inputBg}`}>
                    <Search size={16} className={textSecondary} />
                    <input
                        type="text"
                        placeholder="Search by tenant name or room..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full"
                    />
                </div>

                {/* Filter tags */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto shrink-0 py-1">
                    {(["all", "pending", "approved", "rejected", "cancelled"] as const).map((filter) => {
                        const isActive = statusFilter === filter;
                        return (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all select-none ${
                                    isActive
                                        ? "bg-gradient-to-r from-[#ba9eff] to-[#699cff] text-white shadow-md shadow-violet-500/20"
                                        : isDark
                                        ? "bg-[#1c1c1c] text-zinc-400 hover:text-white"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main content grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-[#ba9eff] mb-4" />
                    <p className={textSecondary}>Loading requests...</p>
                </div>
            ) : error ? (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-4">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                        onClick={fetchBookings}
                        className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className={`p-16 rounded-3xl text-center flex flex-col items-center justify-center ${bgSurface}`}>
                    <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center text-[#ba9eff] mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className={`text-lg font-bold ${textPrimary}`}>No Bookings Found</h3>
                    <p className={`text-sm mt-1 max-w-sm ${textSecondary}`}>
                        {searchQuery || statusFilter !== "all"
                            ? "No requests match your current filters. Try resetting them."
                            : "You haven't received any booking requests or inquiries yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredBookings.map((booking) => {
                            const isPending = booking.status === "pending";
                            const isApproved = booking.status === "approved";
                            const isRejected = booking.status === "rejected";
                            const isCancelled = booking.status === "cancelled";

                            // Color codes for badges
                            let statusColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                            let StatusIcon = Clock;

                            if (isApproved) {
                                statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                                StatusIcon = CheckCircle;
                            } else if (isRejected) {
                                statusColor = "bg-red-500/10 text-red-400 border-red-500/20";
                                StatusIcon = XCircle;
                            } else if (isCancelled) {
                                statusColor = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
                                StatusIcon = XCircle;
                            }

                            return (
                                <motion.div
                                    key={booking.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] ${
                                        isDark
                                            ? "bg-[#181622]/60 border-white/5 backdrop-blur-md"
                                            : "bg-white border-slate-200"
                                    }`}
                                >
                                    {/* Top section: Card details */}
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            {/* Room Details */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-zinc-800">
                                                    {booking.room?.images?.[0]?.file_url ? (
                                                        <img
                                                            src={booking.room.images[0].file_url}
                                                            alt={booking.room.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                            N/A
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-sm line-clamp-1 ${textPrimary}`}>
                                                        {booking.room?.title ?? "Unknown Room"}
                                                    </h3>
                                                    <p className="text-xs font-bold text-[#ba9eff] mt-0.5">
                                                        PKR {booking.room?.rent_amount?.toLocaleString() ?? "0"} / month
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-violet-500/10 text-violet-400">
                                                            {booking.request_type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 select-none ${statusColor}`}>
                                                <StatusIcon size={12} />
                                                {booking.status}
                                            </div>
                                        </div>

                                        <hr className={dividerColor} />

                                        {/* Tenant Details */}
                                        <div className="space-y-2">
                                            <p className={`text-[10px] uppercase font-bold tracking-widest ${textSecondary}`}>Prospective Tenant</p>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                                                        {booking.tenant?.profile_photo_url ? (
                                                            <img
                                                                src={booking.tenant.profile_photo_url}
                                                                alt={booking.tenant.full_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-[#ba9eff]/20 text-[#ba9eff]" : "bg-violet-100 text-violet-600"}`}>
                                                                <span className="text-xs font-bold">{booking.tenant?.full_name?.[0] ?? "T"}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-sm font-bold ${textPrimary}`}>{booking.tenant?.full_name ?? "Unknown"}</h4>
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <Phone size={11} className={textSecondary} />
                                                            {booking.tenant?.mobile_number ? (
                                                                <a href={`tel:${booking.tenant.mobile_number}`} className="hover:text-[#ba9eff] transition-colors">
                                                                    {booking.tenant.mobile_number}
                                                                </a>
                                                            ) : (
                                                                <span className={textSecondary}>N/A</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        {booking.message && (
                                            <div className={`p-3 rounded-xl text-xs ${isDark ? "bg-[#1c1c1c] text-zinc-300" : "bg-slate-50 text-slate-600"}`}>
                                                <p className="font-semibold mb-0.5">Message:</p>
                                                <p className="italic">"{booking.message}"</p>
                                            </div>
                                        )}

                                        {booking.owner_note && (
                                            <div className="p-3 rounded-xl bg-violet-500/5 text-xs text-violet-400">
                                                <span className="font-semibold">Note:</span> {booking.owner_note}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {isPending && (
                                        <div className="flex items-center gap-3 mt-5">
                                            <button
                                                disabled={actionLoadingId === booking.id}
                                                onClick={() => handleUpdateStatus(booking.id, "approved")}
                                                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-98 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                Confirm Booking
                                            </button>
                                            <button
                                                disabled={actionLoadingId === booking.id}
                                                onClick={() => handleUpdateStatus(booking.id, "rejected")}
                                                className={`py-2.5 px-4 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all active:scale-98 disabled:opacity-50`}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
