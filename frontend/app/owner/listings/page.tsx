"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { mockOwnerListings, type OwnerListing } from "@/components/owner/mockData";
import OwnerListingDetailModal from "@/components/owner/OwnerListingDetailModal";
import OwnerAddListingModal from "@/components/owner/OwnerAddListingModal";
import OwnerEditListingModal from "@/components/owner/OwnerEditListingModal";
import OwnerDeleteConfirmModal from "@/components/owner/OwnerDeleteConfirmModal";
import {
    Eye, MessageSquare, Edit, Trash2, Archive, TrendingUp, Star,
    AlertTriangle, Clock, CheckCircle2, Plus, MapPin, Bed, Bath,
    BarChart3, Percent, RefreshCw
} from "lucide-react";

export default function OwnerListingsPage() {
    const { isDark } = useOwnerTheme();
    const [listings, setListings] = useState<OwnerListing[]>(mockOwnerListings);
    const [filter, setFilter] = useState<"All" | "Live" | "Pending Review" | "Rejected">("All");

    // Modal states
    const [detailListing, setDetailListing] = useState<OwnerListing | null>(null);
    const [editListing, setEditListing] = useState<OwnerListing | null>(null);
    const [deleteListing, setDeleteListing] = useState<OwnerListing | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const filtered = listings.filter(l => filter === "All" ? true : l.status === filter);

    const handleSaveEdit = (updated: OwnerListing) => {
        setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
        setEditListing(null);
    };

    const handleDelete = (id: string) => {
        setListings(prev => prev.filter(l => l.id !== id));
        setDeleteListing(null);
    };

    // Theme tokens
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-200";
    const tabActive = isDark
        ? "bg-[#ba9eff]/15 text-[#ba9eff] border border-[#ba9eff]/20"
        : "bg-violet-100 text-violet-700 border border-violet-200";
    const tabInactive = isDark
        ? "text-[#adaaaa] hover:text-white hover:bg-white/5 border border-transparent"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent";

    const statusConfig = {
        "Live": {
            dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
            badge: isDark ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200",
            icon: <CheckCircle2 size={12} />,
        },
        "Pending Review": {
            dot: "bg-amber-400 animate-pulse",
            badge: isDark ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "bg-amber-50 text-amber-700 border border-amber-200",
            icon: <Clock size={12} />,
        },
        "Rejected": {
            dot: "bg-red-500",
            badge: "bg-red-500/10 text-red-500 border border-red-500/20",
            icon: <AlertTriangle size={12} />,
        },
    };

    const counts = {
        All: listings.length,
        "Live": listings.filter(l => l.status === "Live").length,
        "Pending Review": listings.filter(l => l.status === "Pending Review").length,
        "Rejected": listings.filter(l => l.status === "Rejected").length,
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 relative pb-24 lg:pb-10">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pl-14 xl:pl-0">
                <div>
                    <p className="text-[#ba9eff] font-medium tracking-widest text-xs uppercase mb-2">Portfolio</p>
                    <h2 className={`text-3xl md:text-4xl font-headline font-extrabold tracking-tight ${textPrimary}`}>
                        Your Curated{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ae8dff] to-[#699cff]">
                            Listings
                        </span>
                    </h2>
                    <p className={`mt-2 text-sm ${textVariant}`}>Manage, track and promote your properties.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-5 py-3 rounded-xl text-center ${surfaceLow}`}>
                        <div className="text-xl font-bold text-[#ba9eff]">{counts["Live"]}</div>
                        <div className={`text-[10px] uppercase tracking-widest font-bold ${textVariant}`}>Active</div>
                    </div>
                    <div className={`px-5 py-3 rounded-xl text-center ${surfaceLow}`}>
                        <div className="text-xl font-bold text-[#699cff]">{listings.reduce((a, l) => a + (l.inquiries ?? 0), 0)}</div>
                        <div className={`text-[10px] uppercase tracking-widest font-bold ${textVariant}`}>Inquiries</div>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(138,92,246,0.4)] hover:brightness-110 transition-all"
                    >
                        <Plus size={16} /> Add Property
                    </button>
                </div>
            </header>

            {/* Performance Metrics Strip */}
            <section className={`rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 ${surfaceLow}`}>
                {[
                    { label: "Member Conversion", value: "12.4%", icon: <Percent size={16} />, color: "text-[#ba9eff]", progress: 65, bar: "bg-[#ba9eff]" },
                    { label: "Avg. Response Time", value: "1.2 hrs", icon: <Clock size={16} />, color: "text-[#699cff]", progress: 85, bar: "bg-[#699cff]" },
                    { label: "Profile Visibility", value: "Top 5%", icon: <BarChart3 size={16} />, color: "text-[#ff97b5]", progress: 95, bar: "bg-[#ff97b5]" },
                    { label: "Total Views", value: "4,829", icon: <Eye size={16} />, color: "text-emerald-400", progress: 72, bar: "bg-emerald-400" },
                ].map((m, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-bold flex items-center gap-1.5 ${textVariant}`}>{m.icon}{m.label}</span>
                            <span className={`text-sm font-bold ${m.color}`}>{m.value}</span>
                        </div>
                        <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? "bg-[#262626]" : "bg-slate-200"}`}>
                            <div className={`${m.bar} h-full rounded-full`} style={{ width: `${m.progress}%` }} />
                        </div>
                    </div>
                ))}
            </section>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {(["All", "Live", "Pending Review", "Rejected"] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? tabActive : tabInactive}`}
                    >
                        {f} <span className="ml-1 opacity-60">({counts[f]})</span>
                    </button>
                ))}
            </div>

            {/* Listing Grid */}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filtered.map(listing => {
                        const cfg = statusConfig[listing.status];
                        const isRejected = listing.status === "Rejected";
                        const isPending = listing.status === "Pending Review";

                        return (
                            <motion.div
                                key={listing.id}
                                layout
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.3 }}
                                className={`group rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${surfaceHigh} ${isRejected ? "opacity-80 hover:opacity-100" : ""}`}
                            >
                                {/* Image with hover overlay */}
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <img
                                        src={listing.imageUrl}
                                        alt={listing.title}
                                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isRejected ? "grayscale" : ""}`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {/* Hover action overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                        {/* Eye — view full detail */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setDetailListing(listing)}
                                            className="w-11 h-11 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-[0ms]"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </motion.button>

                                        {/* Edit */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setEditListing(listing)}
                                            className="w-11 h-11 rounded-full bg-[#ba9eff] text-[#39008c] flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-[50ms]"
                                            title="Edit Listing"
                                        >
                                            <Edit size={16} />
                                        </motion.button>

                                        {/* Delete */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setDeleteListing(listing)}
                                            className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-[100ms]"
                                            title="Delete Listing"
                                        >
                                            <Trash2 size={16} />
                                        </motion.button>
                                    </div>

                                    {/* Status badges */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                                        {listing.boosted && (
                                            <span className="backdrop-blur-xl bg-black/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#ba9eff] shadow-[0_0_6px_rgba(186,158,255,1)]" />
                                                Boosted
                                            </span>
                                        )}
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                            {listing.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <h3 className={`text-base font-bold font-headline tracking-tight truncate ${textPrimary} ${isRejected ? "opacity-60" : ""}`}>
                                                {listing.title}
                                            </h3>
                                            <p className={`text-xs flex items-center gap-1 mt-0.5 ${textVariant}`}>
                                                <MapPin size={11} /> {listing.location}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`font-bold text-sm ${isRejected ? "text-[#adaaaa]/40" : "text-[#ba9eff]"}`}>
                                                PKR {listing.price.toLocaleString()}
                                            </p>
                                            <p className={`text-[10px] ${textVariant}`}>{listing.priceUnit}</p>
                                        </div>
                                    </div>

                                    {/* Rejection reason or stats */}
                                    {isRejected ? (
                                        <div className={`mb-3 p-3 rounded-xl border text-xs text-red-500 leading-relaxed ${isDark ? "bg-red-500/8 border-red-500/15" : "bg-red-50 border-red-200"}`}>
                                            <span className="font-bold">Reason: </span>{listing.rejectionReason}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className={`p-2.5 rounded-xl ${surfaceLow} ${isPending ? "opacity-40" : ""}`}>
                                                <div className={`flex items-center gap-1.5 mb-0.5 ${textVariant}`}>
                                                    <Eye size={11} />
                                                    <span className="text-[9px] uppercase font-bold tracking-tight">Views</span>
                                                </div>
                                                <p className={`text-sm font-bold ${textPrimary}`}>{isPending ? "--" : listing.views?.toLocaleString()}</p>
                                            </div>
                                            <div className={`p-2.5 rounded-xl ${surfaceLow} ${isPending ? "opacity-40" : ""}`}>
                                                <div className={`flex items-center gap-1.5 mb-0.5 ${textVariant}`}>
                                                    <MessageSquare size={11} />
                                                    <span className="text-[9px] uppercase font-bold tracking-tight">Inquiries</span>
                                                </div>
                                                <p className={`text-sm font-bold ${textPrimary}`}>{isPending ? "--" : listing.inquiries}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Beds / Baths */}
                                    <div className={`flex gap-3 mb-4 text-xs ${textVariant}`}>
                                        <span className="flex items-center gap-1"><Bed size={11} />{listing.beds} Beds</span>
                                        <span className="flex items-center gap-1"><Bath size={11} />{listing.baths} Baths</span>
                                    </div>

                                    {/* Bottom actions */}
                                    <div className={`flex items-center justify-between pt-3 border-t ${isDark ? "border-white/5" : "border-slate-200"}`}>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setEditListing(listing)}
                                                className={`transition-colors ${textVariant} hover:text-[#ba9eff]`}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {isRejected ? (
                                                <button
                                                    onClick={() => setDeleteListing(listing)}
                                                    className={`transition-colors ${textVariant} hover:text-red-500`}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            ) : (
                                                <button className={`transition-colors ${textVariant} hover:text-amber-400`} title="Archive">
                                                    <Archive size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {listing.status === "Live" && (
                                            <div className="flex gap-2">
                                                <button className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${isDark ? "bg-[#39008c]/20 text-[#ba9eff] hover:bg-[#39008c]/40 border border-[#ba9eff]/20" : "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"}`}>
                                                    <TrendingUp size={10} /> Boost
                                                </button>
                                                <button className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${isDark ? "bg-[#6a0934]/20 text-[#ff97b5] hover:bg-[#6a0934]/40 border border-[#ff97b5]/20" : "bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100"}`}>
                                                    <Star size={10} /> Feature
                                                </button>
                                            </div>
                                        )}
                                        {isPending && (
                                            <span className={`text-[10px] font-bold uppercase tracking-widest italic ${textVariant}`}>In Review</span>
                                        )}
                                        {isRejected && (
                                            <button
                                                onClick={() => setEditListing(listing)}
                                                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${isDark ? "bg-[#ba9eff]/15 text-[#ba9eff] hover:bg-[#ba9eff]/25 border border-[#ba9eff]/20" : "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"}`}
                                            >
                                                <RefreshCw size={10} /> Resubmit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Concierge support banner */}
            <section className={`rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden ${isDark ? "bg-gradient-to-br from-[#201f1f] to-[#0e0e0e] border border-[#484847]/15" : "bg-gradient-to-br from-violet-50 to-white border border-violet-100"}`}>
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#ba9eff]/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                <div className="flex-1 relative z-10">
                    <p className="text-[#ba9eff] text-xs font-bold uppercase tracking-widest mb-2">Concierge Support</p>
                    <h4 className={`text-xl font-bold font-headline mb-2 ${textPrimary}`}>Need help with your listing?</h4>
                    <p className={`text-sm leading-relaxed max-w-lg ${textVariant}`}>
                        Our dedicated account managers are available 24/7 to help optimize your property profile and maximize visibility.
                    </p>
                </div>
                <button className="relative z-10 shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(138,92,246,0.3)] hover:brightness-110 transition-all">
                    Contact Partner Support
                </button>
            </section>

            {/* FAB Mobile */}
            <button
                onClick={() => setIsAddOpen(true)}
                className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 w-14 h-14 bg-gradient-to-tr from-violet-500 to-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(138,92,246,0.8)] hover:scale-110 active:scale-95 transition-all z-40 group"
            >
                <Plus size={24} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* ── Modals ── */}
            <OwnerListingDetailModal
                listing={detailListing}
                onClose={() => setDetailListing(null)}
                onEdit={l => { setDetailListing(null); setEditListing(l); }}
                onDelete={l => { setDetailListing(null); setDeleteListing(l); }}
            />

            <OwnerEditListingModal
                listing={editListing}
                onClose={() => setEditListing(null)}
                onSave={handleSaveEdit}
            />

            <OwnerDeleteConfirmModal
                listing={deleteListing}
                onClose={() => setDeleteListing(null)}
                onConfirm={handleDelete}
            />

            <OwnerAddListingModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />
        </div>
    );
}
