"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { mockOwnerListings, mockOwnerInquiries, type OwnerListing } from "@/components/owner/mockData";
import { Eye, Heart, MessageSquare, Gem, TrendingUp, MapPin, Bed, Bath, ArrowRight, Star, Plus, Search, Edit, Info } from "lucide-react";
import OwnerListingDetailModal from "@/components/owner/OwnerListingDetailModal";
import OwnerAddListingModal from "@/components/owner/OwnerAddListingModal";

export default function OwnerDashboard() {
    const { isDark, searchQuery } = useOwnerTheme();
    const [detailListing, setDetailListing] = useState<OwnerListing | null>(null);
    const [isAddListingOpen, setIsAddListingOpen] = useState(false);

    // Filter logic
    const filteredListings = mockOwnerListings.filter((l) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            l.title.toLowerCase().includes(q) || 
            l.location.toLowerCase().includes(q) || 
            l.id.toLowerCase().includes(q)
        );
    });

    // Theme mapped classes aligning with "Midnight Concierge" Admin styles
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-200";
    
    const hoverSurfaceHigh = isDark ? "hover:bg-[#201f1f]" : "hover:bg-slate-50";

    const ghostBorder = isDark ? "border border-[#484847]/15" : "border border-slate-200";

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 relative pb-24 lg:pb-0">
            {/* Welcome Header */}
            <header className="flex justify-between items-end mb-12 pl-14 xl:pl-0 transition-all">
                <div>
                    <p className="text-[#ba9eff] font-medium tracking-widest text-xs uppercase mb-2">Owner Dashboard</p>
                    <h2 className={`text-3xl md:text-4xl font-headline font-extrabold tracking-tight ${textPrimary}`}>
                        Good evening, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ae8dff] to-[#bfd1ff]">Zubair Khan</span>
                    </h2>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className={`text-xs ${textVariant}`}>Clifton, Karachi</span>
                        <span className={`font-semibold ${textPrimary}`}>10:45 PM</span>
                    </div>
                </div>
            </header>

            {/* Performance Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <div className={`p-6 rounded-xl transition-all group ${surfaceLow} ${hoverSurfaceHigh}`}>
                    <div className="flex justify-between items-start mb-4">
                        <Eye className="text-[#ae8dff]" />
                        <span className="text-[10px] text-[#ba9eff] bg-[#ba9eff]/10 px-2 py-0.5 rounded-full">+12%</span>
                    </div>
                    <p className={`text-xs font-medium uppercase tracking-tighter mb-1 ${textVariant}`}>Total Views</p>
                    <h3 className={`text-2xl font-headline font-bold ${textPrimary}`}>4,829</h3>
                </div>
                
                <div className={`p-6 rounded-xl transition-all ${surfaceLow} ${hoverSurfaceHigh}`}>
                    <div className="flex justify-between items-start mb-4">
                        <Heart className="text-[#ff97b5]" />
                        <span className="text-[10px] text-[#ff97b5] bg-[#ff97b5]/10 px-2 py-0.5 rounded-full">+5.4%</span>
                    </div>
                    <p className={`text-xs font-medium uppercase tracking-tighter mb-1 ${textVariant}`}>Saved by Tenants</p>
                    <h3 className={`text-2xl font-headline font-bold ${textPrimary}`}>342</h3>
                </div>

                <div className={`p-6 rounded-xl transition-all ${surfaceLow} ${hoverSurfaceHigh}`}>
                    <div className="flex justify-between items-start mb-4">
                        <MessageSquare className="text-[#699cff]" />
                        <span className="text-[10px] text-[#699cff] bg-[#699cff]/10 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <p className={`text-xs font-medium uppercase tracking-tighter mb-1 ${textVariant}`}>Active Inquiries</p>
                    <h3 className={`text-2xl font-headline font-bold ${textPrimary}`}>28</h3>
                </div>

                <div className={`p-6 rounded-xl bg-gradient-to-br from-[#39008c]/20 to-transparent ${ghostBorder} ${!isDark ? 'bg-violet-50 border-violet-200' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                        <Gem className="text-[#ba9eff]" />
                        <TrendingUp size={16} className="text-[#ae8dff]" />
                    </div>
                    <p className={`text-xs font-medium uppercase tracking-tighter mb-1 ${textVariant}`}>Current Points</p>
                    <h3 className={`text-2xl font-headline font-bold ${textPrimary}`}>450 <span className={`text-xs font-normal ${textVariant}`}>pts</span></h3>
                </div>
            </section>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Listings & Promotions */}
                <div className="lg:col-span-8 space-y-16">
                    {/* Property Status Section */}
                    <section>
                        <div className="flex justify-between items-center mb-8">
                            <h4 className={`text-xl font-headline font-bold ${textPrimary}`}>My Listings</h4>
                            <button className={`text-sm flex items-center gap-2 transition-colors ${textVariant} hover:${textPrimary}`}>
                                View All <ArrowRight size={16} />
                            </button>
                        </div>
                        
                        {filteredListings.length > 0 ? (
                            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredListings.map((listing) => (
                                        <motion.div 
                                            key={listing.id} 
                                            layout 
                                            initial={{ opacity: 0, scale: 0.95 }} 
                                            animate={{ opacity: 1, scale: 1 }} 
                                            exit={{ opacity: 0, scale: 0.95 }} 
                                            transition={{ duration: 0.3 }}
                                            className={`rounded-xl overflow-hidden group cursor-pointer transition-all shadow-sm ${isDark ? 'hover:shadow-[0_20px_50px_-20px_rgba(138,92,246,0.3)]' : 'hover:shadow-lg hover:border-violet-200'} ${surfaceHigh}`}
                                        >
                                            <div className="h-48 relative overflow-hidden">
                                                <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 backdrop-blur-[2px]">
                                                    <button 
                                                        onClick={() => setDetailListing(listing)}
                                                        className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-2xl hover:scale-105"
                                                    >
                                                        <Eye size={16} /> View Full Listing
                                                    </button>
                                                </div>

                                                <div className={`absolute top-4 right-4 backdrop-blur-xl px-3 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-widest z-20 ${isDark ? 'bg-[#262626]/60 border border-[#484847]/15' : 'bg-black/40 border border-white/20'}`}>
                                                    PKR {listing.price.toLocaleString()} {listing.priceUnit}
                                                </div>
                                                <div className="absolute bottom-4 left-4 flex gap-2 z-20">
                                                    {listing.status === 'Live' ? (
                                                        <span className="bg-[#ba9eff] px-3 py-1 rounded-lg text-[9px] font-bold text-[#39008c] uppercase">Live</span>
                                                    ) : (
                                                        <span className="bg-[#adaaaa] px-3 py-1 rounded-lg text-[9px] font-bold text-[#0e0e0e] uppercase">Pending Review</span>
                                                    )}
                                                    {listing.featured && (
                                                        <span className="bg-[#ff97b5] px-3 py-1 rounded-lg text-[9px] font-bold text-[#6a0934] uppercase">Featured</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`p-6 ${listing.status === 'Pending Review' ? 'opacity-80 group-hover:opacity-100 transition-opacity' : ''}`}>
                                                <h5 className={`text-lg font-headline font-bold mb-1 truncate pr-2 ${textPrimary}`}>{listing.title}</h5>
                                                <p className={`text-sm flex items-center gap-1 mb-4 ${textVariant}`}>
                                                    <MapPin size={16} /> {listing.location}
                                                </p>

                                                <div className="flex justify-between items-center mb-5">
                                                    <div className="flex gap-4">
                                                        <span className={`text-xs flex items-center gap-1 ${textVariant}`}><Bed size={16} /> {listing.beds}</span>
                                                        <span className={`text-xs flex items-center gap-1 ${textVariant}`}><Bath size={16} /> {listing.baths}</span>
                                                    </div>
                                                    <button className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                                                        listing.status === 'Live' 
                                                        ? isDark ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                                                        : isDark ? 'bg-white/5 text-[#adaaaa] hover:bg-white/10 border border-white/5' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                                    }`}>
                                                        {listing.status === 'Live' ? <><Edit size={14} /> Edit</> : <><Info size={14} /> Status</>}
                                                    </button>
                                                </div>

                                                {listing.status === 'Live' && (
                                                    <div className={`flex gap-2 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                                                        <button 
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${isDark ? 'bg-[#39008c]/20 text-[#ba9eff] border-[#ba9eff]/20 hover:bg-[#39008c]/40 hover:border-[#ba9eff]/50' : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'}`}
                                                        >
                                                            <TrendingUp size={14} /> Boost <span className="text-[9px] opacity-70 ml-0.5">(15)</span>
                                                        </button>
                                                        <button 
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${isDark ? 'bg-[#6a0934]/20 text-[#ff97b5] border-[#ff97b5]/20 hover:bg-[#6a0934]/40 hover:border-[#ff97b5]/50' : 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'}`}
                                                        >
                                                            <Star size={14} /> Feature <span className="text-[9px] opacity-70 ml-0.5">(40)</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`text-center py-16 rounded-xl border ${ghostBorder}`}>
                                <Search size={32} className={`mx-auto mb-4 ${textVariant}`} />
                                <h5 className={`text-lg font-bold mb-1 ${textPrimary}`}>No listings found</h5>
                                <p className={`text-sm ${textVariant}`}>We couldn't find anything matching "{searchQuery}"</p>
                            </motion.div>
                        )}
                    </section>

                    {/* Points & Wallet Section */}
                    <section className={`p-8 rounded-3xl overflow-hidden relative ${ghostBorder} ${isDark ? 'bg-gradient-to-br from-[#201f1f] to-[#0e0e0e]' : 'bg-gradient-to-br from-violet-50 to-white border-violet-100'}`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ba9eff]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-[#ba9eff]/20 rounded-2xl flex items-center justify-center">
                                    <Star className="text-[#ba9eff]" fill="currentColor" />
                                </div>
                                <div>
                                    <h4 className={`text-xl font-headline font-bold ${textPrimary}`}>Nexus Boost Program</h4>
                                    <p className={`text-sm ${textVariant}`}>Increase visibility and get tenants faster</p>
                                </div>
                                <div className="sm:ml-auto text-left sm:text-right mt-4 sm:mt-0">
                                    <p className={`text-xs uppercase tracking-widest ${textVariant}`}>Available Balance</p>
                                    <p className="text-2xl font-headline font-black text-[#ba9eff]">450 Points</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className={`flex items-center justify-between p-5 rounded-2xl transition-all border group ${isDark ? 'bg-[#2c2c2c]/40 hover:bg-[#2c2c2c] border-white/5' : 'bg-white hover:bg-violet-50 border-violet-100'}`}>
                                    <div className="text-left">
                                        <h6 className={`font-bold mb-0.5 ${textPrimary}`}>Boost Listing</h6>
                                        <p className={`text-[11px] ${textVariant}`}>Move listing to top of searches for 24h</p>
                                    </div>
                                    <div className="bg-[#ba9eff]/10 text-[#ae8dff] font-bold text-xs px-3 py-1.5 rounded-lg group-hover:bg-[#ba9eff] group-hover:text-white transition-colors">
                                        15 pts
                                    </div>
                                </button>
                                <button className={`flex items-center justify-between p-5 rounded-2xl transition-all border group ${isDark ? 'bg-[#2c2c2c]/40 hover:bg-[#2c2c2c] border-white/5' : 'bg-white hover:bg-pink-50 border-pink-100'}`}>
                                    <div className="text-left">
                                        <h6 className={`font-bold mb-0.5 ${textPrimary}`}>Featured Placement</h6>
                                        <p className={`text-[11px] ${textVariant}`}>Premium homepage banner for 3 days</p>
                                    </div>
                                    <div className="bg-[#ff97b5]/10 text-[#ff8eb0] font-bold text-xs px-3 py-1.5 rounded-lg group-hover:bg-[#ff97b5] group-hover:text-white transition-colors">
                                        40 pts
                                    </div>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Side: Recent Inquiries */}
                <aside className="lg:col-span-4">
                    <section className={`rounded-3xl p-6 h-full border-l ${surfaceLow}`}>
                        <div className="flex justify-between items-center mb-8">
                            <h4 className={`text-lg font-headline font-bold ${textPrimary}`}>Recent Inquiries</h4>
                            <span className="w-6 h-6 bg-[#ae8dff] text-[#2b006e] text-[10px] font-bold rounded-full flex items-center justify-center">05</span>
                        </div>
                        <div className="space-y-6">
                            {mockOwnerInquiries.map((inq) => (
                                <div key={inq.id} className="relative group cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border ${inq.status === 'New' ? 'border-[#ba9eff]/20' : 'border-white/5'}`}>
                                            <img src={inq.avatarUrl} alt={inq.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center mb-1">
                                                <h6 className={`text-sm font-bold ${textPrimary}`}>{inq.name}</h6>
                                                <span className={`text-[9px] uppercase ${textVariant}`}>{inq.timeAgo}</span>
                                            </div>
                                            <p className={`text-xs line-clamp-1 mb-2 ${textVariant}`}>{inq.message}</p>
                                            <div className="flex gap-2">
                                                {inq.status === 'New' ? (
                                                    <span className="bg-[#ba9eff]/20 text-[#ae8dff] text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">New</span>
                                                ) : (
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${isDark ? 'bg-white/5 text-[#adaaaa]' : 'bg-slate-100 text-slate-500'}`}>Replied</span>
                                                )}
                                                {inq.reference && (
                                                    <span className={`text-[9px] italic ${textVariant}`}>Ref: {inq.reference}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {inq.status === 'New' && (
                                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-[#ba9eff] rounded-full opacity-100"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className={`w-full mt-10 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isDark ? 'border-white/10 text-[#adaaaa] hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                            Go to Inbox
                        </button>
                    </section>
                </aside>
            </div>

            {/* Floating Action Button for New Listing */}
            <button onClick={() => setIsAddListingOpen(true)} className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 w-14 h-14 bg-gradient-to-tr from-violet-500 to-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(138,92,246,0.8)] hover:scale-110 active:scale-95 transition-all z-40 group">
                <Plus size={24} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Listing Detail Modal */}
            <OwnerListingDetailModal 
                listing={detailListing} 
                onClose={() => setDetailListing(null)} 
            />

            {/* Add New Listing Modal */}
            <OwnerAddListingModal 
                isOpen={isAddListingOpen} 
                onClose={() => setIsAddListingOpen(false)} 
            />
        </div>
    );
}
