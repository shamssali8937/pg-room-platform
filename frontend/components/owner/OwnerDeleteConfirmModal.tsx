"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { type OwnerListing } from "./mockData";

interface OwnerDeleteConfirmModalProps {
    listing: OwnerListing | null;
    onClose: () => void;
    onConfirm: (id: string) => void;
}

export default function OwnerDeleteConfirmModal({ listing, onClose, onConfirm }: OwnerDeleteConfirmModalProps) {
    const { isDark } = useOwnerTheme();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!listing) return null;

    const modalBg = isDark ? "bg-[#131313] border-white/[0.08]" : "bg-white border-slate-200";
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const closeBtnBg = isDark ? "bg-[#201f1f] border-white/5 text-zinc-400 hover:bg-[#2c2c2c]" : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200";

    const handleConfirm = () => {
        setIsDeleting(true);
        setTimeout(() => {
            onConfirm(listing.id);
            setIsDeleting(false);
            onClose();
        }, 800);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 320 }}
                    onClick={e => e.stopPropagation()}
                    className={`w-full max-w-md border rounded-3xl overflow-hidden shadow-2xl p-8 ${modalBg}`}
                >
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertTriangle size={28} className="text-red-500" />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="text-center mb-8">
                        <h3 className={`text-xl font-extrabold tracking-tight mb-2 ${textPrimary}`}>Delete Listing?</h3>
                        <p className={`text-sm leading-relaxed ${textVariant}`}>
                            You are about to permanently delete{" "}
                            <span className="font-bold text-red-400">"{listing.title}"</span>.
                            This action cannot be undone.
                        </p>
                        <div className={`mt-4 p-3 rounded-xl text-xs ${isDark ? "bg-red-500/5 border border-red-500/15 text-red-400" : "bg-red-50 border border-red-200 text-red-600"}`}>
                            All associated inquiries, views and stats will be permanently removed.
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className={`flex-1 py-3 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${closeBtnBg}`}
                        >
                            <X size={14} className="inline mr-1" /> Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {isDeleting ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Trash2 size={14} />
                            )}
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
