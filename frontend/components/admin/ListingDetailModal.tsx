"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, MapPin, Users, BedDouble, Calendar, Shield, ShieldCheck, ShieldAlert,
    Clock, CheckCircle2, Ban, Flag, ChevronLeft, ChevronRight,
    Wifi, Wind, Car, Utensils, Waves, Dumbbell, Tv, Zap, Video, BookOpen, Coffee, Sparkles,
} from "lucide-react";
import { type ModerationListing, type ModerationStatus } from "./mockData";
import { useAdminTheme } from "@/context/AdminThemeContext";

const statusConfig: Record<ModerationStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
    pending: { label: "Pending Review", bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", dot: "bg-purple-400" },
    approved: { label: "Live & Active", bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
    suspended: { label: "Suspended", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-400" },
    audit: { label: "Audit Required", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-400" },
};

const amenityIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    WiFi: Wifi, AC: Wind, Parking: Car, Kitchen: Utensils, Pool: Waves, Gym: Dumbbell,
    CCTV: Video, "Power Backup": Zap, "Study Room": BookOpen, Breakfast: Coffee,
    Housekeeping: Sparkles, "Hot Water": Waves, Laundry: Wind, Terrace: Tv, Rooftop: Tv, Concierge: Shield,
};

const docStatusConfig = {
    verified: { icon: ShieldCheck, text: "text-emerald-400", bg: "bg-emerald-500/10", label: "Verified" },
    pending: { icon: Clock, text: "text-amber-400", bg: "bg-amber-500/10", label: "Pending" },
    failed: { icon: ShieldAlert, text: "text-red-400", bg: "bg-red-500/10", label: "Failed" },
};

interface ListingDetailModalProps {
    listing: ModerationListing | null;
    onClose: () => void;
    onApprove?: (id: string) => void;
    onSuspend?: (id: string) => void;
    onFlag?: (id: string) => void;
    onAudit?: (id: string) => void;
}

export default function ListingDetailModal({ listing, onClose, onApprove, onSuspend, onFlag, onAudit }: ListingDetailModalProps) {
    const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
    const { isDark } = useAdminTheme();

    if (!listing) return null;

    const status = statusConfig[listing.status];
    const gallery = listing.gallery || [listing.image];
    const formattedPrice = new Intl.NumberFormat("en-PK").format(listing.price);
    const prevImage = () => setActiveGalleryIdx((i) => (i === 0 ? gallery.length - 1 : i - 1));
    const nextImage = () => setActiveGalleryIdx((i) => (i === gallery.length - 1 ? 0 : i + 1));

    // Theme tokens
    const modalBg = isDark ? "bg-zinc-900 border-white/[0.08]" : "bg-white border-slate-200";
    const titleColor = isDark ? "text-white" : "text-slate-900";
    const locationColor = isDark ? "text-zinc-400" : "text-slate-500";
    const metaCardBg = isDark ? "bg-zinc-800/60 border-white/[0.04]" : "bg-slate-50 border-slate-200";
    const metaLabel = isDark ? "text-zinc-500" : "text-slate-500";
    const metaVal = isDark ? "text-white" : "text-slate-900";
    const metaIcon = isDark ? "text-zinc-400" : "text-slate-400";
    const descLabel = isDark ? "text-zinc-500" : "text-slate-500";
    const descText = isDark ? "text-zinc-300" : "text-slate-700";
    const hostBg = isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200";
    const hostName = isDark ? "text-white" : "text-slate-900";
    const hostDetail = isDark ? "text-zinc-500" : "text-slate-500";
    const submittedLabel = isDark ? "text-zinc-500" : "text-slate-500";
    const submittedVal = isDark ? "text-zinc-400" : "text-slate-600";
    const amenityChip = isDark ? "bg-zinc-800/60 border-white/[0.04] text-zinc-300" : "bg-slate-100 border-slate-200 text-slate-700";
    const docRowBg = isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200";
    const docName = isDark ? "text-zinc-300" : "text-slate-700";
    const actionsBorder = isDark ? "border-white/[0.04]" : "border-slate-200";
    const secActionBg = isDark ? "bg-zinc-800 border-white/5 text-white hover:bg-zinc-700" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200";
    const closeActionBg = isDark ? "bg-zinc-800 border-white/5 text-zinc-400 hover:bg-zinc-700" : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200";
    const suspendBtn = isDark ? "bg-zinc-800 border-white/5 text-red-400 hover:bg-red-500/10" : "bg-red-50 border-red-200 text-red-500 hover:bg-red-100";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-start justify-center overflow-y-auto py-6 px-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.92, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.92, y: 30, opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full max-w-3xl border rounded-3xl overflow-hidden shadow-2xl shadow-black/60 my-auto ${modalBg}`}
                >
                    {/* Gallery */}
                    <div className={`relative h-56 sm:h-72 md:h-80 overflow-hidden ${isDark ? "bg-zinc-800" : "bg-slate-200"}`}>
                        <AnimatePresence mode="wait">
                            <motion.img key={activeGalleryIdx} src={gallery[activeGalleryIdx]} alt={listing.title}
                                initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }} className="w-full h-full object-cover" />
                        </AnimatePresence>
                        {gallery.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"><ChevronLeft size={18} /></button>
                                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"><ChevronRight size={18} /></button>
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {gallery.map((_, i) => (
                                        <button key={i} onClick={() => setActiveGalleryIdx(i)} className={`h-2 rounded-full transition-all ${i === activeGalleryIdx ? "bg-white w-5" : "bg-white/40 w-2 hover:bg-white/60"}`} />
                                    ))}
                                </div>
                            </>
                        )}
                        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"><X size={18} /></button>
                        <span className="absolute top-4 left-4 bg-black/40 backdrop-blur-xl text-[10px] uppercase tracking-widest font-bold text-purple-300 px-3 py-1.5 rounded-full border border-white/10">#{listing.id}</span>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-8 space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-2 min-w-0">
                                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${titleColor}`} style={{ fontFamily: "Manrope, sans-serif" }}>{listing.title}</h2>
                                <div className={`flex items-center gap-2 text-sm ${locationColor}`}>
                                    <MapPin size={14} className="flex-shrink-0" /><span>{listing.location}</span>
                                </div>
                            </div>
                            <span className={`${status.bg} ${status.text} border ${status.border} text-[11px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full flex items-center gap-2 whitespace-nowrap self-start`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{status.label}
                            </span>
                        </div>

                        {/* Price + Meta Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: "Rent", content: <><p className="text-lg font-bold text-purple-500">{listing.currency} {formattedPrice}</p><p className={`text-[10px] uppercase ${metaLabel}`}>per month</p></> },
                                { label: "Room Type", content: <div className="flex items-center gap-2 mt-1"><BedDouble size={16} className={metaIcon} /><p className={`text-sm font-semibold ${metaVal}`}>{listing.roomType || "N/A"}</p></div> },
                                { label: "Capacity", content: <div className="flex items-center gap-2 mt-1"><Users size={16} className={metaIcon} /><p className={`text-sm font-semibold ${metaVal}`}>{listing.capacity || "—"} beds</p></div> },
                                { label: "Occupancy", content: <div className="mt-1"><p className={`text-sm font-semibold ${metaVal}`}>{listing.occupancy ?? "—"}%</p><div className={`w-full h-1.5 ${isDark ? "bg-zinc-700" : "bg-slate-200"} rounded-full mt-1.5`}><div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${listing.occupancy ?? 0}%` }} /></div></div> },
                            ].map(({ label, content }) => (
                                <div key={label} className={`rounded-xl p-4 border ${metaCardBg}`}>
                                    <p className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${metaLabel}`}>{label}</p>
                                    {content}
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        {listing.description && (
                            <div>
                                <h4 className={`text-xs uppercase tracking-widest font-semibold mb-2 ${descLabel}`}>Description</h4>
                                <p className={`text-sm leading-relaxed ${descText}`}>{listing.description}</p>
                            </div>
                        )}

                        {/* Host */}
                        <div className={`flex items-center gap-4 rounded-xl p-4 border ${hostBg}`}>
                            <img src={listing.host.avatar} alt={listing.host.name} className="w-11 h-11 rounded-full border-2 border-purple-500/20" />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${hostName}`}>{listing.host.name}</p>
                                <p className={`text-xs ${hostDetail}`}>{listing.host.badge} • {listing.host.detail}</p>
                            </div>
                            {listing.submittedAt && (
                                <div className="text-right hidden sm:block flex-shrink-0">
                                    <p className={`text-[10px] uppercase tracking-wider flex items-center gap-1 justify-end ${submittedLabel}`}><Calendar size={10} /> Submitted</p>
                                    <p className={`text-xs font-medium mt-0.5 ${submittedVal}`}>{listing.submittedAt}</p>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        {listing.amenities && listing.amenities.length > 0 && (
                            <div>
                                <h4 className={`text-xs uppercase tracking-widest font-semibold mb-3 ${descLabel}`}>Amenities</h4>
                                <div className="flex flex-wrap gap-2">
                                    {listing.amenities.map((a) => {
                                        const Icon = amenityIcons[a] || Shield;
                                        return (
                                            <span key={a} className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-medium ${amenityChip}`}>
                                                <Icon size={13} className="text-purple-500" />{a}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        {listing.documents && listing.documents.length > 0 && (
                            <div>
                                <h4 className={`text-xs uppercase tracking-widest font-semibold mb-3 ${descLabel}`}>Verification Documents</h4>
                                <div className="space-y-2">
                                    {listing.documents.map((doc) => {
                                        const cfg = docStatusConfig[doc.status];
                                        const DocIcon = cfg.icon;
                                        return (
                                            <div key={doc.name} className={`flex items-center justify-between border rounded-xl px-4 py-3 ${docRowBg}`}>
                                                <p className={`text-sm font-medium ${docName}`}>{doc.name}</p>
                                                <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${cfg.text} ${cfg.bg} px-2.5 py-1 rounded-lg`}>
                                                    <DocIcon size={13} />{cfg.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Alerts */}
                        {listing.flagReason && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <p className="text-red-400 text-sm font-semibold flex items-center gap-2"><ShieldAlert size={16} className="flex-shrink-0" />{listing.flagReason}</p>
                            </div>
                        )}
                        {listing.auditNote && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                <p className="text-amber-400 text-sm font-medium italic leading-relaxed">&ldquo;{listing.auditNote}&rdquo;</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className={`flex flex-col sm:flex-row gap-2 pt-2 border-t ${actionsBorder}`}>
                            {listing.status === "pending" && (
                                <>
                                    <button onClick={() => { onApprove?.(listing.id); onClose(); }} className="flex-1 py-3 bg-purple-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                        <CheckCircle2 size={15} /> Approve
                                    </button>
                                    <button onClick={() => { onFlag?.(listing.id); onClose(); }} className={`flex-1 py-3 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${secActionBg}`}>
                                        <Flag size={15} /> Flag for Audit
                                    </button>
                                </>
                            )}
                            {listing.status === "approved" && (
                                <button onClick={() => { onSuspend?.(listing.id); onClose(); }} className={`flex-1 py-3 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${suspendBtn}`}>
                                    <Ban size={15} /> Suspend Listing
                                </button>
                            )}
                            {listing.status === "audit" && (
                                <button onClick={() => { onAudit?.(listing.id); onClose(); }} className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-red-400 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                    <ShieldCheck size={15} /> Start Manual Audit
                                </button>
                            )}
                            <button onClick={onClose} className={`py-3 px-6 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${closeActionBg}`}>
                                <X size={15} /> Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
