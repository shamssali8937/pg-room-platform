"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOwnerDashboard } from "@/store/slices/dashboardSlice";
import { fetchOwnerRooms } from "@/store/slices/roomSlice";
import { fetchOwnerBookings } from "@/store/slices/bookingSlice";
import { fetchOwnerPoints } from "@/store/slices/ownerSlice";
import {
    Plus, Eye, MessageSquare, TrendingUp, Star, Home,
    ArrowRight, Wallet, MapPin, CheckCircle2, Clock, Loader2,
    BarChart3, Gem, ShieldCheck, Bed
} from "lucide-react";

function SkeletonCard({ isDark }: { isDark: boolean }) {
    return (
        <div className={`p-5 rounded-2xl animate-pulse ${isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200"}`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${isDark ? "bg-[#262626]" : "bg-slate-100"}`} />
                <div className="space-y-2 flex-1">
                    <div className={`h-2 w-16 rounded ${isDark ? "bg-[#262626]" : "bg-slate-200"}`} />
                    <div className={`h-5 w-10 rounded ${isDark ? "bg-[#262626]" : "bg-slate-200"}`} />
                </div>
            </div>
        </div>
    );
}

export default function OwnerDashboard() {
    const { isDark } = useOwnerTheme();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    const { ownerData, isLoading: dashLoading } = useAppSelector((s) => s.dashboard);
    const { ownerRooms, isLoading: roomsLoading } = useAppSelector((s) => s.room);
    const { ownerBookings } = useAppSelector((s) => s.booking);
    const { points } = useAppSelector((s) => s.owner);

    useEffect(() => {
        dispatch(fetchOwnerDashboard());
        dispatch(fetchOwnerRooms());
        dispatch(fetchOwnerBookings());
        dispatch(fetchOwnerPoints());
    }, [dispatch]);

    const isLoading = dashLoading || roomsLoading;

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-200";
    const divider = isDark ? "border-white/[0.06]" : "border-slate-100";

    const liveRooms = ownerRooms.filter((r) => r.status === "active");
    const pendingRooms = ownerRooms.filter((r) => r.status === "pending");
    const totalViews = ownerRooms.reduce((a, r) => a + r.views, 0);
    const pendingBookings = ownerBookings.filter((b) => b.status === "pending").length;

    const stats = [
        { icon: <Home size={18} />, label: "Live Listings", value: liveRooms.length, sub: `${ownerRooms.length} total`, iconColor: "text-[#ba9eff]", iconBg: "bg-[#ba9eff]/10" },
        { icon: <Eye size={18} />, label: "Total Views", value: totalViews.toLocaleString(), sub: "all time", iconColor: "text-[#699cff]", iconBg: "bg-[#699cff]/10" },
        { icon: <MessageSquare size={18} />, label: "Pending Bookings", value: pendingBookings, sub: "awaiting review", iconColor: "text-amber-400", iconBg: "bg-amber-400/10" },
        { icon: <Gem size={18} />, label: "Points Balance", value: (ownerData?.points ?? points).toLocaleString(), sub: "curator points", iconColor: "text-[#ff97b5]", iconBg: "bg-[#ff97b5]/10" },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 relative pb-24 lg:pb-4">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pl-14 xl:pl-0">
                <div>
                    <p className="text-[#ba9eff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">Owner Dashboard</p>
                    <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>
                        Welcome,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">
                            {user?.full_name?.split(" ")[0] ?? "Owner"}
                        </span>
                    </h2>
                    <p className={`text-sm mt-1 ${textVariant}`}>Your portfolio overview and platform performance.</p>
                </div>
                <button
                    onClick={() => router.push("/owner/listings")}
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(138,92,246,0.4)] hover:brightness-110 transition-all shrink-0"
                >
                    <Plus size={16} /> Add Listing
                </button>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading
                    ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} isDark={isDark} />)
                    : stats.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className={`p-5 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] cursor-default ${surfaceLow}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}>
                                <span className={s.iconColor}>{s.icon}</span>
                            </div>
                            <div className="min-w-0">
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${textVariant}`}>{s.label}</p>
                                <p className={`text-lg font-headline font-extrabold leading-tight ${textPrimary}`}>{s.value}</p>
                                <p className={`text-[10px] ${textVariant}`}>{s.sub}</p>
                            </div>
                        </motion.div>
                    ))}
            </section>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Listings Preview */}
                <div className="lg:col-span-8 space-y-6">
                    <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-[#ba9eff]/10" : "bg-violet-50"}`}>
                                    <Home size={14} className="text-[#ba9eff]" />
                                </div>
                                <h4 className={`text-base font-headline font-bold ${textPrimary}`}>Your Listings</h4>
                            </div>
                            <button
                                onClick={() => router.push("/owner/listings")}
                                className={`text-xs flex items-center gap-1.5 font-bold transition-all hover:gap-2.5 ${isDark ? "text-[#ba9eff]" : "text-violet-600"}`}
                            >
                                View All <ArrowRight size={14} />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className={`h-20 rounded-xl animate-pulse ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`} />
                                ))}
                            </div>
                        ) : ownerRooms.length === 0 ? (
                            <div className="p-12 text-center">
                                <Home size={32} className={`mx-auto mb-3 ${textVariant}`} />
                                <p className={`font-bold ${textPrimary}`}>No listings yet</p>
                                <p className={`text-sm mt-1 mb-4 ${textVariant}`}>Add your first property to get started</p>
                                <button
                                    onClick={() => router.push("/owner/listings")}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all"
                                >
                                    Add First Listing
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {ownerRooms.slice(0, 4).map((room) => {
                                    const statusCfg: Record<string, { badge: string; label: string }> = {
                                        active: { badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", label: "Live" },
                                        pending: { badge: "bg-amber-400/10 text-amber-400 border-amber-400/20", label: "Pending" },
                                        rejected: { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Rejected" },
                                        draft: { badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", label: "Draft" },
                                    };
                                    const cfg = statusCfg[room.status] ?? statusCfg.draft;

                                    return (
                                        <div
                                            key={room.id}
                                            onClick={() => router.push("/owner/listings")}
                                            className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"}`}
                                        >
                                            {room.images?.[0] ? (
                                                <img src={room.images[0].url} alt={room.title} className="w-14 h-10 rounded-lg object-cover shrink-0" />
                                            ) : (
                                                <div className={`w-14 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`}>
                                                    <Home size={14} className={textVariant} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${textPrimary}`}>{room.title}</p>
                                                <p className={`text-xs flex items-center gap-1 ${textVariant}`}>
                                                    <MapPin size={10} /> {room.city}
                                                    <span className="mx-1">·</span>
                                                    <Bed size={10} /> {room.beds} beds
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-[#ba9eff]">PKR {room.price.toLocaleString()}</p>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Recent Bookings */}
                    {ownerBookings.length > 0 && (
                        <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                            <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-amber-400/10" : "bg-amber-50"}`}>
                                        <Clock size={14} className="text-amber-400" />
                                    </div>
                                    <h4 className={`text-base font-headline font-bold ${textPrimary}`}>
                                        Pending Bookings
                                        {pendingBookings > 0 && (
                                            <span className="ml-2 text-xs bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full">{pendingBookings}</span>
                                        )}
                                    </h4>
                                </div>
                            </div>
                            <div className="divide-y divide-white/[0.04]">
                                {ownerBookings.filter((b) => b.status === "pending").slice(0, 3).map((booking) => (
                                    <div key={booking.id} className={`flex items-center gap-4 px-6 py-4 ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"}`}>
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-amber-400/10" : "bg-amber-50"}`}>
                                            <span className="text-amber-400 text-sm font-bold">{booking.room?.title?.[0] ?? "R"}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${textPrimary}`}>{booking.room.title}</p>
                                            <p className={`text-xs ${textVariant}`}>
                                                {new Date(booking.check_in).toLocaleDateString()} → {new Date(booking.check_out).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-amber-400">PKR {(booking.monthly_rent ?? booking.room?.rent_amount ?? booking.room?.price ?? 0).toLocaleString()}/mo</p>
                                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                                                Pending
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Portfolio Status */}
                    <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                        <div className={`px-5 py-4 border-b flex items-center gap-3 ${divider}`}>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-[#ba9eff]/10" : "bg-violet-50"}`}>
                                <BarChart3 size={14} className="text-[#ba9eff]" />
                            </div>
                            <h4 className={`font-headline font-bold ${textPrimary}`}>Portfolio Status</h4>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                { label: "Live", count: liveRooms.length, of: ownerRooms.length, bar: "bg-emerald-400", text: "text-emerald-400" },
                                { label: "Pending", count: pendingRooms.length, of: ownerRooms.length, bar: "bg-amber-400", text: "text-amber-400" },
                                { label: "Occupied", count: ownerBookings.filter((b) => b.status === "approved").length, of: liveRooms.length, bar: "bg-[#ba9eff]", text: "text-[#ba9eff]" },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between mb-1.5">
                                        <span className={`text-xs font-bold ${textVariant}`}>{item.label}</span>
                                        <span className={`text-xs font-bold ${item.text}`}>{item.count}/{item.of}</span>
                                    </div>
                                    <div className={`w-full h-1.5 rounded-full ${isDark ? "bg-[#262626]" : "bg-slate-200"}`}>
                                        <div
                                            className={`${item.bar} h-full rounded-full transition-all duration-1000`}
                                            style={{ width: item.of > 0 ? `${(item.count / item.of) * 100}%` : "0%" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Points Wallet */}
                    <section
                        onClick={() => router.push("/owner/wallet")}
                        className={`rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden ${isDark ? "bg-gradient-to-br from-[#201f1f] to-[#0f0f0f] border border-[#484847]/15" : "bg-gradient-to-br from-violet-50 to-slate-50 border border-violet-100"}`}
                    >
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#ba9eff]/10 rounded-full blur-[50px] -mr-10 -mb-10 pointer-events-none" />
                        <div className="relative z-10">
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${textVariant}`}>Curator Points</p>
                            <p className="text-3xl font-headline font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">
                                {(ownerData?.points ?? points).toLocaleString()}
                            </p>
                            <p className={`text-xs mt-1 ${textVariant}`}>Use to boost listings & unlock rewards</p>
                        </div>
                        <div className={`mt-3 pt-3 border-t flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isDark ? "border-white/5 text-[#ba9eff]" : "border-violet-100 text-violet-600"}`}>
                            <Wallet size={11} /> View Wallet <ArrowRight size={11} className="ml-auto" />
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className={`rounded-2xl p-5 space-y-3 ${surfaceLow}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${textVariant}`}>Quick Actions</p>
                        {[
                            { label: "Add New Listing", icon: <Plus size={16} />, action: () => router.push("/owner/listings"), color: "from-violet-500 to-blue-500" },
                            { label: "View Inquiries", icon: <MessageSquare size={16} />, action: () => router.push("/owner/inquiries"), color: "from-emerald-500 to-teal-500" },
                            { label: "Wallet & Rewards", icon: <Gem size={16} />, action: () => router.push("/owner/wallet"), color: "from-[#ba9eff] to-[#ff97b5]" },
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={item.action}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] bg-gradient-to-r ${item.color} text-white text-sm font-bold`}
                            >
                                {item.icon}
                                {item.label}
                                <ArrowRight size={14} className="ml-auto" />
                            </button>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}
