"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { mockWalletTransactions } from "@/components/owner/mockData";
import {
    TrendingUp, ArrowUpRight, ArrowDownRight, Rocket, BadgeCheck,
    Megaphone, ArrowRight, ChevronDown
} from "lucide-react";

const CURRENT_BALANCE = 24850;

const promoCards = [
    {
        icon: <Rocket size={20} />,
        iconBgDark: "bg-violet-500/10",
        iconBgLight: "bg-violet-50",
        iconColor: "text-violet-400",
        title: "Premium Boost",
        desc: "List your top property at the header of search results for 7 days.",
        pts: 500,
        hoverGrad: "from-violet-500/15 to-blue-500/15",
        activateBgDark: "hover:bg-violet-400",
        activateBgLight: "hover:bg-violet-500",
    },
    {
        icon: <BadgeCheck size={20} />,
        iconBgDark: "bg-blue-500/10",
        iconBgLight: "bg-blue-50",
        iconColor: "text-blue-400",
        title: "Elite Certification",
        desc: "Add a prestigious 'Quality Verified' badge to your owner profile for 1 month.",
        pts: 1250,
        hoverGrad: "from-blue-500/15 to-emerald-500/15",
        activateBgDark: "hover:bg-blue-400",
        activateBgLight: "hover:bg-blue-500",
    },
    {
        icon: <Megaphone size={20} />,
        iconBgDark: "bg-[#ff97b5]/10",
        iconBgLight: "bg-pink-50",
        iconColor: "text-[#ff97b5]",
        title: "Newsletter Feature",
        desc: "Inclusion in the weekly 'Curator's Choice' email sent to 15k active seekers.",
        pts: 820,
        hoverGrad: "from-[#ff97b5]/15 to-[#ba9eff]/15",
        activateBgDark: "hover:bg-[#ff97b5]",
        activateBgLight: "hover:bg-pink-400",
    },
];

