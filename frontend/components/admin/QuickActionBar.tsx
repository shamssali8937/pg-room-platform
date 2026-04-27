"use client";

import { motion } from "framer-motion";
import { UserPlus, Mail, History, Shield } from "lucide-react";

export default function QuickActionBar() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="fixed bottom-10 left-[calc(280px+50%)] -translate-x-1/2 flex items-center gap-1 p-1.5 bg-zinc-800/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl z-50"
        >
            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-500 text-white font-bold text-sm hover:brightness-110 transition-all" style={{ fontFamily: "Manrope, sans-serif" }}>
                <UserPlus size={16} />
                Create User
            </button>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors" title="Bulk Email">
                <Mail size={18} />
            </button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors" title="Activity Log">
                <History size={18} />
            </button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors" title="Security">
                <Shield size={18} />
            </button>
        </motion.div>
    );
}
