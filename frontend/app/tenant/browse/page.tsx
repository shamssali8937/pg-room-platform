"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { mockBrowseListings, type TenantListing } from "@/components/tenant/mockData";
import TenantListingDetailModal from "@/components/tenant/TenantListingDetailModal";
import {
    MapPin, Bed, Bath, Star, Heart, ShieldCheck, Search,
    Home, SlidersHorizontal, Eye
} from "lucide-react";

const CITIES = ["All", "Lahore", "Islamabad", "Rawalpindi", "Karachi"];
const SORT_OPTIONS = ["Newest", "Price: Low to High", "Price: High to Low", "Rating"];

export default function TenantBrowse() {
    const { isDark, searchQuery } = useTenantTheme();
    const [selectedCity, setSelectedCity] = useState("All");
    const [sortBy, setSortBy] = useState("Newest");
    const [maxPrice, setMaxPrice] = useState(150000);
    const [showFilters, setShowFilters] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(
        new Set(mockBrowseListings.filter(l => l.isFavorited).map(l => l.id))
    );
    const [selectedListing, setSelectedListing] = useState<TenantListing | null>(null);

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-200";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const divider = isDark ? "border-white/[0.06]" : "border-slate-100";
    const chipActive = isDark
        ? "bg-[#a27cff]/20 text-[#a27cff] border-[#a27cff]/40"
        : "bg-violet-100 text-violet-700 border-violet-300";
    const chipInactive = isDark
        ? "bg-[#1a1919] text-[#adaaaa] border-[#484847]/20 hover:bg-white/5"
        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100";

    let filtered = mockBrowseListings.filter(l => {
        if (selectedCity !== "All" && l.city !== selectedCity) return false;
        if (l.price > maxPrice) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (
                !l.title.toLowerCase().includes(q) &&
                !l.city.toLowerCase().includes(q) &&
                !l.address.toLowerCase().includes(q)
            ) return false;
        }
        return true;
    });

    if (sortBy === "Price: Low to High") filtered = [...filtered].sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") filtered = [...filtered].sort((a, b) => b.price - a.price);
    else if (sortBy === "Rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-24 lg:pb-4">

            {/* ── Header ── */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-14 xl:pl-0">
                <div>
                    <p className="text-[#a27cff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">Find Your Perfect Room</p>
                    <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>Browse Listings</h2>
                    <p className={`text-sm mt-1 ${textVariant}`}>{filtered.length} properties available</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${showFilters
                            ? chipActive
                            : isDark
                                ? "border-[#484847]/30 text-[#adaaaa] hover:bg-white/5"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                >
                    <SlidersHorizontal size={16} />
                    Filters
                </button>
            </header>

            {/* ── Filters Panel ── */}
            <AnimatePresence>
                {showFilters && (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`rounded-2xl overflow-hidden ${surfaceLow}`}
                    >
                        <div className="p-6 space-y-5">
                            {/* City */}
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textVariant}`}>City</p>
                                <div className="flex flex-wrap gap-2">
                                    {CITIES.map(city => (
                                        <button
                                            key={city}
                                            onClick={() => setSelectedCity(city)}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedCity === city ? chipActive : chipInactive}`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textVariant}`}>
                                    Max Rent: <span className={textPrimary}>PKR {maxPrice.toLocaleString()}/mo</span>
                                </p>
                                <input
                                    type="range"
                                    min={20000}
                                    max={200000}
                                    step={5000}
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(Number(e.target.value))}
                                    className="w-full accent-[#a27cff] max-w-sm"
                                />
                            </div>

                            {/* Sort */}
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textVariant}`}>Sort By</p>
                                <div className="flex flex-wrap gap-2">
                                    {SORT_OPTIONS.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setSortBy(opt)}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${sortBy === opt ? chipActive : chipInactive}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* ── Listing Grid ── */}
            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <Search size={36} className={`mx-auto mb-4 ${textVariant}`} />
                    <p className={`font-bold text-lg ${textPrimary}`}>No listings found</p>
                    <p className={`text-sm mt-1 ${textVariant}`}>Try adjusting your filters</p>
                </div>
            ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((listing, idx) => (
                            <motion.article
                                key={listing.id}
                                layout
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.3, delay: idx * 0.04 }}
                                className={`group rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${surfaceHigh}`}
                            >
                                {/* ── Image with hover overlay (owner-style) ── */}
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <img
                                        src={listing.imageUrl}
                                        alt={listing.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {/* Hover overlay with buttons */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                        {/* Eye — view detail */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedListing(listing)}
                                            className="w-11 h-11 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-[0ms]"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </motion.button>

                                        {/* Heart — save */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleFavorite(listing.id)}
                                            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-[50ms] ${favorites.has(listing.id)
                                                    ? "bg-[#ff97b5] text-white"
                                                    : "bg-[#a27cff] text-white"
                                                }`}
                                            title={favorites.has(listing.id) ? "Unsave" : "Save"}
                                        >
                                            <Heart size={16} className={favorites.has(listing.id) ? "fill-white" : ""} />
                                        </motion.button>
                                    </div>

                                    {/* Badges */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                                        {listing.isVerified && (
                                            <span className="backdrop-blur-xl bg-black/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 border border-emerald-400/30">
                                                <ShieldCheck size={10} /> Verified
                                            </span>
                                        )}
                                        {listing.tags.slice(0, 1).map(tag => (
                                            <span key={tag} className="backdrop-blur-xl bg-black/40 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#a27cff] border border-[#a27cff]/30">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Card Content ── */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <h3 className={`text-base font-bold font-headline tracking-tight truncate ${textPrimary}`}>
                                                {listing.title}
                                            </h3>
                                            <p className={`text-xs flex items-center gap-1 mt-0.5 ${textVariant}`}>
                                                <MapPin size={11} /> {listing.city}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-sm text-[#a27cff]">
                                                PKR {listing.price.toLocaleString()}
                                            </p>
                                            <p className={`text-[10px] ${textVariant}`}>per month</p>
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {[
                                            { icon: <Bed size={14} />, val: `${listing.beds} Bed` },
                                            { icon: <Bath size={14} />, val: `${listing.baths} Bath` },
                                            { icon: <Home size={14} />, val: `${listing.sqft} ft²` },
                                        ].map((m, i) => (
                                            <div
                                                key={i}
                                                // added items-center and flex-row to ensure they stay in a line
                                                className={`flex items-center gap-1.5 p-2.5 rounded-xl ${surfaceLow}`}
                                            >
                                                <span className={textVariant}>{m.icon}</span>
                                                <span className={`text-xs font-bold whitespace-nowrap ${textPrimary}`}>
                                                    {m.val}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Rating + Owner */}
                                    <div className={`flex items-center justify-between pt-3 border-t ${divider}`}>
                                        <div className="flex items-center gap-1.5">
                                            <img src={listing.ownerAvatar} alt={listing.ownerName} className="w-6 h-6 rounded-full object-cover" />
                                            <span className={`text-xs ${textVariant}`}>{listing.ownerName}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star size={12} className="text-amber-400 fill-amber-400" />
                                            <span className={`text-xs font-bold ${textPrimary}`}>{listing.rating}</span>
                                            <span className={`text-xs ${textVariant}`}>({listing.reviews})</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* ── Detail Modal ── */}
            {selectedListing && (
                <TenantListingDetailModal
                    listing={selectedListing}
                    onClose={() => setSelectedListing(null)}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                />
            )}
        </div>
    );
}
