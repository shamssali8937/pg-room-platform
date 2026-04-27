"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingBag, Shield, AlertTriangle, ChevronRight } from "lucide-react";
import { mockModerationReports, mockPointsActivity } from "./mockData";

const severityConfig = {
    high: { bg: "bg-red-500/10", text: "text-red-400", label: "HIGH" },
    medium: { bg: "bg-orange-500/10", text: "text-orange-400", label: "MEDIUM" },
    low: { bg: "bg-blue-500/10", text: "text-blue-400", label: "LOW" },
};

const pointsIcons: Record<string, React.ReactNode> = {
    star: <Star size={18} />,
    "shopping-bag": <ShoppingBag size={18} />,
    shield: <Shield size={18} />,
};

export default function ActivityPanel() {
    const [reports, setReports] = useState(mockModerationReports);
    const [expandedReport, setExpandedReport] = useState<string | null>(null);

    const dismissReport = (id: string) => {
        setReports((prev) => prev.filter((r) => r.id !== id));
    };

    return (
        <div className="space-y-8">
            {/* Moderation Reports */}
            <div className="space-y-3">
                <h4 className="text-lg font-bold tracking-tight text-white">Recent Moderation</h4>
                <div className="bg-zinc-900/60 rounded-xl p-4 border border-white/[0.04] divide-y divide-white/[0.04]">
                    <AnimatePresence mode="popLayout">
                        {reports.map((report) => {
                            const sev = severityConfig[report.severity];
                            const isExpanded = expandedReport === report.id;
                            return (
                                <motion.div
                                    key={report.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="py-3 cursor-pointer"
                                    onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={13} className={sev.text} />
                                            <p className="text-sm font-semibold text-white">{report.title}</p>
                                        </div>
                                        <span className={`${sev.bg} ${sev.text} text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest`}>
                                            {sev.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 ml-5">{report.description}</p>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="ml-5 mt-2 overflow-hidden"
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); dismissReport(report.id); }}
                                                    className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                                                >
                                                    Dismiss Report
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {reports.length === 0 && (
                        <p className="py-4 text-center text-zinc-500 text-sm">No pending reports ✓</p>
                    )}
                </div>
            </div>

            {/* Points Activity */}
            <div className="space-y-3">
                <h4 className="text-lg font-bold tracking-tight text-white">Points Activity</h4>
                <div className="bg-black/40 rounded-xl p-5 border border-white/[0.04] space-y-5">
                    {mockPointsActivity.map((activity) => {
                        const isPositive = activity.amount > 0;
                        return (
                            <div key={activity.id} className="flex items-center gap-4 group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPositive ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
                                    {pointsIcons[activity.icon] || <Star size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">
                                        {isPositive ? "+" : ""}{activity.amount} Points {activity.type === "earned" ? "Earned" : activity.type === "spent" ? "Spent" : "Reward"}
                                    </p>
                                    <p className="text-xs text-zinc-500 truncate">{activity.user} • {activity.reason}</p>
                                </div>
                                <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
                            </div>
                        );
                    })}

                    <button className="w-full py-3 bg-zinc-800/60 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-300">
                        Manage Ledger
                    </button>
                </div>
            </div>
        </div>
    );
}