export default function OwnerWalletPage() {
    const { isDark } = useOwnerTheme();
    const [historyFilter, setHistoryFilter] = useState<"All" | "Earned" | "Spent">("All");
    const [showAll, setShowAll] = useState(false);

    const filtered = mockWalletTransactions.filter(t =>
        historyFilter === "All" ? true : t.type === historyFilter
    );
    const displayed = showAll ? filtered : filtered.slice(0, 4);

    // Theme tokens
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-100";
    const tabActive = isDark
        ? "bg-[#ba9eff]/15 text-[#ba9eff] border border-[#ba9eff]/20"
        : "bg-violet-100 text-violet-700 border border-violet-200";
    const tabInactive = isDark
        ? "text-[#adaaaa] hover:text-white hover:bg-white/5 border border-transparent"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent";

    const statusBadge = {
        Completed: isDark ? "bg-emerald-400/10 text-emerald-400" : "bg-emerald-50 text-emerald-700",
        Active: isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-700",
        Expired: isDark ? "bg-zinc-800 text-zinc-500" : "bg-slate-100 text-slate-500",
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 relative pb-24 lg:pb-10 pl-14 xl:pl-0">

            {/* Hero: Balance */}
            <section className="relative">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#ba9eff]/8 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative">
                    <p className={`text-xs font-bold uppercase tracking-[0.3em] mb-3 ${textVariant}`}>Current Reserve</p>
                    <div className="flex items-end gap-5 flex-wrap">
                        <span className="font-display font-black text-[5rem] sm:text-[7rem] leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">
                            {CURRENT_BALANCE.toLocaleString()}
                        </span>
                        <div className="pb-4">
                            <span className={`text-2xl font-headline font-bold ${textVariant}`}>PTS</span>
                            <div className="flex items-center gap-1.5 mt-2 text-[#a27cff] font-semibold text-sm">
                                <TrendingUp size={16} />
                                <span>+12% this month</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Promo Cards */}
            <section>
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
                    <div>
                        <h3 className={`text-2xl md:text-3xl font-display font-bold tracking-tight mb-1 ${textPrimary}`}>Accelerate Exposure</h3>
                        <p className={`text-sm ${textVariant}`}>Utilize your curator points to enhance visibility.</p>
                    </div>
                    <button className={`flex items-center gap-1.5 text-[#ae8dff] font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all`}>
                        View All Rewards <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {promoCards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`group relative overflow-hidden rounded-2xl p-0.5 transition-all duration-500 hover:scale-[1.02] ${isDark ? "bg-[#201f1f]" : "bg-slate-100"}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.hoverGrad} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`} />
                            <div className={`relative rounded-[14px] p-7 h-full flex flex-col ${surfaceHigh}`}>
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${isDark ? card.iconBgDark : card.iconBgLight}`}>
                                    <span className={card.iconColor}>{card.icon}</span>
                                </div>
                                <h4 className={`font-headline text-lg font-bold mb-2 ${textPrimary}`}>{card.title}</h4>
                                <p className={`text-sm flex-grow leading-relaxed mb-7 ${textVariant}`}>{card.desc}</p>
                                <div className="flex justify-between items-center">
                                    <span className={`font-display font-bold text-base ${textPrimary}`}>{card.pts.toLocaleString()} PTS</span>
                                    <button className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-colors ${isDark ? "bg-white text-[#0e0e0e]" : "bg-slate-900 text-white"} ${isDark ? card.activateBgDark : card.activateBgLight} hover:text-white`}>
                                        Activate
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Transaction History */}
            <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className={`text-xl font-display font-bold tracking-tight ${textPrimary}`}>Usage History</h3>
                    <div className="flex gap-2 flex-wrap">
                        {(["All", "Earned", "Spent"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setHistoryFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${historyFilter === f ? tabActive : tabInactive}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                    {/* Table Header */}
                    <div className={`hidden md:grid grid-cols-5 px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold ${textVariant} ${isDark ? "bg-[#201f1f]/50" : "bg-slate-50"}`}>
                        <span>Date</span>
                        <span className="col-span-2">Action / Promotion</span>
                        <span>Status</span>
                        <span className="text-right">Amount</span>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {displayed.map((tx, i) => (
                            <motion.div
                                key={tx.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ delay: i * 0.05 }}
                                className={`grid grid-cols-2 md:grid-cols-5 items-center px-6 py-5 transition-colors ${i < displayed.length - 1 ? isDark ? "border-b border-white/5" : "border-b border-slate-100" : ""} ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}
                            >
                                <span className={`text-sm col-span-1 ${textVariant}`}>{tx.date}</span>

                                <div className="col-span-1 md:col-span-2 pl-2 md:pl-0">
                                    <p className={`text-sm font-bold ${textPrimary}`}>{tx.action}</p>
                                    <p className={`text-xs ${textVariant}`}>{tx.sub}</p>
                                </div>

                                <div className="hidden md:flex items-center gap-2">
                                    <span className={`flex items-center gap-1.5 ${tx.type === "Earned" ? "text-emerald-400" : "text-[#ff97b5]"}`}>
                                        {tx.type === "Earned"
                                            ? <ArrowUpRight size={14} />
                                            : <ArrowDownRight size={14} />}
                                        <span className="text-xs font-bold">{tx.type}</span>
                                    </span>
                                </div>

                                <div className="hidden md:flex items-center gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest ${statusBadge[tx.status]}`}>
                                        {tx.status}
                                    </span>
                                </div>

                                <span className={`text-right font-display font-bold text-base ${tx.amount > 0 ? "text-emerald-400" : "text-[#ff97b5]"}`}>
                                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Load More */}
                    {filtered.length > 4 && (
                        <div className={`px-6 py-4 text-center ${isDark ? "bg-[#201f1f]/30" : "bg-slate-50"}`}>
                            <button
                                onClick={() => setShowAll(prev => !prev)}
                                className={`flex items-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest transition-colors ${textVariant} hover:text-[#ba9eff]`}
                            >
                                {showAll ? "Show Less" : "Load More Transactions"}
                                <ChevronDown size={14} className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
