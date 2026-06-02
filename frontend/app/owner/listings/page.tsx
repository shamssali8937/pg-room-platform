"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOwnerRooms, deleteRoom, submitRoom, boostRoom } from "@/store/slices/roomSlice";
import type { Room } from "@/store/slices/roomSlice";
import OwnerAddListingModal from "@/components/owner/OwnerAddListingModal";
import OwnerEditListingModal from "@/components/owner/OwnerEditListingModal";
import OwnerDeleteConfirmModal from "@/components/owner/OwnerDeleteConfirmModal";
import OwnerListingDetailModal from "@/components/owner/OwnerListingDetailModal";
import {
    Eye, MessageSquare, Edit, Trash2, Archive, TrendingUp, Star,
    AlertTriangle, Clock, CheckCircle2, Plus, MapPin, Bed, Bath,
    BarChart3, Percent, RefreshCw, Loader2
} from "lucide-react";

const STATUS_CONFIG: Record<string, {
    dot: string; badge: (dark: boolean) => string; icon: React.ReactNode; label: string;
}> = {
    active: {
        dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
        badge: (d) => d ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: <CheckCircle2 size={12} />,
        label: "Live",
    },
    pending: {
        dot: "bg-amber-400 animate-pulse",
        badge: (d) => d ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "bg-amber-50 text-amber-700 border border-amber-200",
        icon: <Clock size={12} />,
        label: "Pending",
    },
    rejected: {
        dot: "bg-red-500",
        badge: () => "bg-red-500/10 text-red-500 border border-red-500/20",
        icon: <AlertTriangle size={12} />,
        label: "Rejected",
    },
    draft: {
        dot: "bg-zinc-500",
        badge: (d) => d ? "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20" : "bg-slate-100 text-slate-500 border border-slate-200",
        icon: <Clock size={12} />,
        label: "Draft",
    },
};

function roomToOwnerListing(room: Room): any {
    return {
        id: room.id,
        title: room.title,
        price: room.price,
        priceUnit: `/${room.price_unit ?? "mo"}`,
        status: room.status === "active" ? "Live" : room.status === "pending" ? "Pending Review" : room.status === "rejected" ? "Rejected" : "Pending Review",
        boosted: room.is_boosted,
        featured: room.is_featured,
        location: room.city,
        beds: room.beds,
        baths: room.baths,
        imageUrl: room.images?.[0]?.url ?? "",
        gallery: room.images?.map((i) => i.url) ?? [],
        views: room.views,
        inquiries: room.inquiries ?? 0,
        description: room.description ?? "",
        amenities: room.amenities ?? [],
        rejectionReason: room.rejection_reason ?? undefined,

        // Schema mappings:
        roomType: room.room_type ?? "Private Room",
        capacity: room.beds,
        occupancy: 80,
        locality: room.locality ?? "",
        landmark: room.landmark ?? "",
        address: room.address ?? "",
        furnishedStatus: room.furnished_status ?? "unfurnished",
        securityDeposit: room.security_deposit_amount ?? 0,
        availableFor: room.available_for ?? "any",
        genderPreference: room.gender_preference ?? "any",
        sqft: room.sqft ?? room.size_value ?? 0,
        availabilityDate: room.availability_date ? new Date(room.availability_date).toISOString().split('T')[0] : "",
    };
}

type FilterType = "all" | "active" | "pending" | "rejected";

