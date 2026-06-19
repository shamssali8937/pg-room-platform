"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTenantPoints, fetchTenantPointTransactions } from "@/store/slices/tenantSlice";
import { useAuth } from "@/context/AuthContext";
import {
    Gem, TrendingUp, ArrowUpRight, ArrowDownRight, Award, ShieldAlert,
    BookOpen, Heart, MessageSquare, ShieldCheck, ChevronDown, CheckCircle2
} from "lucide-react";

export default function TenantPointsPage() {
    const { isDark, searchQuery } = useTenantTheme();
    const dispatch = useAppDispatch();
    const { points, pointTransactions, isLoading } = useAppSelector((s) => s.tenant);
    const { user } = useAuth();

    const [historyFilter, setHistoryFilter] = useState<"All" | "EARNED" | "SPENT">("All");
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        dispatch(fetchTenantPoints());
        dispatch(fetchTenantPointTransactions());
    }, [dispatch]);

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-100";
    const tabActive = isDark ? "bg-[#a27cff]/15 text-[#a27cff] border border-[#a27cff]/20" : "bg-violet-100 text-violet-700 border border-violet-200";
    const tabInactive = isDark ? "text-[#adaaaa] hover:text-white hover:bg-white/5 border border-transparent" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent";

    // Determine Tier based on points
    const currentTier = useMemo(() => {
        if (points >= 5000) return { name: "Gold", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
        if (points >= 1500) return { name: "Silver", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" };
        return { name: "Bronze", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" };
    }, [points]);

    // Calculate filter and search transactions
    const filteredTransactions = useMemo(() => {
        let result = historyFilter === "All"
            ? pointTransactions
            : pointTransactions.filter((t) => t.type === historyFilter);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (t) =>
                    t.description?.toLowerCase().includes(q) ||
                    t.type?.toLowerCase().includes(q) ||
                    String(t.amount).includes(q)
            );
        }
        return result;
    }, [pointTransactions, historyFilter, searchQuery]);

    const displayedTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 4);

    const totalEarned = pointTransactions.filter((t) => t.type === "EARNED").reduce((a, t) => a + t.amount, 0);
    const totalSpent = Math.abs(pointTransactions.filter((t) => t.type === "SPENT").reduce((a, t) => a + t.amount, 0));

    const tierProgress = useMemo(() => {
        if (points >= 5000) return 100;
        if (points >= 1500) return ((points - 1500) / 3500) * 100;
        return (points / 1500) * 100;
    }, [points]);

    const nextTierText = useMemo(() => {
        if (points >= 5000) return "You have reached the highest Gold Tier! 🏆";
        if (points >= 1500) return `${(5000 - points).toLocaleString()} PTS needed for Gold Tier`;
        return `${(1500 - points).toLocaleString()} PTS needed for Silver Tier`;
    }, [points]);

    const earnCards = [
        {
            icon: <Heart size={20} className="text-[#ff97b5]" />,
            title: "Save Room Listings",
            desc: "Earn points simply by bookmarking rooms that interest you.",
            reward: "2 PTS / save"
        },
        {
            icon: <Award size={20} className="text-violet-400" />,
            title: "Complete Stay Bookings",
            desc: "Points are rewarded upon checking out from approved stays.",
            reward: "100 PTS / stay"
        },
        {
            icon: <MessageSquare size={20} className="text-[#699cff]" />,
            title: "Leave Stay Reviews",
            desc: "Help others by writing detailed reviews about your stays.",
            reward: "25 PTS / review"
        },
        {
            icon: <ShieldCheck size={20} className="text-emerald-400" />,
            title: "Identity Document Upload",
            desc: "Gain instant credibility and reward points by completing CNIC verification.",
            reward: "50 PTS once"
        }
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 relative pb-24 lg:pb-10">
            {/* Header */}
            <header className="flex flex-col justify-between items-start gap-4">
                <div>
                    <p className="text-[#a27cff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">My Points & Tier</p>
                    <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>Reward Points</h2>
                    <p className={`text-sm mt-1 ${textVariant}`}>Earn rewards by renting, saving properties, and leaving reviews.</p>
                </div>
            </header>

            {/* Points Hero section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className={`lg:col-span-7 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between ${surfaceLow}`}>
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#a27cff]/5 rounded-full blur-[80px] pointer-events-none" />
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-[0.35em] mb-4 ${textVariant}`}>Curator Balance</p>
                        <div className="flex items-baseline gap-4 flex-wrap">
                            <span className="font-display font-black text-6xl sm:text-7xl leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#a27cff] to-amber-400">
                                {points.toLocaleString()}
                            </span>
                            <div>
                                <span className={`text-xl font-bold uppercase ${textVariant}`}>PTS</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-8 space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className={currentTier.color + " px-2.5 py-0.5 rounded-full border text-[10px]"}>
                                    {currentTier.name} Tier
                                </span>
                                <span className={textVariant}>{nextTierText}</span>
                            </div>
                            <div className={`w-full h-3 rounded-full relative ${isDark ? "bg-[#262626]" : "bg-slate-200"}`}>
                                <div
                                    className="h-full bg-gradient-to-r from-[#a27cff] to-amber-400 rounded-full transition-all duration-1000"
                                    style={{ width: `${tierProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-white/[0.04]">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                            <ArrowUpRight size={18} />
                            <span>+{totalEarned.toLocaleString()} earned</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#ff97b5] font-semibold text-sm">
                            <ArrowDownRight size={18} />
                            <span>-{totalSpent.toLocaleString()} spent</span>
                        </div>
                    </div>
                </div>

                {/* Tier Benefits */}
                <div className={`lg:col-span-5 p-8 rounded-2xl ${surfaceLow} flex flex-col justify-between`}>
                    <div>
                        <h3 className={`text-lg font-headline font-extrabold mb-4 ${textPrimary}`}>Tier Benefits</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="text-orange-400 mt-1">🥉</span>
                                <div>
                                    <p className={`text-sm font-bold ${textPrimary}`}>Bronze Tier (&lt; 1.5k PTS)</p>
                                    <p className={`text-xs ${textVariant}`}>Standard PG booking access and reviews.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-zinc-400 mt-1">🥈</span>
                                <div>
                                    <p className={`text-sm font-bold ${textPrimary}`}>Silver Tier (1.5k - 5k PTS)</p>
                                    <p className={`text-xs ${textVariant}`}>5% platform booking service fee discount, priority support.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">🥇</span>
                                <div>
                                    <p className={`text-sm font-bold ${textPrimary}`}>Gold Tier (5k+ PTS)</p>
                                    <p className={`text-xs ${textVariant}`}>10% booking service fee discount, VIP support channel, waiver on security processing fee.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Earn Points */}
            <section className="space-y-6">
                <div>
                    <h3 className={`text-xl font-headline font-extrabold ${textPrimary}`}>How to Earn Points</h3>
                    <p className={`text-sm ${textVariant}`}>Take key actions on the platform to continuously increase your balance.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {earnCards.map((card, i) => (
                        <div key={i} className={`p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 ${surfaceLow}`}>
                            <div>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isDark ? "bg-[#1c1c1c]" : "bg-slate-100"}`}>
                                    {card.icon}
                                </div>
                                <h4 className={`text-sm font-bold mb-1.5 ${textPrimary}`}>{card.title}</h4>
                                <p className={`text-xs leading-relaxed mb-4 ${textVariant}`}>{card.desc}</p>
                            </div>
                            <span className="text-xs font-black text-[#a27cff] font-headline">{card.reward}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Usage History */}
            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className={`text-xl font-headline font-extrabold ${textPrimary}`}>Points History</h3>
                        <p className={`text-sm ${textVariant}`}>A record of all your earnings and spendings.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(["All", "EARNED", "SPENT"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setHistoryFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${historyFilter === f ? tabActive : tabInactive}`}
                            >
                                {f === "EARNED" ? "Earned" : f === "SPENT" ? "Spent" : f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                    {/* Header */}
                    <div className={`hidden md:grid grid-cols-4 px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold ${textVariant} ${isDark ? "bg-[#201f1f]/50" : "bg-slate-50"}`}>
                        <span>Date</span>
                        <span className="col-span-2">Description</span>
                        <span className="text-right">Amount</span>
                    </div>

                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`h-14 rounded-xl animate-pulse ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`} />
                            ))}
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">
                            <Gem size={28} className="mx-auto mb-2 opacity-40" />
                            <p className="text-sm font-bold">No points transactions found</p>
                            <p className="text-xs mt-1">Bookmark properties to earn your first points!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.04]">
                            {displayedTransactions.map((tx, i) => (
                                <div
                                    key={tx.id}
                                    className={`grid grid-cols-2 md:grid-cols-4 items-center px-6 py-5 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}
                                >
                                    <span className={`text-sm col-span-1 ${textVariant}`}>
                                        {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                    <div className="col-span-1 md:col-span-2 pl-2 md:pl-0">
                                        <p className={`text-sm font-bold ${textPrimary}`}>{tx.description}</p>
                                        <span className={`flex items-center gap-1.5 text-xs mt-0.5 ${tx.type === "EARNED" ? "text-emerald-400" : "text-[#ff97b5]"}`}>
                                            {tx.type === "EARNED" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {tx.type}
                                        </span>
                                    </div>
                                    <span className={`text-right font-display font-bold text-base ${tx.type === "EARNED" ? "text-emerald-400" : "text-[#ff97b5]"}`}>
                                        {tx.type === "EARNED" ? "+" : ""}{(tx.amount ?? 0).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredTransactions.length > 4 && (
                        <div className={`px-6 py-4 text-center ${isDark ? "bg-[#201f1f]/30" : "bg-slate-50"}`}>
                            <button
                                onClick={() => setShowAll((prev) => !prev)}
                                className={`flex items-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest transition-colors ${textVariant} hover:text-[#a27cff]`}
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
