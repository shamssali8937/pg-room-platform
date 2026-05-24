"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTenantDashboard } from "@/store/slices/dashboardSlice";
import { fetchTenantBookings } from "@/store/slices/bookingSlice";
import { fetchConversations } from "@/store/slices/chatSlice";
import { fetchOwnerPoints } from "@/store/slices/ownerSlice";
import {
    CalendarCheck, MessageSquare, Search, Star, MapPin,
    ArrowRight, Heart, ShieldCheck, Gem, TrendingUp,
    CheckCircle2, Clock, AlertCircle, Home, Loader2
} from "lucide-react";

function StatSkeleton({ isDark }: { isDark: boolean }) {
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

export default function TenantDashboard() {
    const { isDark } = useTenantTheme();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    const { tenantData, isLoading: dashLoading } = useAppSelector((s) => s.dashboard);
    const { tenantBookings, isLoading: bookingLoading } = useAppSelector((s) => s.booking);
    const { conversations, isLoading: chatLoading } = useAppSelector((s) => s.chat);

    useEffect(() => {
        dispatch(fetchTenantDashboard());
        dispatch(fetchTenantBookings());
        dispatch(fetchConversations());
    }, [dispatch]);

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const divider = isDark ? "border-white/[0.06]" : "border-slate-100";

    const activeBooking = tenantBookings.find((b) => b.status === "approved");
    const unreadMessages = conversations.reduce((acc, c) => acc + (c.unread_count ?? 0), 0);
    const isLoading = dashLoading || bookingLoading;

    const stats = [
        {
            icon: <Home size={18} />,
            label: "Active Lease",
            value: activeBooking ? activeBooking.room.city : "None",
            sub: activeBooking ? `PKR ${(activeBooking.monthly_rent ?? activeBooking.room?.rent_amount ?? activeBooking.room?.price ?? 0).toLocaleString()}/mo` : "No active lease",
            iconColor: "text-[#a27cff]",
            iconBg: "bg-[#a27cff]/10",
        },
        {
            icon: <MessageSquare size={18} />,
            label: "Messages",
            value: unreadMessages.toString(),
            sub: "unread",
            iconColor: "text-[#699cff]",
            iconBg: "bg-[#699cff]/10",
        },
        {
            icon: <Heart size={18} />,
            label: "Saved",
            value: (tenantData?.saved_count ?? 0).toString(),
            sub: "properties",
            iconColor: "text-[#ff97b5]",
            iconBg: "bg-[#ff97b5]/10",
        },
        {
            icon: <Gem size={18} />,
            label: "Points",
            value: (tenantData?.points ?? 0).toLocaleString(),
            sub: (tenantData?.tier ?? "Bronze") + " Tier",
            iconColor: "text-amber-400",
            iconBg: "bg-amber-400/10",
        },
    ];

    const identityItems = [
        { label: "Email Confirmed", done: !!user?.email_verified_at },
        { label: "Phone Verified", done: !!user?.mobile_verified_at },
    ];
    const verifiedCount = identityItems.filter((i) => i.done).length;
    const identityProgress = Math.round((verifiedCount / identityItems.length) * 100);

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 relative pb-24 lg:pb-4">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pl-14 xl:pl-0">
                <div>
                    <p className="text-[#a27cff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">Tenant Dashboard</p>
                    <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>
                        Welcome back,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a27cff] to-[#bfd1ff]">
                            {user?.full_name?.split(" ")[0] ?? "Tenant"}
                        </span>
                    </h2>
                    <p className={`text-sm mt-1 ${textVariant}`}>Here's an overview of your rental journey today.</p>
                </div>
                <button
                    onClick={() => router.push("/tenant/browse")}
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a27cff] to-[#6e3bd7] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(162,124,255,0.35)] hover:brightness-110 transition-all shrink-0"
                >
                    <Search size={15} /> Find Rooms
                </button>
            </header>

            {/* Stats Row */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading
                    ? Array(4).fill(0).map((_, i) => <StatSkeleton key={i} isDark={isDark} />)
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

                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Active Lease Card */}
                    {isLoading ? (
                        <div className={`rounded-2xl p-6 animate-pulse ${surfaceLow}`}>
                            <div className={`h-4 w-32 rounded mb-4 ${isDark ? "bg-[#262626]" : "bg-slate-200"}`} />
                            <div className={`h-32 rounded-xl ${isDark ? "bg-[#262626]" : "bg-slate-200"}`} />
                        </div>
                    ) : activeBooking ? (
                        <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                            <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-[#a27cff]/10" : "bg-violet-50"}`}>
                                        <Home size={14} className="text-[#a27cff]" />
                                    </div>
                                    <h4 className={`text-base font-headline font-bold ${textPrimary}`}>Active Lease</h4>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">
                                    Active
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row">
                                <div className="relative sm:w-52 h-36 sm:h-auto shrink-0 overflow-hidden">
                                    {activeBooking.room.images?.[0] && (
                                        <img
                                            src={activeBooking.room.images[0].url}
                                            alt={activeBooking.room.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
                                </div>
                                <div className="flex-1 p-6">
                                    <h3 className={`text-lg font-headline font-bold mb-1 ${textPrimary}`}>{activeBooking.room.title}</h3>
                                    <p className={`flex items-center gap-1.5 text-sm mb-4 ${textVariant}`}>
                                        <MapPin size={13} /> {activeBooking.room.address}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {[
                                            { label: "Monthly Rent", value: `PKR ${(activeBooking.monthly_rent ?? activeBooking.room?.rent_amount ?? activeBooking.room?.price ?? 0).toLocaleString()}` },
                                            { label: "Next Payment", value: activeBooking.next_payment_due ?? "—" },
                                            { label: "Lease End", value: new Date(activeBooking.check_out).toLocaleDateString() },
                                            { label: "Total Paid", value: `PKR ${(activeBooking.total_paid ?? 0).toLocaleString()}` },
                                        ].map((item, i) => (
                                            <div key={i} className={`px-3 py-2.5 rounded-xl ${isDark ? "bg-[#1a1919]" : "bg-slate-50"}`}>
                                                <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>{item.label}</p>
                                                <p className={`text-sm font-bold mt-0.5 ${textPrimary}`}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => router.push("/tenant/bookings")}
                                        className={`flex items-center gap-2 text-xs font-bold transition-all hover:gap-3 ${isDark ? "text-[#a27cff]" : "text-violet-600"}`}
                                    >
                                        View Booking Details <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className={`rounded-2xl p-8 text-center ${surfaceLow}`}>
                            <Home size={36} className={`mx-auto mb-3 ${textVariant}`} />
                            <p className={`font-bold text-base ${textPrimary}`}>No Active Lease</p>
                            <p className={`text-sm mt-1 mb-4 ${textVariant}`}>Start searching for your perfect room</p>
                            <button
                                onClick={() => router.push("/tenant/browse")}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#a27cff] to-[#6e3bd7] text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all"
                            >
                                Browse Rooms
                            </button>
                        </section>
                    )}

                    {/* Recent Bookings */}
                    {!isLoading && tenantBookings.length > 0 && (
                        <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                            <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-[#699cff]/10" : "bg-blue-50"}`}>
                                        <CalendarCheck size={14} className="text-[#699cff]" />
                                    </div>
                                    <h4 className={`text-base font-headline font-bold ${textPrimary}`}>Recent Bookings</h4>
                                </div>
                                <button
                                    onClick={() => router.push("/tenant/bookings")}
                                    className={`text-xs flex items-center gap-1.5 font-bold transition-all hover:gap-2.5 ${isDark ? "text-[#a27cff]" : "text-violet-600"}`}
                                >
                                    View All <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="divide-y divide-white/[0.04]">
                                {tenantBookings.slice(0, 3).map((booking, idx) => {
                                    const statusColors: Record<string, string> = {
                                        approved: "text-emerald-400 bg-emerald-400/10",
                                        pending: "text-amber-400 bg-amber-400/10",
                                        cancelled: "text-red-400 bg-red-400/10",
                                        completed: "text-zinc-400 bg-zinc-400/10",
                                    };
                                    return (
                                        <div
                                            key={booking.id}
                                            onClick={() => router.push("/tenant/bookings")}
                                            className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"}`}
                                        >
                                            {booking.room.images?.[0] && (
                                                <img src={booking.room.images[0].url} alt={booking.room.title} className="w-14 h-10 rounded-lg object-cover shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${textPrimary}`}>{booking.room.title}</p>
                                                <p className={`text-xs flex items-center gap-1 ${textVariant}`}><MapPin size={10} />{booking.room.city}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-[#a27cff]">PKR {(booking.monthly_rent ?? booking.room?.rent_amount ?? booking.room?.price ?? 0).toLocaleString()}</p>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[booking.status] ?? "text-zinc-400 bg-zinc-400/10"}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Identity Status */}
                    <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                        <div className={`px-5 py-4 border-b flex items-center gap-3 ${divider}`}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-400/10">
                                <ShieldCheck size={14} className="text-emerald-400" />
                            </div>
                            <h4 className={`text-base font-headline font-bold ${textPrimary}`}>Identity Status</h4>
                        </div>
                        <div className="p-5 space-y-3">
                            {identityItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className={`text-sm ${textVariant}`}>{item.label}</span>
                                    {item.done
                                        ? <CheckCircle2 size={16} className="text-emerald-400" />
                                        : <AlertCircle size={16} className={isDark ? "text-zinc-600" : "text-slate-300"} />
                                    }
                                </div>
                            ))}
                            <div className={`mt-1 pt-3 border-t ${divider}`}>
                                <div className={`w-full h-2 rounded-full ${isDark ? "bg-[#262626]" : "bg-slate-200"}`}>
                                    <div
                                        className="h-full bg-gradient-to-r from-[#a27cff] to-emerald-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${identityProgress}%` }}
                                    />
                                </div>
                                <p className={`text-[10px] mt-1.5 ${textVariant}`}>{identityProgress}% complete</p>
                            </div>
                            <button
                                onClick={() => router.push("/tenant/identity")}
                                className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isDark ? "bg-[#a27cff]/8 text-[#a27cff] hover:bg-[#a27cff]/15" : "bg-violet-50 text-violet-700 hover:bg-violet-100"}`}
                            >
                                Complete Profile <ArrowRight size={12} />
                            </button>
                        </div>
                    </section>

                    {/* Recent Messages */}
                    <section className={`rounded-2xl overflow-hidden flex-1 ${surfaceLow}`}>
                        <div className={`px-5 py-4 border-b flex justify-between items-center ${divider}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-[#699cff]/10 flex items-center justify-center">
                                    <MessageSquare size={14} className="text-[#699cff]" />
                                </div>
                                <h4 className={`text-base font-headline font-bold ${textPrimary}`}>Messages</h4>
                            </div>
                            {unreadMessages > 0 && (
                                <span className="min-w-[20px] h-5 bg-[#a27cff] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1.5">
                                    {unreadMessages}
                                </span>
                            )}
                        </div>

                        {chatLoading ? (
                            <div className="p-5 space-y-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className={`h-12 rounded-xl animate-pulse ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`} />
                                ))}
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare size={28} className={`mx-auto mb-2 ${textVariant}`} />
                                <p className={`text-sm ${textVariant}`}>No conversations yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {conversations.slice(0, 4).map((conv) => {
                                    const other = conv.participants.find((p) => p.role !== "tenant") ?? conv.participants[0];
                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => router.push("/tenant/inbox")}
                                            className={`relative flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"}`}
                                        >
                                            {conv.unread_count > 0 && (
                                                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-[#a27cff] rounded-r-full" />
                                            )}
                                            <div className="w-8 h-8 rounded-lg bg-[#a27cff]/20 flex items-center justify-center shrink-0">
                                                <span className="text-[#a27cff] text-xs font-bold">{other?.full_name?.[0] ?? "?"}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <h6 className={`text-sm font-bold truncate ${textPrimary}`}>{other?.full_name ?? "Unknown"}</h6>
                                                    {conv.last_message_at && (
                                                        <span className={`text-[9px] shrink-0 ${textVariant}`}>
                                                            {new Date(conv.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-[11px] line-clamp-1 mt-0.5 ${textVariant}`}>{conv.last_message ?? conv.room?.title}</p>
                                            </div>
                                            {conv.unread_count > 0
                                                ? <span className="w-5 h-5 rounded-full bg-[#a27cff] text-white text-[9px] font-bold flex items-center justify-center shrink-0">{conv.unread_count}</span>
                                                : <span className={`w-2 h-2 rounded-full shrink-0 ${isDark ? "bg-zinc-700" : "bg-slate-300"}`} />
                                            }
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className={`p-4 border-t ${divider}`}>
                            <button
                                onClick={() => router.push("/tenant/inbox")}
                                className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isDark ? "bg-[#a27cff]/8 text-[#a27cff] hover:bg-[#a27cff]/15" : "bg-violet-50 text-violet-700 hover:bg-violet-100"}`}
                            >
                                Open Inbox <ArrowRight size={12} />
                            </button>
                        </div>
                    </section>

                    {/* Points Mini */}
                    <section
                        onClick={() => router.push("/tenant/preferences")}
                        className={`rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden ${isDark ? "bg-gradient-to-br from-[#201f1f] to-[#0f0f0f] border border-[#484847]/15" : "bg-gradient-to-br from-violet-50 to-slate-50 border border-violet-100"}`}
                    >
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#a27cff]/10 rounded-full blur-[50px] -mr-10 -mb-10 pointer-events-none" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${textVariant}`}>Reward Points</p>
                                <p className="text-2xl font-headline font-black text-transparent bg-clip-text bg-gradient-to-r from-[#a27cff] to-amber-400">
                                    {(tenantData?.points ?? 0).toLocaleString()}
                                </p>
                                <p className={`text-[11px] mt-1 ${textVariant}`}>{tenantData?.tier ?? "Bronze"} Tier · Earn more by booking</p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-[#a27cff]/15 flex items-center justify-center">
                                <Gem size={20} className="text-[#a27cff]" />
                            </div>
                        </div>
                        <div className={`mt-3 pt-3 border-t flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isDark ? "border-white/5 text-[#a27cff]" : "border-violet-100 text-violet-600"}`}>
                            <TrendingUp size={11} /> View preferences <ArrowRight size={11} className="ml-auto" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