export default function OwnerListingsPage() {
    const { isDark } = useOwnerTheme();
    const dispatch = useAppDispatch();
    const { ownerRooms, isLoading, error } = useAppSelector((s) => s.room);

    const [filter, setFilter] = useState<FilterType>("all");
    const [detailRoom, setDetailRoom] = useState<Room | null>(null);
    const [editRoom, setEditRoom] = useState<Room | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [boostingId, setBoostingId] = useState<string | null>(null);
    const [submittingId, setSubmittingId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchOwnerRooms());
    }, [dispatch]);

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-200";
    const tabActive = isDark ? "bg-[#ba9eff]/15 text-[#ba9eff] border border-[#ba9eff]/20" : "bg-violet-100 text-violet-700 border border-violet-200";
    const tabInactive = isDark ? "text-[#adaaaa] hover:text-white hover:bg-white/5 border border-transparent" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent";

    const filtered = filter === "all" ? ownerRooms : ownerRooms.filter((r) => r.status === filter);

    const counts = {
        all: ownerRooms.length,
        active: ownerRooms.filter((r) => r.status === "active").length,
        pending: ownerRooms.filter((r) => r.status === "pending").length,
        rejected: ownerRooms.filter((r) => r.status === "rejected").length,
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        await dispatch(deleteRoom(id));
        setDeletingId(null);
        setDeleteTarget(null);
    };

    const handleBoost = async (id: string) => {
        setBoostingId(id);
        await dispatch(boostRoom(id));
        setBoostingId(null);
        dispatch(fetchOwnerRooms());
    };

    const handleResubmit = async (id: string) => {
        setSubmittingId(id);
        await dispatch(submitRoom(id));
        setSubmittingId(null);
    };

    const filters: Array<{ key: FilterType; label: string }> = [
        { key: "all", label: "All" },
        { key: "active", label: "Live" },
        { key: "pending", label: "Pending Review" },
        { key: "rejected", label: "Rejected" },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 relative pb-24 lg:pb-10">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pl-14 xl:pl-0">
                <div>
                    <p className="text-[#ba9eff] font-medium tracking-widest text-xs uppercase mb-2">Portfolio</p>
                    <h2 className={`text-3xl md:text-4xl font-headline font-extrabold tracking-tight ${textPrimary}`}>
                        Your Curated{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ae8dff] to-[#699cff]">Listings</span>
                    </h2>
                    <p className={`mt-2 text-sm ${textVariant}`}>Manage, track and promote your properties.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-5 py-3 rounded-xl text-center ${surfaceLow}`}>
                        <div className="text-xl font-bold text-[#ba9eff]">{counts.active}</div>
                        <div className={`text-[10px] uppercase tracking-widest font-bold ${textVariant}`}>Active</div>
                    </div>
                    <div className={`px-5 py-3 rounded-xl text-center ${surfaceLow}`}>
                        <div className="text-xl font-bold text-[#699cff]">{ownerRooms.reduce((a, r) => a + r.views, 0).toLocaleString()}</div>
                        <div className={`text-[10px] uppercase tracking-widest font-bold ${textVariant}`}>Views</div>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(138,92,246,0.4)] hover:brightness-110 transition-all"
                    >
                        <Plus size={16} /> Add Property
                    </button>
                </div>
            </header>

            {/* Metrics Strip */}
            <section className={`rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 ${surfaceLow}`}>
                {[
                    { label: "Total Rooms", value: ownerRooms.length, icon: <Bed size={16} />, color: "text-[#ba9eff]", progress: Math.min(ownerRooms.length * 20, 100), bar: "bg-[#ba9eff]" },
                    { label: "Total Views", value: ownerRooms.reduce((a, r) => a + r.views, 0).toLocaleString(), icon: <Eye size={16} />, color: "text-emerald-400", progress: 72, bar: "bg-emerald-400" },
                    { label: "Active Listings", value: counts.active, icon: <CheckCircle2 size={16} />, color: "text-[#699cff]", progress: ownerRooms.length > 0 ? Math.round((counts.active / ownerRooms.length) * 100) : 0, bar: "bg-[#699cff]" },
                    { label: "Pending Review", value: counts.pending, icon: <Clock size={16} />, color: "text-amber-400", progress: ownerRooms.length > 0 ? Math.round((counts.pending / ownerRooms.length) * 100) : 0, bar: "bg-amber-400" },
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
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${filter === f.key ? tabActive : tabInactive}`}
                    >
                        {f.label} <span className="ml-1 opacity-60">({counts[f.key]})</span>
                    </button>
                ))}
            </div>

            {/* Listings Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className={`rounded-2xl overflow-hidden animate-pulse ${surfaceHigh}`}>
                            <div className={`aspect-[16/10] ${isDark ? "bg-[#262626]" : "bg-slate-200"}`} />
                            <div className="p-5 space-y-3">
                                <div className={`h-4 w-3/4 rounded ${isDark ? "bg-[#262626]" : "bg-slate-200"}`} />
                                <div className={`h-3 w-1/2 rounded ${isDark ? "bg-[#262626]" : "bg-slate-200"}`} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <Plus size={32} className={`mx-auto mb-3 ${textVariant}`} />
                    <p className={`font-bold ${textPrimary}`}>{filter === "all" ? "No listings yet" : `No ${filter} listings`}</p>
                    {filter === "all" && (
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all"
                        >
                            Add First Property
                        </button>
                    )}
                </div>
            ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((room) => {
                            const statusKey = room.status as keyof typeof STATUS_CONFIG;
                            const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.draft;
                            const isRejected = room.status === "rejected";
                            const isPending = room.status === "pending";
                            const isDeleting = deletingId === room.id;

                            return (
                                <motion.div
                                    key={room.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.3 }}
                                    className={`group rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${surfaceHigh} ${isRejected ? "opacity-80 hover:opacity-100" : ""}`}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        {room.images?.[0] ? (
                                            <img
                                                src={room.images[0].url}
                                                alt={room.title}
                                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isRejected ? "grayscale" : ""}`}
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`}>
                                                <Bed size={32} className={textVariant} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Hover action overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setDetailRoom(room)}
                                                className="w-11 h-11 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-[0ms]"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setEditRoom(room)}
                                                className="w-11 h-11 rounded-full bg-[#ba9eff] text-[#39008c] flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-[50ms]"
                                                title="Edit Listing"
                                            >
                                                <Edit size={16} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setDeleteTarget(room)}
                                                disabled={isDeleting}
                                                className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-[100ms]"
                                                title="Delete"
                                            >
                                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </motion.button>
                                        </div>

                                        {/* Badges */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                                            {room.is_boosted && (
                                                <span className="backdrop-blur-xl bg-black/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba9eff] shadow-[0_0_6px_rgba(186,158,255,1)]" />
                                                    Boosted
                                                </span>
                                            )}
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.badge(isDark)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                {cfg.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="min-w-0 flex-1 pr-2">
                                                <h3 className={`text-base font-bold font-headline tracking-tight truncate ${textPrimary} ${isRejected ? "opacity-60" : ""}`}>
                                                    {room.title}
                                                </h3>
                                                <p className={`text-xs flex items-center gap-1 mt-0.5 ${textVariant}`}>
                                                    <MapPin size={11} /> {room.city}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`font-bold text-sm ${isRejected ? "text-[#adaaaa]/40" : "text-[#ba9eff]"}`}>
                                                    PKR {room.price.toLocaleString()}
                                                </p>
                                                <p className={`text-[10px] ${textVariant}`}>/{room.price_unit ?? "mo"}</p>
                                            </div>
                                        </div>

                                        {isRejected && room.rejection_reason ? (
                                            <div className={`mb-3 p-3 rounded-xl border text-xs text-red-500 leading-relaxed ${isDark ? "bg-red-500/8 border-red-500/15" : "bg-red-50 border-red-200"}`}>
                                                <span className="font-bold">Reason: </span>{room.rejection_reason}
                                            </div>
                                        ) : !isRejected ? (
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <div className={`p-2.5 rounded-xl ${surfaceLow} ${isPending ? "opacity-40" : ""}`}>
                                                    <div className={`flex items-center gap-1.5 mb-0.5 ${textVariant}`}>
                                                        <Eye size={11} />
                                                        <span className="text-[9px] uppercase font-bold tracking-tight">Views</span>
                                                    </div>
                                                    <p className={`text-sm font-bold ${textPrimary}`}>{isPending ? "—" : room.views.toLocaleString()}</p>
                                                </div>
                                                <div className={`p-2.5 rounded-xl ${surfaceLow} ${isPending ? "opacity-40" : ""}`}>
                                                    <div className={`flex items-center gap-1.5 mb-0.5 ${textVariant}`}>
                                                        <MessageSquare size={11} />
                                                        <span className="text-[9px] uppercase font-bold tracking-tight">Beds/Baths</span>
                                                    </div>
                                                    <p className={`text-sm font-bold ${textPrimary}`}>{room.beds}B / {room.baths}Ba</p>
                                                </div>
                                            </div>
                                        ) : null}

                                        <div className={`flex items-center justify-between pt-3 border-t ${isDark ? "border-white/5" : "border-slate-200"}`}>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setEditRoom(room)}
                                                    className={`transition-colors ${textVariant} hover:text-[#ba9eff]`}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(room)}
                                                    className={`transition-colors ${textVariant} hover:text-red-500`}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="flex gap-2">
                                                {room.status === "active" && (
                                                    room.is_boosted ? (
                                                        <button
                                                            disabled
                                                            className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border ${isDark ? "bg-zinc-800 text-zinc-500 border-zinc-700/30 cursor-not-allowed" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"}`}
                                                        >
                                                            <CheckCircle2 size={10} className="text-emerald-400" />
                                                            Boosted
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleBoost(room.id)}
                                                            disabled={boostingId === room.id}
                                                            className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${isDark ? "bg-[#39008c]/20 text-[#ba9eff] hover:bg-[#39008c]/40 border border-[#ba9eff]/20" : "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"}`}
                                                        >
                                                            {boostingId === room.id ? <Loader2 size={10} className="animate-spin" /> : <TrendingUp size={10} />}
                                                            Boost
                                                        </button>
                                                    )
                                                )}
                                                {isPending && (
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest italic ${textVariant}`}>In Review</span>
                                                )}
                                                {isRejected && (
                                                    <button
                                                        onClick={() => handleResubmit(room.id)}
                                                        disabled={submittingId === room.id}
                                                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${isDark ? "bg-[#ba9eff]/15 text-[#ba9eff] hover:bg-[#ba9eff]/25 border border-[#ba9eff]/20" : "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"}`}
                                                    >
                                                        {submittingId === room.id ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                                                        Resubmit
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Concierge Banner */}
            <section className={`rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden ${isDark ? "bg-gradient-to-br from-[#201f1f] to-[#0e0e0e] border border-[#484847]/15" : "bg-gradient-to-br from-violet-50 to-white border border-violet-100"}`}>
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#ba9eff]/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                <div className="flex-1 relative z-10">
                    <p className="text-[#ba9eff] text-xs font-bold uppercase tracking-widest mb-2">Concierge Support</p>
                    <h4 className={`text-xl font-bold font-headline mb-2 ${textPrimary}`}>Need help with your listing?</h4>
                    <p className={`text-sm leading-relaxed max-w-lg ${textVariant}`}>
                        Our dedicated account managers are available 24/7 to help optimize your property profile.
                    </p>
                </div>
                <button className="relative z-10 shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(138,92,246,0.3)] hover:brightness-110 transition-all">
                    Contact Partner Support
                </button>
            </section>

            {/* FAB */}
            <button
                onClick={() => setIsAddOpen(true)}
                className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 w-14 h-14 bg-gradient-to-tr from-violet-500 to-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(138,92,246,0.8)] hover:scale-110 active:scale-95 transition-all z-40 group"
            >
                <Plus size={24} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Modals */}
            {detailRoom && (
                <OwnerListingDetailModal
                    listing={roomToOwnerListing(detailRoom)}
                    onClose={() => setDetailRoom(null)}
                    onEdit={() => { setDetailRoom(null); setEditRoom(detailRoom); }}
                    onDelete={() => { setDetailRoom(null); setDeleteTarget(detailRoom); }}
                />
            )}

            {editRoom && (
                <OwnerEditListingModal
                    listing={roomToOwnerListing(editRoom)}
                    onClose={() => setEditRoom(null)}
                    onSave={async (updated) => {
                        const { updateRoom } = await import("@/store/slices/roomSlice");
                        await dispatch(updateRoom({
                            id: editRoom.id,
                            body: {
                                title: updated.title,
                                price: Number(updated.price),
                                description: updated.description,
                                city: updated.location,
                                address: updated.address,
                                locality: updated.locality,
                                landmark: updated.landmark,
                                room_type: updated.roomType,
                                beds: Number(updated.beds),
                                baths: Number(updated.baths),
                                sqft: Number(updated.sqft),
                                furnished_status: updated.furnishedStatus,
                                security_deposit_amount: Number(updated.securityDeposit),
                                available_for: updated.availableFor,
                                gender_preference: updated.genderPreference,
                                amenities: updated.amenities,
                                availability_date: updated.availabilityDate,
                            }
                        }));
                        setEditRoom(null);
                    }}
                />
            )}

            {deleteTarget && (
                <OwnerDeleteConfirmModal
                    listing={roomToOwnerListing(deleteTarget)}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={() => handleDelete(deleteTarget.id)}
                />
            )}

            <OwnerAddListingModal
                isOpen={isAddOpen}
                onClose={() => {
                    setIsAddOpen(false);
                    dispatch(fetchOwnerRooms());
                }}
            />
        </div>
    );
}
