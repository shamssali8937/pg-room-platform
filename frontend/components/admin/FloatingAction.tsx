"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, FileText, AlertCircle, Send } from "lucide-react";
import { useAdminTheme } from "@/context/AdminThemeContext";

export default function FloatingAction() {
    const [open, setOpen] = useState(false);
    const { isDark } = useAdminTheme();

    const modalBg = isDark
        ? "bg-zinc-900 border-white/[0.08]"
        : "bg-white border-slate-200 shadow-2xl";
    const labelColor = isDark ? "text-zinc-400" : "text-slate-500";
    const inputClass = isDark
        ? "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-600 focus:ring-purple-500/60"
        : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-purple-400/50";
    const titleColor = isDark ? "text-white" : "text-slate-900";
    const subColor = isDark ? "text-zinc-500" : "text-slate-500";
    const closeBtn = isDark ? "text-zinc-500 hover:text-white" : "text-slate-400 hover:text-slate-900";

    return (
        <>
            {/* FAB Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-4 sm:bottom-10 sm:right-10 flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-[0_15px_40px_rgba(139,92,246,0.3)] z-40 group"
            >
                <Plus size={18} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Manual Review</span>
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`border rounded-2xl w-full max-w-lg p-6 ${modalBg}`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${titleColor}`}>Manual Review</h3>
                                        <p className={`text-xs ${subColor}`}>Submit a listing for manual inspection</p>
                                    </div>
                                </div>
                                <button onClick={() => setOpen(false)} className={`transition-colors ${closeBtn}`}>
                                    <X size={18} />
                                </button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    alert("Review submitted! (Mock — will connect to backend)");
                                    setOpen(false);
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${labelColor}`}>Listing ID</label>
                                    <input type="text" placeholder="e.g. LST-001" className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all ${inputClass}`} required />
                                </div>
                                <div>
                                    <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${labelColor}`}>Reason</label>
                                    <select className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all ${inputClass}`}>
                                        <option value="suspicious">Suspicious Activity</option>
                                        <option value="duplicate">Duplicate Listing</option>
                                        <option value="pricing">Price Manipulation</option>
                                        <option value="content">Inappropriate Content</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${labelColor}`}>Notes</label>
                                    <textarea rows={3} placeholder="Additional details..." className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all resize-none ${inputClass}`} />
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                                    <AlertCircle size={14} className="text-yellow-400 flex-shrink-0" />
                                    <p className="text-[11px] text-yellow-400/80">This will flag the listing and notify the owner.</p>
                                </div>

                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                    <Send size={14} />
                                    Submit for Review
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}