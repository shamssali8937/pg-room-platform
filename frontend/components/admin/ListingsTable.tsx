"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Eye, X } from "lucide-react";
import { mockListings, type Listing } from "./mockData";
import { useAdminTheme } from "@/context/AdminThemeContext";

interface ListingsTableProps {
    searchQuery: string;
}

export default function ListingsTable({ searchQuery }: ListingsTableProps) {
    const [listings, setListings] = useState<Listing[]>(mockListings);
    const [preview, setPreview] = useState<Listing | null>(null);
    const { isDark } = useAdminTheme();

    const filtered = listings.filter((l) => {
        if (l.status !== "pending") return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            l.title.toLowerCase().includes(q) ||
            l.owner.toLowerCase().includes(q) ||
            l.location.toLowerCase().includes(q) ||
            l.rent.toLowerCase().includes(q)
        );
    });

    const approve = (id: string) => {
        setListings((p) => p.map((l) => (l.id === id ? { ...l, status: "approved" as const } : l)));
        if (preview?.id === id) setPreview(null);
    };

    const reject = (id: string) => {
        setListings((p) => p.map((l) => (l.id === id ? { ...l, status: "rejected" as const } : l)));
        if (preview?.id === id) setPreview(null);
    };

    const tableBg = isDark ? "bg-zinc-900/60 border-white/[0.04]" : "bg-white border-slate-200 shadow-sm";
    const headRow = isDark ? "text-zinc-500 bg-zinc-900/80" : "text-slate-500 bg-slate-50";
    const divider = isDark ? "divide-white/[0.04]" : "divide-slate-100";
    const rowHover = isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50";
    const titleText = isDark ? "text-white" : "text-slate-900";
    const subText = isDark ? "text-zinc-500" : "text-slate-500";
    const locationText = isDark ? "text-zinc-400" : "text-slate-500";
    const rentText = isDark ? "text-white" : "text-slate-900";
    const emptyText = isDark ? "text-zinc-500" : "text-slate-400";
    const headingColor = isDark ? "text-white" : "text-slate-900";
    const modalBg = isDark ? "bg-zinc-900 border-white/[0.08]" : "bg-white border-slate-200";
    const modalTitle = isDark ? "text-white" : "text-slate-900";
    const modalSub = isDark ? "text-zinc-500" : "text-slate-500";
    const modalLabel = isDark ? "text-zinc-500" : "text-slate-500";
    const modalVal = isDark ? "text-white" : "text-slate-900";

    return (
        <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
                <h4 className={`text-xl font-bold tracking-tight ${headingColor}`}>Pending Listing Approvals</h4>
                <Link href="/admin/listings" className="text-purple-500 text-sm font-semibold hover:text-purple-400 hover:underline underline-offset-4 transition-all">View All</Link>
            </div>

            <div className={`rounded-xl overflow-hidden border ${tableBg}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className={`text-[11px] uppercase tracking-wider ${headRow}`}>
                                <th className="px-6 py-4 font-semibold">Property Title</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold">Rent</th>
                                <th className="px-6 py-4 font-semibold">Submitted</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${divider}`}>
                            <AnimatePresence mode="popLayout">
                                {filtered.length > 0 ? filtered.map((listing) => (
                                    <motion.tr key={listing.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className={`transition-colors ${rowHover}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}>
                                                    <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-semibold ${titleText}`}>{listing.title}</p>
                                                    <p className={`text-xs ${subText}`}>Owner: {listing.owner}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${locationText}`}>{listing.location}, {listing.country}</td>
                                        <td className={`px-6 py-4 text-sm font-medium ${rentText}`}>{listing.rent}</td>
                                        <td className={`px-6 py-4 text-xs ${subText}`}>{listing.submitted}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setPreview(listing)} className={`p-2 transition-colors ${isDark ? "text-zinc-500 hover:text-blue-400" : "text-slate-400 hover:text-blue-500"}`} title="Preview"><Eye size={16} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => approve(listing.id)} className={`p-2 transition-colors ${isDark ? "text-zinc-500 hover:text-green-400" : "text-slate-400 hover:text-green-500"}`} title="Approve"><CheckCircle2 size={18} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => reject(listing.id)} className={`p-2 transition-colors ${isDark ? "text-zinc-500 hover:text-red-400" : "text-slate-400 hover:text-red-500"}`} title="Reject"><XCircle size={18} /></motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <td colSpan={5} className={`px-6 py-12 text-center text-sm ${emptyText}`}>
                                            {searchQuery ? `No listings matching "${searchQuery}"` : "All listings reviewed! 🎉"}
                                        </td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {preview && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setPreview(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className={`border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto ${modalBg}`}>
                            <div className="relative h-48 overflow-hidden">
                                <img src={preview.image} alt={preview.title} className="w-full h-full object-cover" />
                                <button onClick={() => setPreview(null)} className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"><X size={16} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className={`text-lg font-bold ${modalTitle}`}>{preview.title}</h3>
                                    <p className={`text-sm ${modalSub}`}>by {preview.owner}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className={`text-xs uppercase tracking-wider mb-1 ${modalLabel}`}>Location</p><p className={`font-medium ${modalVal}`}>{preview.location}, {preview.country}</p></div>
                                    <div><p className={`text-xs uppercase tracking-wider mb-1 ${modalLabel}`}>Rent</p><p className={`font-medium ${modalVal}`}>{preview.rent}</p></div>
                                    <div><p className={`text-xs uppercase tracking-wider mb-1 ${modalLabel}`}>Submitted</p><p className={`font-medium ${modalVal}`}>{preview.submitted}</p></div>
                                    <div><p className={`text-xs uppercase tracking-wider mb-1 ${modalLabel}`}>Status</p><p className="text-yellow-500 font-medium capitalize">{preview.status}</p></div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => approve(preview.id)} className="flex-1 py-2.5 bg-green-500/10 text-green-500 rounded-lg text-sm font-semibold hover:bg-green-500/20 transition-colors">Approve</button>
                                    <button onClick={() => reject(preview.id)} className="flex-1 py-2.5 bg-red-500/10 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-500/20 transition-colors">Reject</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}