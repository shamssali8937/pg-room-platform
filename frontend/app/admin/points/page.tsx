"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, SlidersHorizontal, Plus, RotateCcw, ShieldCheck, Zap, TrendingUp, MoreVertical } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import StatsCard from "@/components/admin/StatsCard";
import { mockPointTransactions, mockPointsStats, type PointTransaction, type PointAction } from "@/components/admin/mockData";

const typeColors: Record<PointAction, { dot: string; delta: string }> = {
    earned: { dot: "bg-purple-400", delta: "text-purple-400" },
    spent: { dot: "bg-blue-400", delta: "text-blue-400" },
    manual: { dot: "bg-pink-400", delta: "text-pink-400" },
    reward: { dot: "bg-emerald-400", delta: "text-emerald-400" },
    penalty: { dot: "bg-red-400", delta: "text-red-400" },
};

const statusBadge: Record<string, { bg: string; text: string }> = {
    verified: { bg: "bg-white/5", text: "text-white" },
    "auto-debit": { bg: "bg-white/5", text: "text-white" },
    manual: { bg: "bg-pink-500/20", text: "text-pink-400" },
    pending: { bg: "bg-amber-500/20", text: "text-amber-400" },
    reversed: { bg: "bg-red-500/20", text: "text-red-400" },
};

