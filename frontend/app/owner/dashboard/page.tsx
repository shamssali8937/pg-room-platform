"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { mockOwnerListings, mockOwnerInquiries, type OwnerListing } from "@/components/owner/mockData";
import {
    Eye, Heart, MessageSquare, Gem, TrendingUp, MapPin, Bed, Bath,
    ArrowRight, Star, Plus, Search, Edit, Wallet, CheckCircle2,
    Clock, AlertTriangle, Zap, BarChart3
} from "lucide-react";
import OwnerListingDetailModal from "@/components/owner/OwnerListingDetailModal";
import OwnerAddListingModal from "@/components/owner/OwnerAddListingModal";

export default function OwnerDashboard() {
    const { isDark, searchQuery } = useOwnerTheme();
    const router = useRouter();
    const [detailListing, setDetailListing] = useState<OwnerListing | null>(null);
    const [isAddListingOpen, setIsAddListingOpen] = useState(false);

    const filteredListings = mockOwnerListings.filter((l) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
    });

    // Theme tokens
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceMid = isDark ? "bg-[#1a1919] border border-[#484847]/10" : "bg-slate-50 border border-slate-100";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-200";
    const divider = isDark ? "border-white/[0.06]" : "border-slate-100";

    const statusConfig: Record<string, { icon: React.ReactNode; badge: string }> = {
        "Live": {
            icon: <CheckCircle2 size={11} />,
            badge: isDark ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        "Pending Review": {
            icon: <Clock size={11} />,
            badge: isDark ? "bg-amber-400/10 text-amber-400 border-amber-400/20" : "bg-amber-50 text-amber-700 border-amber-200",
        },
        "Rejected": {
            icon: <AlertTriangle size={11} />,
            badge: "bg-red-500/10 text-red-500 border-red-500/20",
        },
    };

    const statCards = [
        { icon: <Eye size={18} />, label: "Total Views", value: "4,829", change: "+12%", changeColor: "text-emerald-400", iconColor: "text-[#ae8dff]", iconBg: "bg-[#ae8dff]/10" },
        { icon: <Heart size={18} />, label: "Saved", value: "342", change: "+5.4%", changeColor: "text-emerald-400", iconColor: "text-[#ff97b5]", iconBg: "bg-[#ff97b5]/10" },
        { icon: <MessageSquare size={18} />, label: "Inquiries", value: "28", change: "Active", changeColor: "text-[#699cff]", iconColor: "text-[#699cff]", iconBg: "bg-[#699cff]/10" },
        { icon: <Gem size={18} />, label: "Points", value: "24,850", change: "pts", changeColor: isDark ? "text-[#adaaaa]" : "text-slate-400", iconColor: "text-[#ba9eff]", iconBg: "bg-[#ba9eff]/10" },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 relative pb-24 lg:pb-4">

            {/* ── Header ── */}
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pl-14 xl:pl-0">
                <div>
                    <p className="text-[#ba9eff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">Owner Dashboard</p>
                    <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>
                        Good evening,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ae8dff] to-[#bfd1ff]">
                            Zubair Khan
                        </span>
                    </h2>
                    <p className={`text-sm mt-1 ${textVariant}`}>Here's what's happening with your portfolio today.</p>
                </div>
                <button
                    onClick={() => setIsAddListingOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(138,92,246,0.35)] hover:brightness-110 transition-all shrink-0"
                >
                    <Plus size={15} /> New Listing
                </button>
            </header>

            {/* ── Stats Row ── */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
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
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className={`text-xl font-headline font-extrabold ${textPrimary}`}>{s.value}</span>
                                <span className={`text-[10px] font-bold ${s.changeColor}`}>{s.change}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">

                    {/* My Listings */}
                    <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                        {/* Section Header */}
                        <div className={`flex justify-between items-center px-6 py-4 border-b ${divider}`}>
                            <div className="flex items-center gap-3">
                                <h4 className={`text-base font-headline font-bold ${textPrimary}`}>My Listings</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-[#ba9eff]/10 text-[#ba9eff]" : "bg-violet-50 text-violet-700"}`}>
                                    {filteredListings.length} total
                                </span>
                            </div>
                            <button
                                onClick={() => router.push('/owner/listings')}
                                className={`text-xs flex items-center gap-1.5 font-bold transition-all hover:gap-2.5 ${isDark ? 'text-[#ba9eff]' : 'text-violet-600'}`}
                            >
                                View All <ArrowRight size={14} />
                            </button>
                        </div>

                        {/* Listing List — horizontal compact rows */}
                        <div className="divide-y divide-white/[0.04]">
                            <AnimatePresence mode="popLayout">
                                {filteredListings.length > 0 ? filteredListings.map((listing, idx) => {
                                    const cfg = statusConfig[listing.status] ?? statusConfig["Pending Review"];
                                    return (
                                        <motion.div
                                            key={listing.id}
                                            layout
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`group flex items-center gap-4 px-6 py-4 transition-colors ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"}`}
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0">
                                                <img
                                                    src={listing.imageUrl}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                {listing.status === "Rejected" && (
                                                    <div className="absolute inset-0 bg-black/40 backdrop-grayscale" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h5 className={`text-sm font-bold truncate ${textPrimary}`}>{listing.title}</h5>
                                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${cfg.badge}`}>
                                                        {cfg.icon} {listing.status}
                                                    </span>
                                                </div>
                                                <div className={`flex items-center gap-3 text-xs ${textVariant}`}>
                                                    <span className="flex items-center gap-1"><MapPin size={11} />{listing.location}</span>
                                                    <span className="flex items-center gap-1"><Bed size={11} />{listing.beds}</span>
                                                    <span className="flex items-center gap-1"><Bath size={11} />{listing.baths}</span>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            {listing.status === "Live" && (
                                                <div className="hidden sm:flex items-center gap-4 shrink-0">
                                                    <div className="text-center">
                                                        <p className={`text-xs font-bold ${textPrimary}`}>{listing.views?.toLocaleString()}</p>
                                                        <p className={`text-[9px] ${textVariant}`}>Views</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-xs font-bold ${textPrimary}`}>{listing.inquiries}</p>
                                                        <p className={`text-[9px] ${textVariant}`}>Inquiries</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Price + Actions */}
                                            <div className="shrink-0 text-right flex flex-col items-end gap-2">
                                                <p className={`text-sm font-bold ${listing.status === "Rejected" ? textVariant : "text-[#ba9eff]"}`}>
                                                    PKR {listing.price.toLocaleString()}
                                                </p>
                                                <button
                                                    onClick={() => setDetailListing(listing)}
                                                    className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-all ${isDark ? "border-white/10 text-zinc-400 hover:text-white hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                                                >
                                                    <Eye size={11} /> View
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                }) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-12 text-center"
                                    >
                                        <Search size={28} className={`mx-auto mb-3 ${textVariant}`} />
                                        <p className={`text-sm font-bold ${textPrimary}`}>No listings match "{searchQuery}"</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-3 border-t flex items-center justify-between ${divider} ${isDark ? "bg-[#201f1f]/50" : "bg-slate-50"}`}>
                            <p className={`text-[10px] ${textVariant}`}>{filteredListings.filter(l => l.status === "Live").length} active · {filteredListings.filter(l => l.status === "Pending Review").length} pending</p>
                            <button
                                onClick={() => setIsAddListingOpen(true)}
                                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${isDark ? "text-[#ba9eff] hover:text-white" : "text-violet-600 hover:text-slate-900"}`}
                            >
                                <Plus size={12} /> Add New
                            </button>
                        </div>
                    </section>

                    {/* ── Quick Actions / Boost ── */}
                    <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-[#ba9eff]/10 flex items-center justify-center">
                                    <Zap size={14} className="text-[#ba9eff]" />
                                </div>
                                <h4 className={`text-base font-headline font-bold ${textPrimary}`}>Boost Actions</h4>
                            </div>
                            <button
                                onClick={() => router.push('/owner/wallet')}
                                className={`text-xs flex items-center gap-1.5 font-bold transition-all hover:gap-2.5 ${isDark ? "text-[#ba9eff]" : "text-violet-600"}`}
                            >
                                <Wallet size={13} /> 24,850 pts
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px">
                            {[
                                { label: "Boost Listing", desc: "Top of searches for 24h", pts: 15, color: "text-[#ba9eff]", bg: "bg-[#ba9eff]/10", hover: isDark ? "hover:bg-[#201f1f]" : "hover:bg-slate-50" },
                                { label: "Featured Placement", desc: "Homepage banner for 3 days", pts: 40, color: "text-[#ff97b5]", bg: "bg-[#ff97b5]/10", hover: isDark ? "hover:bg-[#201f1f]" : "hover:bg-slate-50" },
                                { label: "Newsletter Feature", desc: "Weekly curator pick", pts: 820, color: "text-[#699cff]", bg: "bg-[#699cff]/10", hover: isDark ? "hover:bg-[#201f1f]" : "hover:bg-slate-50" },
                                { label: "Elite Certification", desc: "'Quality Verified' badge 1mo", pts: 1250, color: "text-emerald-400", bg: "bg-emerald-400/10", hover: isDark ? "hover:bg-[#201f1f]" : "hover:bg-slate-50" },
                            ].map((a, i) => (
                                <button
                                    key={i}
                                    className={`flex items-center justify-between px-6 py-4 text-left transition-colors ${a.hover} ${isDark ? "bg-[#131313]" : "bg-white"} ${i === 0 ? "" : ""}`}
                                >
                                    <div>
                                        <p className={`text-sm font-bold ${textPrimary}`}>{a.label}</p>
                                        <p className={`text-[11px] mt-0.5 ${textVariant}`}>{a.desc}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-lg shrink-0 ml-4 ${a.color} ${a.bg}`}>
                                        {a.pts} pts
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* ── Right Column ── */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Performance Overview */}
                    <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                        <div className={`px-5 py-4 border-b flex items-center gap-3 ${divider}`}>
                            <div className="w-7 h-7 rounded-lg bg-[#699cff]/10 flex items-center justify-center">
                                <BarChart3 size={14} className="text-[#699cff]" />
                            </div>
                            <h4 className={`text-base font-headline font-bold ${textPrimary}`}>Performance</h4>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                { label: "Conversion Rate", value: "12.4%", pct: 65, color: "bg-[#ba9eff]" },
                                { label: "Avg. Response Time", value: "1.2 hrs", pct: 85, color: "bg-[#699cff]" },
                                { label: "Profile Visibility", value: "Top 5%", pct: 95, color: "bg-[#ff97b5]" },
                                { label: "Occupancy Rate", value: "85%", pct: 85, color: "bg-emerald-400" },
                            ].map((m, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className={`text-xs font-medium ${textVariant}`}>{m.label}</span>
                                        <span className={`text-xs font-bold ${textPrimary}`}>{m.value}</span>
                                    </div>
                                    <div className={`w-full h-1.5 rounded-full ${isDark ? "bg-[#262626]" : "bg-slate-200"}`}>
                                        <motion.div
                                            className={`h-full rounded-full ${m.color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${m.pct}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Inquiries */}
                    <section className={`rounded-2xl overflow-hidden flex-1 ${surfaceLow}`}>
                        <div className={`px-5 py-4 border-b flex justify-between items-center ${divider}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-[#ae8dff]/10 flex items-center justify-center">
                                    <MessageSquare size={14} className="text-[#ae8dff]" />
                                </div>
                                <h4 className={`text-base font-headline font-bold ${textPrimary}`}>Inquiries</h4>
                            </div>
                            <span className="min-w-[20px] h-5 bg-[#ba9eff] text-[#39008c] text-[9px] font-bold rounded-full flex items-center justify-center px-1.5">
                                {mockOwnerInquiries.filter(i => i.status === "New").length} new
                            </span>
                        </div>

                        <div className="divide-y divide-white/[0.04]">
                            {mockOwnerInquiries.slice(0, 4).map((inq) => (
                                <div
                                    key={inq.id}
                                    onClick={() => router.push('/owner/inquiries')}
                                    className={`relative flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"}`}
                                >
                                    {inq.status === "New" && (
                                        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-[#ba9eff] rounded-r-full" />
                                    )}
                                    <img src={inq.avatarUrl} alt={inq.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <h6 className={`text-sm font-bold truncate ${textPrimary}`}>{inq.name}</h6>
                                            <span className={`text-[9px] shrink-0 ${textVariant}`}>{inq.timeAgo}</span>
                                        </div>
                                        <p className={`text-[11px] line-clamp-1 mt-0.5 ${textVariant}`}>{inq.message}</p>
                                    </div>
                                    {inq.status === "New" ? (
                                        <span className="w-2 h-2 rounded-full bg-[#ba9eff] shadow-[0_0_6px_rgba(186,158,255,0.9)] shrink-0" />
                                    ) : (
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${isDark ? "bg-zinc-700" : "bg-slate-300"}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={`p-4 border-t ${divider}`}>
                            <button
                                onClick={() => router.push('/owner/inquiries')}
                                className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isDark ? "bg-[#ba9eff]/8 text-[#ba9eff] hover:bg-[#ba9eff]/15" : "bg-violet-50 text-violet-700 hover:bg-violet-100"}`}
                            >
                                Open Inbox <ArrowRight size={12} />
                            </button>
                        </div>
                    </section>

                    {/* Points Wallet Mini */}
                    <section
                        onClick={() => router.push('/owner/wallet')}
                        className={`rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden ${isDark ? "bg-gradient-to-br from-[#201f1f] to-[#0f0f0f] border border-[#484847]/15" : "bg-gradient-to-br from-violet-50 to-slate-50 border border-violet-100"}`}
                    >
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#ba9eff]/10 rounded-full blur-[50px] -mr-10 -mb-10 pointer-events-none" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${textVariant}`}>Points Wallet</p>
                                <p className="text-2xl font-headline font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">
                                    24,850
                                </p>
                                <p className={`text-[11px] mt-1 ${textVariant}`}>+1,200 this month · Top 5%</p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-[#ba9eff]/15 flex items-center justify-center">
                                <Gem size={20} className="text-[#ba9eff]" />
                            </div>
                        </div>
                        <div className={`mt-3 pt-3 border-t flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isDark ? "border-white/5 text-[#ba9eff]" : "border-violet-100 text-violet-600"}`}>
                            <TrendingUp size={11} /> Manage wallet <ArrowRight size={11} className="ml-auto" />
                        </div>
                    </section>
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsAddListingOpen(true)}
                className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 w-14 h-14 bg-gradient-to-tr from-violet-500 to-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(138,92,246,0.8)] hover:scale-110 active:scale-95 transition-all z-40 group"
            >
                <Plus size={24} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <OwnerListingDetailModal
                listing={detailListing}
                onClose={() => setDetailListing(null)}
            />
            <OwnerAddListingModal
                isOpen={isAddListingOpen}
                onClose={() => setIsAddListingOpen(false)}
            />
        </div>
    );
}
