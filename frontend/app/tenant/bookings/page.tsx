"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { mockTenantBookings, type TenantBooking } from "@/components/tenant/mockData";
import {
    CalendarCheck, MapPin, CreditCard, CheckCircle2, Clock,
    X, ArrowRight, Bed, ShieldCheck, MessageSquare, ChevronDown, ChevronUp, Star
} from "lucide-react";

const STATUS_CONFIG = {
    "Active": { badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: <CheckCircle2 size={11} /> },
    "Upcoming": { badge: "bg-[#699cff]/10 text-[#699cff] border-[#699cff]/20", icon: <Clock size={11} /> },
    "Completed": { badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: <CheckCircle2 size={11} /> },
    "Cancelled": { badge: "bg-red-500/10 text-red-400 border-red-500/20", icon: <X size={11} /> },
};

function BookingCard({ booking, isDark, onExpand, isExpanded }: {
    booking: TenantBooking; isDark: boolean; onExpand: () => void; isExpanded: boolean;
}) {
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceMid = isDark ? "bg-[#1a1919]" : "bg-slate-50";
    const divider = isDark ? "border-white/[0.06]" : "border-slate-100";
    const cfg = STATUS_CONFIG[booking.status];

    return (
        <motion.div
            layout
            className={`rounded-2xl overflow-hidden border transition-all ${isDark ? "bg-[#131313] border-[#484847]/15 hover:border-[#484847]/30" : "bg-white border-slate-200 shadow-sm"}`}
        >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row">
                <div className="relative sm:w-48 h-36 sm:h-auto overflow-hidden shrink-0">
                    <img src={booking.listingImage} alt={booking.listingTitle} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                </div>
                <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                            <h3 className={`font-headline font-bold text-base ${textPrimary}`}>{booking.listingTitle}</h3>
                            <p className={`flex items-center gap-1.5 text-xs mt-1 ${textVariant}`}>
                                <MapPin size={12} /> {booking.address}
                            </p>
                        </div>
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${cfg.badge}`}>
                            {cfg.icon} {booking.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                        <div>
                            <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Monthly Rent</p>
                            <p className={`text-sm font-bold text-[#a27cff] mt-0.5`}>PKR {booking.monthlyRent.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Check-in</p>
                            <p className={`text-sm font-bold mt-0.5 ${textPrimary}`}>{booking.checkIn}</p>
                        </div>
                        <div>
                            <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Check-out</p>
                            <p className={`text-sm font-bold mt-0.5 ${textPrimary}`}>{booking.checkOut}</p>
                        </div>
                    </div>

                    <div className={`flex items-center justify-between mt-4 pt-3 border-t ${divider}`}>
                        <div className="flex items-center gap-2">
                            <img src={booking.landlordAvatar} alt={booking.landlordName} className="w-7 h-7 rounded-full object-cover" />
                            <div>
                                <p className={`text-xs font-bold ${textPrimary}`}>{booking.landlordName}</p>
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
                                <p className={`text-sm font-bold mt-1 ${textPrimary}`}>{booking.roomType}</p>
                            </div>
                            <div className={`p-3.5 rounded-xl ${surfaceMid}`}>
                                <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Floor</p>
                                <p className={`text-sm font-bold mt-1 ${textPrimary}`}>{booking.floor}F</p>
                            </div>
                            <div className={`p-3.5 rounded-xl ${surfaceMid}`}>
                                <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Deposit Paid</p>
                                <p className={`text-sm font-bold mt-1 ${textPrimary}`}>PKR {booking.depositPaid.toLocaleString()}</p>
                            </div>
                            <div className={`p-3.5 rounded-xl ${surfaceMid}`}>
                                <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>Total Paid</p>
                                <p className={`text-sm font-bold mt-1 text-emerald-400`}>PKR {booking.totalPaid.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className={`px-5 pb-5`}>
                            <p className={`text-[10px] uppercase tracking-widest mb-2.5 ${textVariant}`}>Amenities</p>
                            <div className="flex flex-wrap gap-2">
                                {booking.amenities.map(a => (
                                    <span key={a} className={`text-xs px-3 py-1 rounded-full ${isDark ? "bg-[#1a1919] text-[#adaaaa]" : "bg-slate-100 text-slate-600"}`}>{a}</span>
                                ))}
                            </div>
                        </div>
                        {booking.status === "Active" && booking.nextPaymentDue && (
                            <div className={`mx-5 mb-5 p-4 rounded-xl flex items-center justify-between ${isDark ? "bg-amber-400/5 border border-amber-400/20" : "bg-amber-50 border border-amber-200"}`}>
                                <div className="flex items-center gap-3">
                                    <CreditCard size={18} className="text-amber-400" />
                                    <div>
                                        <p className={`text-sm font-bold ${textPrimary}`}>Next Payment Due</p>
                                        <p className={`text-xs ${textVariant}`}>{booking.nextPaymentDue}</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 rounded-lg bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors">
                                    Pay Now
                                </button>
                            </div>
                        )}
                        {booking.status === "Completed" && (
                            <div className="mx-5 mb-5">
                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#a27cff]/10 text-[#a27cff] font-bold text-xs hover:bg-[#a27cff]/20 transition-colors">
                                    <Star size={14} /> Leave a Review
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
    const [expandedId, setExpandedId] = useState<string | null>(mockTenantBookings[0]?.id ?? null);
    const [filter, setFilter] = useState<"All" | "Active" | "Upcoming" | "Completed" | "Cancelled">("All");

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const chipActive = isDark ? "bg-[#a27cff]/20 text-[#a27cff] border-[#a27cff]/40" : "bg-violet-100 text-violet-700 border-violet-300";
    const chipInactive = isDark ? "bg-[#1a1919] text-[#adaaaa] border-[#484847]/20 hover:bg-white/5" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100";

    const filters: Array<"All" | "Active" | "Upcoming" | "Completed" | "Cancelled"> = ["All", "Active", "Upcoming", "Completed", "Cancelled"];
    const filtered = filter === "All" ? mockTenantBookings : mockTenantBookings.filter(b => b.status === filter);

    const stats = [
        { label: "Active", value: mockTenantBookings.filter(b => b.status === "Active").length, color: "text-emerald-400" },
        { label: "Upcoming", value: mockTenantBookings.filter(b => b.status === "Upcoming").length, color: "text-[#699cff]" },
        { label: "Completed", value: mockTenantBookings.filter(b => b.status === "Completed").length, color: textVariant },
    ];

    return (
        <div className="max-w-[1200px] mx-auto space-y-6 pb-24 lg:pb-4">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pl-14 xl:pl-0">
                <div>
                    <p className="text-[#a27cff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">Rental History</p>
                    <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>My Bookings</h2>
                    <p className={`text-sm mt-1 ${textVariant}`}>{mockTenantBookings.length} total bookings</p>
                </div>
                <div className="flex gap-5">
                    {stats.map(s => (
                        <div key={s.label} className="text-center">
                            <p className={`text-xl font-headline font-black ${s.color}`}>{s.value}</p>
                            <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </header>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${filter === f ? chipActive : chipInactive}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Booking Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <CalendarCheck size={36} className={`mx-auto mb-4 ${textVariant}`} />
                    <p className={`font-bold text-lg ${textPrimary}`}>No bookings found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(booking => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            isDark={isDark}
                            isExpanded={expandedId === booking.id}
                            onExpand={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
