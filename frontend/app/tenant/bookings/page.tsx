"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTenantBookings, cancelBooking } from "@/store/slices/bookingSlice";
import type { Booking } from "@/store/slices/bookingSlice";
import {
    CalendarCheck, MapPin, CheckCircle2, Clock,
    X, Bed, Bath, ShieldCheck, ChevronDown, ChevronUp,
    Loader2, AlertCircle, Home, Phone, User, Tag
} from "lucide-react";

const STATUS_CONFIG: Record<string, { badge: string; icon: React.ReactNode; label: string }> = {
    approved: { badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: <CheckCircle2 size={11} />, label: "Confirmed" },
    pending: { badge: "bg-[#699cff]/10 text-[#699cff] border-[#699cff]/20", icon: <Clock size={11} />, label: "Pending" },
    completed: { badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: <CheckCircle2 size={11} />, label: "Completed" },
    cancelled: { badge: "bg-red-500/10 text-red-400 border-red-500/20", icon: <X size={11} />, label: "Cancelled" },
    rejected: { badge: "bg-red-500/10 text-red-400 border-red-500/20", icon: <X size={11} />, label: "Rejected" },
};

function BookingCard({
    booking, isDark, onExpand, isExpanded, onCancel, isCancelling,
}: {
    booking: Booking;
    isDark: boolean;
    onExpand: () => void;
    isExpanded: boolean;
    onCancel: (id: string) => void;
    isCancelling: boolean;
}) {
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceMid = isDark ? "bg-[#1a1919]" : "bg-slate-50";
    const divider = isDark ? "border-white/[0.06]" : "border-slate-100";
    const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
    const roomImage = booking.room?.images?.[0]?.file_url;
    const rentAmount = booking.room?.rent_amount ?? booking.room?.price ?? 0;

    return (
        <motion.div
            layout
            className={`rounded-2xl overflow-hidden border transition-all ${isDark ? "bg-[#131313] border-[#484847]/15 hover:border-[#484847]/30" : "bg-white border-slate-200 shadow-sm"}`}
        >
            <div className="flex flex-col sm:flex-row">
                <div className="relative sm:w-48 h-36 sm:h-auto overflow-hidden shrink-0">
                    {roomImage ? (
                        <img src={roomImage} alt={booking.room.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`}>
                            <Home size={32} className={textVariant} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                </div>
                <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                            <h3 className={`font-headline font-bold text-base ${textPrimary}`}>{booking.room.title}</h3>
                            <p className={`flex items-center gap-1.5 text-xs mt-1 ${textVariant}`}>
                                <MapPin size={12} /> {booking.room?.locality ?? booking.room?.address ?? booking.room?.city ?? "—"}
                            </p>
                        </div>
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${cfg.badge}`}>
                            {cfg.icon} {cfg.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                        <div>
                            <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Monthly Rent</p>
                            <p className="text-sm font-bold text-[#a27cff] mt-0.5">PKR {rentAmount.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Request Type</p>
                            <p className={`text-sm font-bold mt-0.5 capitalize ${textPrimary}`}>{booking.request_type}</p>
                        </div>
                        <div>
                            <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Requested On</p>
                            <p className={`text-sm font-bold mt-0.5 ${textPrimary}`}>{new Date(booking.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className={`flex items-center justify-between mt-4 pt-3 border-t ${divider}`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full overflow-hidden shrink-0 ${isDark ? "bg-[#a27cff]/20" : "bg-violet-100"} flex items-center justify-center`}>
                                {booking.owner?.profile_photo_url ? (
                                    <img src={booking.owner.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[#a27cff] text-xs font-bold">{booking.owner?.full_name?.[0] ?? "?"}</span>
                                )}
                            </div>
                            <div>
                                <p className={`text-xs font-bold ${textPrimary}`}>{booking.owner?.full_name ?? "Owner"}</p>
                                <p className={`text-[10px] ${textVariant}`}>Landlord</p>
                            </div>
                        </div>
                        <button
                            onClick={onExpand}
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${isDark ? "border-white/10 text-[#adaaaa] hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                        >
                            Details {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`border-t ${divider} overflow-hidden`}
                    >
                        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className={`p-3.5 rounded-xl ${surfaceMid}`}>
                                <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Room Type</p>
                                <p className={`text-sm font-bold mt-1 capitalize ${textPrimary}`}>{booking.room?.room_type ?? "Standard"}</p>
                            </div>
                            <div className={`p-3.5 rounded-xl ${surfaceMid}`}>
                                <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Beds / Baths</p>
                                <p className={`text-sm font-bold mt-1 ${textPrimary}`}>{booking.room?.beds ?? "—"} / {booking.room?.baths ?? "—"}</p>
                            </div>
                            <div className={`p-3.5 rounded-xl ${surfaceMid}`}>
                                <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Security Deposit</p>
                                <p className={`text-sm font-bold mt-1 ${textPrimary}`}>PKR {(booking.room?.security_deposit_amount ?? 0).toLocaleString()}</p>
                            </div>
                            <div className={`p-3.5 rounded-xl ${surfaceMid}`}>
                                <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>City</p>
                                <p className={`text-sm font-bold mt-1 ${textPrimary}`}>{booking.room?.city ?? "—"}</p>
                            </div>
                        </div>

                        {/* Owner Contact */}
                        {booking.owner && (
                            <div className="px-5 pb-4">
                                <p className={`text-[10px] uppercase tracking-widest mb-2 ${textVariant}`}>Owner Contact</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ${isDark ? "bg-[#a27cff]/20" : "bg-violet-100"} flex items-center justify-center`}>
                                        {booking.owner.profile_photo_url ? (
                                            <img src={booking.owner.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={14} className="text-[#a27cff]" />
                                        )}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold ${textPrimary}`}>{booking.owner.full_name}</p>
                                        {booking.owner.mobile_number && (
                                            <a href={`tel:${booking.owner.mobile_number}`} className="flex items-center gap-1 text-[11px] text-[#a27cff] hover:underline">
                                                <Phone size={10} /> {booking.owner.mobile_number}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Message */}
                        {booking.message && (
                            <div className="px-5 pb-4">
                                <p className={`text-[10px] uppercase tracking-widest mb-1.5 ${textVariant}`}>Your Message</p>
                                <p className={`text-xs italic px-3 py-2 rounded-xl ${isDark ? "bg-[#1a1919] text-zinc-300" : "bg-slate-50 text-slate-600"}`}>
                                    "{booking.message}"
                                </p>
                            </div>
                        )}

                        {/* Owner Note */}
                        {booking.owner_note && (
                            <div className="px-5 pb-4">
                                <p className={`text-[10px] uppercase tracking-widest mb-1.5 ${textVariant}`}>Owner Note</p>
                                <p className="text-xs px-3 py-2 rounded-xl bg-violet-500/5 text-violet-400 italic">
                                    "{booking.owner_note}"
                                </p>
                            </div>
                        )}

                        {/* Cancel Action */}
                        {(booking.status === "pending") && (
                            <div className="mx-5 mb-5 flex gap-3">
                                <button
                                    onClick={() => onCancel(booking.id)}
                                    disabled={isCancelling}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                >
                                    {isCancelling ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                    Cancel Booking
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function TenantBookings() {
    const { isDark } = useTenantTheme();
    const dispatch = useAppDispatch();
    const { tenantBookings, isLoading, error } = useAppSelector((s) => s.booking);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "approved" | "pending" | "completed" | "cancelled" | "rejected">("all");
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchTenantBookings());
    }, [dispatch]);

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const chipActive = isDark ? "bg-[#a27cff]/20 text-[#a27cff] border-[#a27cff]/40" : "bg-violet-100 text-violet-700 border-violet-300";
    const chipInactive = isDark ? "bg-[#1a1919] text-[#adaaaa] border-[#484847]/20 hover:bg-white/5" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100";

    const filters: Array<{ key: typeof filter; label: string }> = [
        { key: "all", label: "All" },
        { key: "approved", label: "Confirmed" },
        { key: "pending", label: "Pending" },
        { key: "rejected", label: "Rejected" },
        { key: "cancelled", label: "Cancelled" },
    ];

    const filtered = filter === "all" ? tenantBookings : tenantBookings.filter((b) => b.status === filter);

    const stats = [
        { label: "Confirmed", value: tenantBookings.filter((b) => b.status === "approved").length, color: "text-emerald-400" },
        { label: "Pending", value: tenantBookings.filter((b) => b.status === "pending").length, color: "text-[#699cff]" },
        { label: "Rejected", value: tenantBookings.filter((b) => b.status === "rejected").length, color: "text-red-400" },
    ];

    const handleCancel = async (id: string) => {
        setCancellingId(id);
        await dispatch(cancelBooking(id));
        setCancellingId(null);
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6 pb-24 lg:pb-4">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pl-14 xl:pl-0">
                <div>
                    <p className="text-[#a27cff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">Booking Requests</p>
                    <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>My Bookings</h2>
                    <p className={`text-sm mt-1 ${textVariant}`}>{tenantBookings.length} total requests</p>
                </div>
                <div className="flex gap-5">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center">
                            <p className={`text-xl font-headline font-black ${s.color}`}>{s.value}</p>
                            <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </header>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${filter === f.key ? chipActive : chipInactive}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                    <AlertCircle size={18} />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Loading */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className={`h-48 rounded-2xl animate-pulse ${isDark ? "bg-[#131313]" : "bg-slate-100"}`} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <CalendarCheck size={36} className={`mx-auto mb-4 ${textVariant}`} />
                    <p className={`font-bold text-lg ${textPrimary}`}>No bookings found</p>
                    <p className={`text-sm mt-1 ${textVariant}`}>
                        {filter !== "all" ? "Try a different filter" : "Start browsing to make your first booking"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            isDark={isDark}
                            isExpanded={expandedId === booking.id}
                            onExpand={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                            onCancel={handleCancel}
                            isCancelling={cancellingId === booking.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
