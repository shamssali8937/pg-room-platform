"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AlertModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
    title?: string;
    isDark?: boolean;
}

export default function AlertModal({ isOpen, message, onClose, title = "Notification", isDark = true }: AlertModalProps) {
    const textSecondary = isDark ? "text-zinc-400" : "text-slate-500";
    
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full max-w-md border rounded-2xl p-6 ${
                            isDark ? "bg-[#131313] border-white/[0.08]" : "bg-white border-slate-200 shadow-2xl"
                        }`}
                    >
                        <h3 className="text-lg font-bold mb-4 text-red-400">{title}</h3>
                        <p className={`text-sm mb-6 leading-relaxed ${textSecondary}`}>{message}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold uppercase cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition-all"
                            >
                                OK
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
