"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, MapPin, Bed, Bath, Star, ShieldCheck, ChevronLeft, ChevronRight,
    Wifi, Wind, Car, Dumbbell, Video, Zap, Shield, MessageSquare, Heart,
    Home, Maximize
} from "lucide-react";
import { type TenantListing } from "./mockData";
import { useTenantTheme } from "@/context/TenantThemeContext";

const amenityIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    WiFi: Wifi,
    AC: Wind,
    Parking: Car,
    Gym: Dumbbell,
    CCTV: Video,
    Generator: Zap,
    Security: Shield,
    Laundry: Wind,
    Elevator: Home,
    Rooftop: Home,
    Concierge: Shield,
    Pool: Home,
    Cinema: Home,
    Garden: Home,
};

interface Props {
    listing: TenantListing | null;
    onClose: () => void;
    favorites: Set<string>;
    onToggleFavorite: (id: string) => void;
}

export default function TenantListingDetailModal({ listing, onClose, favorites, onToggleFavorite }: Props) {
    const { isDark } = useTenantTheme();
    const [galleryIdx, setGalleryIdx] = useState(0);

    if (!listing) return null;

    // Build a simple gallery from the single image (extend later with real gallery array)
    const gallery = [listing.imageUrl];
    const prevImage = () => setGalleryIdx((i) => (i === 0 ? gallery.length - 1 : i - 1));
    const nextImage = () => setGalleryIdx((i) => (i === gallery.length - 1 ? 0 : i + 1));
    const isFav = favorites.has(listing.id);

    // Theme tokens — matching the owner modal style
    const modalBg = isDark ? "bg-[#131313] border-white/[0.08]" : "bg-white border-slate-200";
    const titleColor = isDark ? "text-white" : "text-slate-900";
    const locationColor = isDark ? "text-zinc-400" : "text-slate-500";
    const metaCardBg = isDark ? "bg-[#201f1f] border-white/[0.04]" : "bg-slate-50 border-slate-200";
    const metaLabel = isDark ? "text-zinc-500" : "text-slate-500";
    const metaVal = isDark ? "text-white" : "text-slate-900";
    const descText = isDark ? "text-zinc-300" : "text-slate-700";
    const amenityChip = isDark ? "bg-[#201f1f] border-white/[0.04] text-zinc-300" : "bg-slate-100 border-slate-200 text-slate-700";
    const actionsBorder = isDark ? "border-white/[0.04]" : "border-slate-200";
    const secActionBg = isDark
        ? "bg-[#a27cff]/10 border border-[#a27cff]/20 text-[#a27cff] hover:bg-[#a27cff]/20"
        : "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100";
    const closeActionBg = isDark
        ? "bg-[#201f1f] border-white/5 text-zinc-400 hover:bg-[#2c2c2c]"
        : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200";

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
                            <motion.img
                                key={galleryIdx}
                                src={gallery[galleryIdx]}
                                alt={listing.title}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>

                        {gallery.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                                    <ChevronLeft size={18} />
                                </button>
                                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {gallery.map((_, i) => (
                                        <button key={i} onClick={() => setGalleryIdx(i)} className={`h-2 rounded-full transition-all ${i === galleryIdx ? "bg-white w-5" : "bg-white/40 w-2 hover:bg-white/60"}`} />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Close */}
                        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                            <X size={18} />
                        </button>

                        {/* Verified badge */}
                        {listing.isVerified && (
                            <span className="absolute top-4 left-4 bg-black/40 backdrop-blur-xl text-[10px] uppercase tracking-widest font-bold text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                                <ShieldCheck size={11} /> Verified
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-8 space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-1.5 min-w-0">
                                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${titleColor}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                                    {listing.title}
                                </h2>
                                <div className={`flex items-center gap-2 text-sm ${locationColor}`}>
                                    <MapPin size={14} className="flex-shrink-0" />
                                    <span>{listing.address}, {listing.city}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                                <p className="text-2xl font-bold text-[#a27cff]">
                                    PKR {listing.price.toLocaleString()}
                                    <span className={`text-sm font-normal ${locationColor}`}>/mo</span>
                                </p>
                                <div className={`flex items-center gap-1.5 text-sm ${locationColor}`}>
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span className="font-bold">{listing.rating}</span>
                                    <span>({listing.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: "Beds", content: <div className="flex items-center gap-2 mt-1"><Bed size={16} className={metaLabel} /><p className={`text-sm font-semibold ${metaVal}`}>{listing.beds} Bed{listing.beds > 1 ? "s" : ""}</p></div> },
                                { label: "Baths", content: <div className="flex items-center gap-2 mt-1"><Bath size={16} className={metaLabel} /><p className={`text-sm font-semibold ${metaVal}`}>{listing.baths} Bath{listing.baths > 1 ? "s" : ""}</p></div> },
                                { label: "Area", content: <div className="flex items-center gap-2 mt-1"><Maximize size={16} className={metaLabel} /><p className={`text-sm font-semibold ${metaVal}`}>{listing.sqft} sqft</p></div> },
                                { label: "Posted", content: <p className={`text-sm font-semibold mt-1 ${metaVal}`}>{listing.postedDaysAgo === 0 ? "Today" : `${listing.postedDaysAgo}d ago`}</p> },
                            ].map(({ label, content }) => (
                                <div key={label} className={`rounded-xl p-4 border ${metaCardBg}`}>
                                    <p className={`text-[10px] uppercase tracking-widest font-semibold mb-0.5 ${metaLabel}`}>{label}</p>
                                    {content}
                                </div>
                            ))}
                        </div>

                        {/* Tags */}
                        {listing.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {listing.tags.map(tag => (
                                    <span key={tag} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isDark ? "bg-[#a27cff]/10 text-[#a27cff] border-[#a27cff]/20" : "bg-violet-50 text-violet-700 border-violet-200"}`}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h4 className={`text-xs uppercase tracking-widest font-semibold mb-2 ${metaLabel}`}>Description</h4>
                            <p className={`text-sm leading-relaxed ${descText}`}>{listing.description}</p>
                        </div>

                        {/* Amenities */}
                        {listing.amenities.length > 0 && (
                            <div>
                                <h4 className={`text-xs uppercase tracking-widest font-semibold mb-3 ${metaLabel}`}>Amenities</h4>
                                <div className="flex flex-wrap gap-2">
                                    {listing.amenities.map((a) => {
                                        const Icon = amenityIcons[a] || Shield;
                                        return (
                                            <span key={a} className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-medium ${amenityChip}`}>
                                                <Icon size={13} className="text-[#a27cff]" />{a}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Owner */}
                        <div className={`flex items-center gap-3 p-4 rounded-xl border ${metaCardBg}`}>
                            <img src={listing.ownerAvatar} alt={listing.ownerName} className="w-10 h-10 rounded-xl object-cover" />
                            <div className="flex-1">
                                <p className={`text-sm font-bold ${titleColor}`}>{listing.ownerName}</p>
                                <p className={`text-xs ${locationColor}`}>Property Owner · Posted {listing.postedDaysAgo === 0 ? "today" : `${listing.postedDaysAgo} days ago`}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={`flex flex-col sm:flex-row gap-2 pt-2 border-t ${actionsBorder}`}>
                            <button className="flex-1 py-3 bg-gradient-to-r from-[#a27cff] to-[#6e3bd7] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                <MessageSquare size={15} /> Send Inquiry
                            </button>
                            <button
                                onClick={() => onToggleFavorite(listing.id)}
                                className={`flex-1 py-3 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${secActionBg}`}
                            >
                                <Heart size={15} className={isFav ? "fill-current" : ""} />
                                {isFav ? "Saved" : "Save Listing"}
                            </button>
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
