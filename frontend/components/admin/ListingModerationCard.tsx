"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    XCircle,
    Flag,
    Eye,
    Ban,
    Trash2,
    FileEdit,
    SkipForward,
    Info,
    Gavel,
    MapPin,
    ChevronDown,
} from "lucide-react";
import {
    type ModerationListing,
    type ModerationStatus,
    rejectionReasons,
} from "./mockData";

interface ListingModerationCardProps {
    listing: ModerationListing;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onSuspend: (id: string) => void;
    onFlag: (id: string) => void;
    onDelete: (id: string) => void;
    onReviewAppeal: (id: string) => void;
    onAudit: (id: string) => void;
    onSkip: (id: string) => void;
    onViewDetail: (listing: ModerationListing) => void;
    index?: number;
}

// Status badge config
const statusConfig: Record<
    ModerationStatus,
    { label: string; bg: string; text: string; border: string }
> = {
    pending: {
        label: "Pending Review",
        bg: "bg-purple-500/20",
        text: "text-purple-400",
        border: "border-purple-500/30",
    },
    approved: {
        label: "Live & Active",
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/30",
    },
    suspended: {
        label: "Suspended",
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/30",
    },
    audit: {
        label: "Audit Required",
        bg: "bg-pink-500/20",
        text: "text-pink-400",
        border: "border-pink-500/30",
    },
};

