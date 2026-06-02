"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOwnerPoints, fetchOwnerPointTransactions } from "@/store/slices/ownerSlice";
import type { PointTransaction } from "@/store/slices/ownerSlice";
import { fetchOwnerRooms } from "@/store/slices/roomSlice";
import { useAuth } from "@/context/AuthContext";
import { hydrateAuth } from "@/store/slices/authSlice";
import api from "@/lib/api";
import Link from "next/link";
import {
    TrendingUp, ArrowUpRight, ArrowDownRight, Rocket, BadgeCheck,
    Megaphone, ArrowRight, ChevronDown, Loader2, CreditCard, X, CheckCircle2
} from "lucide-react";

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
        action: "boost",
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
        action: "certify",
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
        action: "newsletter",
    },
];

export default function OwnerWalletPage() {
    const { isDark } = useOwnerTheme();
    const dispatch = useAppDispatch();
    const { points, pointTransactions, isLoading } = useAppSelector((s) => s.owner);
    const { ownerRooms } = useAppSelector((s) => s.room);
    const { user } = useAuth();

    const [historyFilter, setHistoryFilter] = useState<"All" | "EARNED" | "SPENT">("All");
    const [showAll, setShowAll] = useState(false);

    const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);

    // Promotion Selection Modal state
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [promoting, setPromoting] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

    const activeRooms = ownerRooms.filter((r) => r.status === "active");

    useEffect(() => {
        dispatch(fetchOwnerPoints());
        dispatch(fetchOwnerPointTransactions());
        dispatch(fetchOwnerRooms());
    }, [dispatch]);

    const handleBuyPoints = async (packageId: string) => {
        setPurchasingPackageId(packageId);
        setPurchaseError(null);
        setPurchaseSuccessMessage(null);
        try {
            const { data } = await api.post("/owner/points/buy", { packageId });
            setPurchaseSuccessMessage(data.data?.message ?? "Successfully acquired curator points!");
            dispatch(fetchOwnerPoints());
            dispatch(fetchOwnerPointTransactions());
            dispatch(hydrateAuth());
            setTimeout(() => setPurchaseSuccessMessage(null), 5000);
        } catch (err: any) {
            setPurchaseError(err.response?.data?.message ?? err.message ?? "Payment failed. Please try again.");
        } finally {
            setPurchasingPackageId(null);
        }
    };

    const handleActivateCertification = async () => {
        setPurchasingPackageId("certify");
        setPurchaseError(null);
        setPurchaseSuccessMessage(null);
        try {
            const { data } = await api.post("/owner/points/certify");
            setPurchaseSuccessMessage(data.data?.message ?? "Successfully activated Elite profile certification!");
            dispatch(fetchOwnerPoints());
            dispatch(fetchOwnerPointTransactions());
            dispatch(hydrateAuth());
            setTimeout(() => setPurchaseSuccessMessage(null), 5000);
        } catch (err: any) {
            setPurchaseError(err.response?.data?.message ?? err.message ?? "Failed to activate Elite Profile Certification.");
        } finally {
            setPurchasingPackageId(null);
        }
    };

    const handleActivateNewsletter = async () => {
        setPurchasingPackageId("newsletter");
        setPurchaseError(null);
        setPurchaseSuccessMessage(null);
        try {
            const { data } = await api.post("/owner/points/newsletter");
            setPurchaseSuccessMessage(data.data?.message ?? "Successfully activated Newsletter Feature!");
            dispatch(fetchOwnerPoints());
            dispatch(fetchOwnerPointTransactions());
            setTimeout(() => setPurchaseSuccessMessage(null), 5000);
        } catch (err: any) {
            setPurchaseError(err.response?.data?.message ?? err.message ?? "Failed to activate Newsletter Feature.");
        } finally {
            setPurchasingPackageId(null);
        }
    };

    const handleFeatureRoom = async () => {
        if (!selectedRoomId) return;
        setPromoting(true);
        setPromoError(null);
        setPromoSuccess(null);
        try {
            const { data } = await api.post(`/owner/rooms/${selectedRoomId}/feature`);
            setPromoSuccess(data.data?.message ?? "Listing featured successfully!");
            dispatch(fetchOwnerPoints());
            dispatch(fetchOwnerPointTransactions());
            dispatch(fetchOwnerRooms());
            setTimeout(() => {
                setIsPromoModalOpen(false);
                setPromoSuccess(null);
                setSelectedRoomId(null);
            }, 2000);
        } catch (err: any) {
            setPromoError(err.response?.data?.message ?? err.message ?? "Failed to feature room.");
        } finally {
            setPromoting(false);
        }
    };

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-100";
    const tabActive = isDark ? "bg-[#ba9eff]/15 text-[#ba9eff] border border-[#ba9eff]/20" : "bg-violet-100 text-violet-700 border border-violet-200";
    const tabInactive = isDark ? "text-[#adaaaa] hover:text-white hover:bg-white/5 border border-transparent" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent";

    const filtered = historyFilter === "All"
        ? pointTransactions
        : pointTransactions.filter((t) => t.type === historyFilter);
    const displayed = showAll ? filtered : filtered.slice(0, 4);

    const totalEarned = pointTransactions.filter((t) => t.type === "EARNED").reduce((a, t) => a + t.amount, 0);
    const totalSpent = Math.abs(pointTransactions.filter((t) => t.type === "SPENT").reduce((a, t) => a + t.amount, 0));

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 relative pb-24 lg:pb-10 pl-14 xl:pl-0">

            {/* Balance Hero */}
            <section className="relative">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#ba9eff]/8 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative">
                    <p className={`text-xs font-bold uppercase tracking-[0.3em] mb-3 ${textVariant}`}>Current Reserve</p>
                    {isLoading ? (
                        <div className={`h-24 w-64 rounded-2xl animate-pulse ${isDark ? "bg-[#262626]" : "bg-slate-200"}`} />
                    ) : (
                        <div className="flex items-end gap-5 flex-wrap">
                            <span className="font-display font-black text-[5rem] sm:text-[7rem] leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">
                                {points.toLocaleString()}
                            </span>
                            <div className="pb-4">
                                <span className={`text-2xl font-headline font-bold ${textVariant}`}>PTS</span>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
                                        <ArrowUpRight size={16} />
                                        <span>+{totalEarned.toLocaleString()} earned</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#ff97b5] font-semibold text-sm">
                                        <ArrowDownRight size={16} />
                                        <span>-{totalSpent.toLocaleString()} spent</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Promo Cards */}
            <section>
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
                    <div>
                        <h3 className={`text-2xl md:text-3xl font-display font-bold tracking-tight mb-1 ${textPrimary}`}>Accelerate Exposure</h3>
                        <p className={`text-sm ${textVariant}`}>Utilize your curator points to enhance visibility.</p>
                    </div>
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
                                    <button
                                        disabled={points < card.pts || purchasingPackageId !== null}
                                        onClick={() => {
                                            if (card.action === "boost") {
                                                setIsPromoModalOpen(true);
                                            } else if (card.action === "certify") {
                                                handleActivateCertification();
                                            } else if (card.action === "newsletter") {
                                                handleActivateNewsletter();
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-colors flex items-center justify-center gap-1.5 ${
                                            points >= card.pts
                                                ? isDark ? "bg-white text-[#0e0e0e] hover:bg-[#ba9eff] hover:text-white" : "bg-slate-900 text-white hover:bg-violet-600"
                                                : isDark ? "bg-[#262626] text-zinc-600 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                        }`}
                                    >
                                        {purchasingPackageId === card.action ? (
                                            <>
                                                <Loader2 size={12} className="animate-spin" />
                                                <span>Activating...</span>
                                            </>
                                        ) : points >= card.pts ? (
                                            "Activate"
                                        ) : (
                                            "Not enough pts"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Acquire Curator Points */}
            <section className="relative">
                <div className="flex flex-col justify-between items-start gap-4 mb-8">
                    <div>
                        <h3 className={`text-2xl md:text-3xl font-display font-bold tracking-tight mb-1 ${textPrimary}`}>Acquire Curator Points</h3>
                        <p className={`text-sm ${textVariant}`}>Replenish your reserve instantly using your attached debit card account.</p>
                    </div>
                </div>

                {purchaseSuccessMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-2"
                    >
                        <BadgeCheck size={18} fill="currentColor" className="text-emerald-950" />
                        <span>{purchaseSuccessMessage}</span>
                    </motion.div>
                )}

                {purchaseError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold"
                    >
                        {purchaseError}
                    </motion.div>
                )}

                {!((user as any)?.card_number) ? (
                    <div className={`p-8 rounded-2xl text-center space-y-4 ${surfaceLow} border border-amber-500/25`}>
                        <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <CreditCard size={24} />
                        </div>
                        <h4 className={`text-lg font-bold font-headline ${textPrimary}`}>No Debit Card Connected</h4>
                        <p className={`text-sm max-w-md mx-auto ${textVariant}`}>
                            To acquire points, you must link your mock debit card. Linking can be done securely in your account settings.
                        </p>
                        <Link
                            href="/owner/settings"
                            className={`inline-flex px-6 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider ${
                                isDark ? "bg-white text-slate-900 hover:bg-[#ba9eff] hover:text-white" : "bg-slate-900 text-white hover:bg-violet-600"
                            } transition-colors`}
                        >
                            Link Debit Card in Settings
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            {
                                id: "starter",
                                title: "Curator Starter",
                                points: 100,
                                pkr: 500,
                                bg: "from-blue-500/5 to-cyan-500/5",
                                border: isDark ? "border-white/5" : "border-slate-100",
                                desc: "Ideal for boosting a single property list to get swift tenant enquiries.",
                                tag: "Casual",
                            },
                            {
                                id: "growth",
                                title: "Growth Curator",
                                points: 500,
                                pkr: 2000,
                                bg: "from-violet-500/10 to-indigo-500/10",
                                border: isDark ? "border-[#ba9eff]/20" : "border-violet-200",
                                desc: "Our most popular curator tier. Grants sufficient reserve for multiple boosts.",
                                tag: "Best Value",
                            },
                            {
                                id: "elite",
                                title: "Elite Curator",
                                points: 1500,
                                pkr: 5000,
                                bg: "from-pink-500/5 to-rose-500/5",
                                border: isDark ? "border-white/5" : "border-slate-100",
                                desc: "For professional agencies. Maximize views and seal occupancy records instantly.",
                                tag: "Enterprise",
                            },
                        ].map((pkg, i) => (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`group relative overflow-hidden rounded-2xl border ${pkg.border} p-6 flex flex-col justify-between ${surfaceHigh} bg-gradient-to-br ${pkg.bg} hover:scale-[1.02] transition-transform duration-300`}
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                            pkg.id === "growth"
                                                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                                : "bg-zinc-500/10 text-zinc-400"
                                        }`}>
                                            {pkg.tag}
                                        </span>
                                        <span className={`text-xs font-semibold ${textVariant}`}>PKR {pkg.pkr.toLocaleString()}</span>
                                    </div>

                                    <div>
                                        <h4 className={`text-lg font-bold font-headline ${textPrimary}`}>{pkg.title}</h4>
                                        <div className="flex items-baseline gap-1.5 mt-2">
                                            <span className="font-display font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">
                                                {pkg.points.toLocaleString()}
                                            </span>
                                            <span className="text-xs font-bold text-zinc-500 uppercase">PTS</span>
                                        </div>
                                    </div>

                                    <p className={`text-xs leading-relaxed ${textVariant}`}>{pkg.desc}</p>
                                </div>

                                <button
                                    onClick={() => handleBuyPoints(pkg.id)}
                                    disabled={purchasingPackageId !== null}
                                    className={`w-full mt-6 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                        pkg.id === "growth"
                                            ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-[0_0_15px_rgba(138,92,246,0.3)] hover:brightness-110"
                                            : isDark
                                            ? "bg-[#262626] text-white hover:bg-white hover:text-slate-900"
                                            : "bg-slate-200 text-slate-800 hover:bg-slate-900 hover:text-white"
                                    }`}
                                >
                                    {purchasingPackageId === pkg.id ? (
                                        <>
                                            <Loader2 size={12} className="animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>Acquire Package</span>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Transaction History */}
            <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className={`text-xl font-display font-bold tracking-tight ${textPrimary}`}>Usage History</h3>
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
                        <span className="col-span-2">Action</span>
                        <span className="text-right">Amount</span>
                    </div>

                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`h-14 rounded-xl animate-pulse ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`} />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className={`text-sm ${textVariant}`}>No transactions found</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {displayed.map((tx, i) => (
                                <motion.div
                                    key={tx.id}
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`grid grid-cols-2 md:grid-cols-4 items-center px-6 py-5 transition-colors ${i < displayed.length - 1 ? isDark ? "border-b border-white/5" : "border-b border-slate-100" : ""} ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}
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
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {filtered.length > 4 && (
                        <div className={`px-6 py-4 text-center ${isDark ? "bg-[#201f1f]/30" : "bg-slate-50"}`}>
                            <button
                                onClick={() => setShowAll((prev) => !prev)}
                                className={`flex items-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest transition-colors ${textVariant} hover:text-[#ba9eff]`}
                            >
                                {showAll ? "Show Less" : "Load More Transactions"}
                                <ChevronDown size={14} className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Promotion Selection Modal */}
            <AnimatePresence>
                {isPromoModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-md rounded-2xl border flex flex-col max-h-[85vh] overflow-hidden ${
                                isDark ? "bg-[#141414] border-white/10" : "bg-white border-slate-200 text-slate-900 shadow-2xl"
                            }`}
                        >
                            {/* Modal Header */}
                            <div className={`p-4 border-b flex justify-between items-center ${isDark ? "border-white/5 bg-zinc-900/55" : "border-slate-100 bg-slate-50"}`}>
                                <div>
                                    <h3 className="text-base font-bold">Select Listing</h3>
                                    <p className="text-xs text-zinc-500">Choose which property to boost to the header.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsPromoModalOpen(false);
                                        setSelectedRoomId(null);
                                        setPromoError(null);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-950"
                                    }`}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {promoSuccess && (
                                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                                        {promoSuccess}
                                    </div>
                                )}
                                {promoError && (
                                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                                        {promoError}
                                    </div>
                                )}

                                {activeRooms.length === 0 ? (
                                    <div className="text-center py-10 text-zinc-500">
                                        <p className="text-sm">No active listings found.</p>
                                        <p className="text-xs mt-1">You must have an approved, live listing to promote it.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {activeRooms.map((room) => {
                                            const isSelected = selectedRoomId === room.id;
                                            const isAlreadyFeatured = room.is_featured;

                                            return (
                                                <button
                                                    key={room.id}
                                                    disabled={isAlreadyFeatured || promoting}
                                                    onClick={() => setSelectedRoomId(room.id)}
                                                    className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                                                        isSelected
                                                            ? isDark
                                                                ? "bg-[#ba9eff]/10 border-[#ba9eff]/40"
                                                                : "bg-violet-50 border-violet-300"
                                                            : isAlreadyFeatured
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : isDark
                                                            ? "bg-[#1c1c1c] border-white/5 hover:border-white/10"
                                                            : "bg-slate-50 border-slate-150 hover:bg-slate-100/60"
                                                    }`}
                                                >
                                                    <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                                                        {room.images?.[0] ? (
                                                            <img src={room.images[0].url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                                <Rocket size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-bold truncate ${textPrimary}`}>{room.title}</p>
                                                        <p className={`text-[10px] ${textVariant}`}>{room.city} • PKR {room.price.toLocaleString()}/mo</p>
                                                    </div>
                                                    {isAlreadyFeatured ? (
                                                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#ba9eff]">Featured</span>
                                                    ) : isSelected ? (
                                                        <div className="w-4.5 h-4.5 rounded-full bg-purple-500 flex items-center justify-center">
                                                            <CheckCircle2 size={12} className="text-white fill-purple-500" />
                                                        </div>
                                                    ) : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className={`p-4 border-t flex justify-end gap-3 ${isDark ? "border-white/5 bg-zinc-900/55" : "border-slate-100 bg-slate-50"}`}>
                                <button
                                    onClick={() => {
                                        setIsPromoModalOpen(false);
                                        setSelectedRoomId(null);
                                        setPromoError(null);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isDark ? "bg-zinc-850 hover:bg-zinc-800 text-zinc-300" : "text-slate-600 bg-slate-100 hover:bg-slate-200"}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!selectedRoomId || promoting}
                                    onClick={handleFeatureRoom}
                                    className={`px-5 py-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5`}
                                >
                                    {promoting ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />}
                                    Confirm Placement
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