export default function PointsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [transactions, setTransactions] = useState<PointTransaction[]>(mockPointTransactions);
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const [showAdjustForm, setShowAdjustForm] = useState(false);
    const [adjustForm, setAdjustForm] = useState({ userId: "", amount: "", reason: "" });
    const [filterType, setFilterType] = useState<PointAction | "all">("all");
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const ITEMS_PER_PAGE = 6;

    const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const filtered = useMemo(() => {
        let result = transactions;
        if (filterType !== "all") result = result.filter((t) => t.type === filterType);
        if (!searchQuery) return result;
        const q = searchQuery.toLowerCase();
        return result.filter((t) => t.user.name.toLowerCase().includes(q) || t.user.uid.toLowerCase().includes(q) || t.action.toLowerCase().includes(q));
    }, [transactions, searchQuery, filterType]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleAdjust = () => {
        if (!adjustForm.userId || !adjustForm.amount || !adjustForm.reason) return;
        const delta = parseInt(adjustForm.amount);
        if (isNaN(delta)) return;
        const newTxn: PointTransaction = {
            id: `TXN-${Date.now()}`,
            user: { name: adjustForm.userId, uid: adjustForm.userId, avatar: "https://i.pravatar.cc/100?u=" + adjustForm.userId },
            action: adjustForm.reason,
            type: delta >= 0 ? "manual" : "penalty",
            delta, balance: Math.max(0, 5000 + delta),
            timestamp: new Date().toLocaleString(),
            status: "manual",
        };
        setTransactions((prev) => [newTxn, ...prev]);
        setAdjustForm({ userId: "", amount: "", reason: "" });
        setShowAdjustForm(false);
        showToast(`Balance adjusted by ${delta > 0 ? "+" : ""}${delta} for ${adjustForm.userId}`, delta >= 0 ? "success" : "error");
    };

    const s = mockPointsStats;

    return (
        <div className="bg-[#0e0e0e] text-white min-h-screen">
            <Sidebar activeId="points" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Topbar searchQuery={searchQuery} onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }} searchPlaceholder="Search transactions, users or IDs..." onMenuToggle={() => setSidebarOpen(true)} />

            <main className="ml-0 lg:ml-[280px] pt-24 lg:pt-32 px-4 sm:px-6 lg:px-10 pb-20 min-h-screen">
                {/* Header */}
                <section className="mb-8 lg:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter text-white mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>Points Ledger</h2>
                        <p className="text-zinc-500 max-w-xl text-sm">Comprehensive audit trail of all virtual currency movements across the PG Nexus ecosystem.</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <div className="relative">
                            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${filterType !== "all" ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-zinc-800/60 border-white/5 text-white hover:bg-zinc-700/60"}`}>
                                <SlidersHorizontal size={14} /> {filterType === "all" ? "Filter" : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                            </button>
                            {showFilterMenu && (
                                <div className="absolute right-0 top-full mt-2 w-44 bg-zinc-900/98 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 z-50 shadow-2xl">
                                    {(["all", "earned", "spent", "manual", "reward", "penalty"] as const).map((t) => (
                                        <button key={t} onClick={() => { setFilterType(t); setShowFilterMenu(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${filterType === t ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>
                                            {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={() => setShowAdjustForm(!showAdjustForm)} className="flex items-center gap-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-xs sm:text-sm font-bold text-white hover:brightness-110 transition-all">
                            <Plus size={14} /> Adjust Balance
                        </button>
                    </div>
                </section>

                {/* Bento Stats */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-8 lg:mb-12">
                    {/* Velocity Card */}
                    <div className="lg:col-span-8 bg-zinc-900/60 rounded-2xl p-5 sm:p-8 border border-white/[0.04]">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6 sm:mb-8">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Ecosystem Velocity</h3>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Last 24 Hours Overview</p>
                            </div>
                            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-full uppercase tracking-tight self-start">Live Audit</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                            <div className="space-y-2">
                                <p className="text-xs sm:text-sm text-zinc-500">Total Earned</p>
                                <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>{s.totalEarned.value.toLocaleString()} <span className="text-purple-400 text-sm">{s.totalEarned.label}</span></p>
                                <div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{ width: "65%" }} /></div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs sm:text-sm text-zinc-500">Total Spent</p>
                                <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>{s.totalSpent.value.toLocaleString()} <span className="text-blue-400 text-sm">{s.totalSpent.label}</span></p>
                                <div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: "40%" }} /></div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs sm:text-sm text-zinc-500">Net Delta</p>
                                <p className="text-2xl sm:text-3xl font-bold text-pink-400" style={{ fontFamily: "Manrope, sans-serif" }}>+{s.netDelta.value.toLocaleString()}</p>
                                <div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-full bg-pink-500 rounded-full" style={{ width: "55%" }} /></div>
                            </div>
                        </div>
                    </div>
                    {/* System Health */}
                    <div className="lg:col-span-4 bg-zinc-900/60 rounded-2xl p-5 sm:p-8 border border-white/[0.04] relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                        <h3 className="text-base sm:text-lg font-bold text-white mb-5 relative z-10" style={{ fontFamily: "Manrope, sans-serif" }}>System Health</h3>
                        <div className="space-y-5 relative z-10">
                            {[{ icon: ShieldCheck, label: "Auto-Approvals", val: s.systemHealth.autoApprovals }, { icon: Zap, label: "Admin Manual", val: s.systemHealth.adminManual }, { icon: TrendingUp, label: "Boost Utilization", val: s.systemHealth.boostUtilization }].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center"><item.icon size={14} className="text-zinc-400" /></div>
                                        <span className="text-sm text-zinc-300">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-white">{item.val}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Transaction Table */}
                <div className="bg-zinc-900/60 rounded-2xl border border-white/[0.04] overflow-hidden mb-8 lg:mb-12">
                    <div className="px-4 sm:px-6 py-4 border-b border-white/[0.04] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-zinc-900/80">
                        <h3 className="text-sm sm:text-base font-bold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Audit Transaction Log</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-medium">Export:</span>
                            <button className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors border border-white/[0.04]">CSV</button>
                            <button className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors border border-white/[0.04]">PDF</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/[0.04]">
                                    <th className="px-4 sm:px-6 py-4 font-bold">Owner / User ID</th>
                                    <th className="px-4 sm:px-6 py-4 font-bold">Action Performed</th>
                                    <th className="px-4 sm:px-6 py-4 font-bold text-right">Point Delta</th>
                                    <th className="px-4 sm:px-6 py-4 font-bold text-right">Balance</th>
                                    <th className="px-4 sm:px-6 py-4 font-bold">Timestamp</th>
                                    <th className="px-4 sm:px-6 py-4 font-bold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                <AnimatePresence mode="popLayout">
                                    {paginated.map((txn) => {
                                        const tc = typeColors[txn.type];
                                        const sb = statusBadge[txn.status] || statusBadge.verified;
                                        return (
                                            <motion.tr key={txn.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={txn.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-white/[0.06] flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate">{txn.user.name}</p>
                                                            <p className="text-[10px] text-zinc-500">ID: {txn.user.uid}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${tc.dot}`} />
                                                        <span className="text-sm text-zinc-300">{txn.action}</span>
                                                    </div>
                                                </td>
                                                <td className={`px-4 sm:px-6 py-4 text-right font-bold ${tc.delta}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                                                    {txn.delta > 0 ? "+" : ""}{txn.delta.toLocaleString()}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-right font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
                                                    {txn.balance.toLocaleString()}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-xs text-zinc-500">{txn.timestamp}</td>
                                                <td className="px-4 sm:px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full ${sb.bg} ${sb.text} text-[10px] font-bold uppercase tracking-tight`}>
                                                        {txn.status.replace("-", " ")}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 sm:px-6 py-4 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-3 bg-zinc-900/80">
                        <p className="text-xs text-zinc-500">Showing {paginated.length} of {filtered.length} transactions</p>
                        <div className="flex gap-1.5">
                            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-white disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button key={p} onClick={() => setCurrentPage(p)} className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${p === currentPage ? "bg-purple-500 text-white" : "bg-zinc-800/80 text-white hover:bg-zinc-700"}`}>{p}</button>
                            ))}
                            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-white disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Manual Adjustment Panel */}
                <AnimatePresence>
                    {showAdjustForm && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-zinc-900/60 rounded-2xl border border-white/[0.04] p-5 sm:p-8 lg:p-10 relative overflow-hidden">
                            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute -left-20 -top-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-4">
                                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>Manual Point Control</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed mb-4">Adjust user balances directly for dispute resolution, loyalty rewards, or operational corrections.</p>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400">
                                        <ShieldCheck size={14} /> Requires Tier 2 Permission
                                    </div>
                                </div>
                                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">Target User ID</label>
                                        <input value={adjustForm.userId} onChange={(e) => setAdjustForm({ ...adjustForm, userId: e.target.value })} placeholder="e.g. 99420-XV" className="w-full bg-zinc-800/60 border border-white/[0.04] rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">Adjustment Amount</label>
                                        <input value={adjustForm.amount} onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })} type="number" placeholder="+/- Points" className="w-full bg-zinc-800/60 border border-white/[0.04] rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">Authorization Reason <span className="text-zinc-600">(Required)</span></label>
                                        <textarea value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} rows={3} placeholder="Provide a detailed explanation..." className="w-full bg-zinc-800/60 border border-white/[0.04] rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                                        <button onClick={() => { setShowAdjustForm(false); setAdjustForm({ userId: "", amount: "", reason: "" }); }} className="px-6 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-colors">Cancel</button>
                                        <button onClick={handleAdjust} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-sm font-bold text-white hover:brightness-110 transition-all active:scale-[0.98]">Execute Adjustment</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 40, x: "-50%" }} className={`fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-xl text-sm font-semibold shadow-2xl backdrop-blur-xl border border-white/10 whitespace-nowrap ${toast.type === "success" ? "bg-green-500/20 text-green-400" : toast.type === "error" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