export default function ListingModerationCard({
    listing,
    onApprove,
    onReject,
    onSuspend,
    onFlag,
    onDelete,
    onReviewAppeal,
    onAudit,
    onSkip,
    onViewDetail,
    index = 0,
}: ListingModerationCardProps) {
    const [showRejectMenu, setShowRejectMenu] = useState(false);
    const [selectedReason, setSelectedReason] = useState(rejectionReasons[0]);
    const rejectRef = useRef<HTMLDivElement>(null);

    const status = statusConfig[listing.status];
    const isSuspended = listing.status === "suspended";

    // Close reject dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (rejectRef.current && !rejectRef.current.contains(e.target as Node)) {
                setShowRejectMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const formattedPrice = new Intl.NumberFormat("en-PK").format(listing.price);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            layout
            className={`group relative bg-zinc-900/60 rounded-[1.75rem] overflow-visible flex flex-col md:flex-row border border-white/[0.04] shadow-2xl shadow-black/30 transition-all duration-500 hover:-translate-y-1 ${
                isSuspended ? "opacity-70 grayscale-[0.4]" : ""
            }`}
        >
            {/* ── Image Section ── */}
            <div className="md:w-2/5 relative overflow-hidden min-h-[200px] md:min-h-0 rounded-t-[1.75rem] md:rounded-l-[1.75rem] md:rounded-tr-none">
                <img
                    src={listing.image}
                    alt={listing.title}
                    className={`h-full w-full object-cover transition-transform duration-700 ${
                        isSuspended ? "" : "group-hover:scale-110"
                    }`}
                />

                {/* ID Badge */}
                <div className="absolute top-5 left-5">
                    <span className="bg-black/40 backdrop-blur-xl text-[10px] uppercase tracking-widest font-bold text-purple-300 px-3 py-1.5 rounded-full border border-white/10">
                        #{listing.id}
                    </span>
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-5 left-5">
                    <span
                        className={`${status.bg} ${status.text} text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full backdrop-blur-md border ${status.border} flex items-center gap-2`}
                    >
                        {listing.status === "audit" && <Gavel size={12} />}
                        {status.label}
                    </span>
                </div>

                {/* Suspended Overlay */}
                {isSuspended && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-red-400 text-xs font-bold uppercase tracking-[0.3em] rotate-12 border-4 border-red-400 px-4 py-2">
                            Suspended
                        </span>
                    </div>
                )}

                {/* Click to View Detail — image overlay */}
                <button
                    onClick={() => onViewDetail(listing)}
                    className="absolute inset-0 bg-transparent hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
                >
                    <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/20">
                        <Eye size={14} className="inline mr-1.5 -mt-0.5" />
                        View Details
                    </span>
                </button>
            </div>

            {/* ── Content Section ── */}
            <div className="md:w-3/5 p-6 sm:p-7 flex flex-col justify-between">
                <div>
                    {/* Title + Price */}
                    <div className="flex justify-between items-start mb-3 gap-3">
                        <h3
                            className="text-lg sm:text-xl font-bold leading-tight text-white truncate"
                            style={{ fontFamily: "Manrope, sans-serif" }}
                        >
                            {listing.title}
                        </h3>
                        <div className="text-right flex-shrink-0">
                            <p
                                className={`font-bold text-base sm:text-lg ${
                                    isSuspended ? "text-zinc-500" : "text-purple-400"
                                }`}
                            >
                                {listing.currency} {formattedPrice}
                            </p>
                            {!isSuspended && (
                                <p className="text-zinc-500 text-[10px] uppercase tracking-tight">
                                    per month
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-zinc-500 text-xs sm:text-sm mb-4">
                        <MapPin size={13} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{listing.location}</span>
                    </div>

                    {/* Audit Note */}
                    {listing.status === "audit" && listing.auditNote && (
                        <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 mb-4 italic border-l-2 border-pink-500/40 pl-3">
                            &ldquo;{listing.auditNote}&rdquo;
                        </p>
                    )}

                    {/* Suspended Flag Reason */}
                    {isSuspended && listing.flagReason && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4">
                            <p className="text-red-400 text-xs font-semibold flex items-center gap-2">
                                <Info size={13} className="flex-shrink-0" />
                                <span className="line-clamp-2">{listing.flagReason}</span>
                            </p>
                        </div>
                    )}

                    {/* Host Info */}
                    <div className="flex items-center gap-3 mb-5">
                        <img
                            src={listing.host.avatar}
                            alt={listing.host.name}
                            className="w-7 h-7 rounded-full border border-white/10 flex-shrink-0"
                        />
                        <div className="text-xs min-w-0">
                            <p className="text-white font-semibold truncate">{listing.host.name}</p>
                            <p className="text-zinc-500 truncate">
                                {listing.host.badge} • {listing.host.detail}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Actions by Status ── */}
                {listing.status === "pending" && (
                    <div className="grid grid-cols-3 gap-2">
                        {/* Approve */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onApprove(listing.id)}
                            className="bg-purple-500 py-2.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-1"
                        >
                            <CheckCircle2 size={13} />
                            <span className="hidden sm:inline">Approve</span>
                        </motion.button>

                        {/* Reject with dropdown */}
                        <div className="relative" ref={rejectRef}>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowRejectMenu(!showRejectMenu)}
                                className="w-full bg-zinc-800/80 border border-white/5 py-2.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 hover:border-red-500/20 transition-all flex items-center justify-center gap-1"
                            >
                                <XCircle size={13} />
                                <span className="hidden sm:inline">Reject</span>
                            </motion.button>

                            <AnimatePresence>
                                {showRejectMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-zinc-900/98 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-[60] shadow-2xl shadow-black/80"
                                    >
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
                                            Select Reason
                                        </p>
                                        <div className="relative mb-3">
                                            <select
                                                value={selectedReason}
                                                onChange={(e) => setSelectedReason(e.target.value)}
                                                className="w-full bg-zinc-800 border border-white/5 rounded-lg text-xs py-2.5 px-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                                            >
                                                {rejectionReasons.map((r) => (
                                                    <option key={r} value={r}>
                                                        {r}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                size={14}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                onReject(listing.id, selectedReason);
                                                setShowRejectMenu(false);
                                            }}
                                            className="w-full py-2.5 bg-red-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-red-600 transition-colors"
                                        >
                                            Confirm Rejection
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Flag */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onFlag(listing.id)}
                            className="bg-zinc-800/80 border border-white/5 py-2.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider hover:bg-pink-500/10 hover:border-pink-500/20 transition-all flex items-center justify-center gap-1"
                        >
                            <Flag size={13} />
                            <span className="hidden sm:inline">Flag</span>
                        </motion.button>
                    </div>
                )}

                {listing.status === "approved" && (
                    <div className="grid grid-cols-2 gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onViewDetail(listing)}
                            className="bg-zinc-800/80 border border-white/5 py-2.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 transition-all flex items-center justify-center gap-1"
                        >
                            <Eye size={13} />
                            <span>View</span>
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSuspend(listing.id)}
                            className="bg-zinc-800/80 border border-white/5 py-2.5 rounded-xl text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 transition-all flex items-center justify-center gap-1"
                        >
                            <Ban size={13} />
                            <span>Suspend</span>
                        </motion.button>
                    </div>
                )}

                {listing.status === "suspended" && (
                    <div className="flex gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onReviewAppeal(listing.id)}
                            className="flex-1 bg-zinc-800/80 border border-white/5 py-2.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 transition-all text-center"
                        >
                            Review Appeal
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(listing.id)}
                            className="p-2.5 bg-zinc-800/80 border border-white/5 rounded-xl text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0"
                        >
                            <Trash2 size={16} />
                        </motion.button>
                    </div>
                )}

                {listing.status === "audit" && (
                    <div className="flex gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onAudit(listing.id)}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-red-400 py-2.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-1"
                        >
                            <FileEdit size={13} />
                            <span>Audit</span>
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSkip(listing.id)}
                            className="bg-zinc-800/80 border border-white/5 py-2.5 px-4 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 transition-all flex items-center justify-center gap-1"
                        >
                            <SkipForward size={13} />
                            <span>Skip</span>
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
