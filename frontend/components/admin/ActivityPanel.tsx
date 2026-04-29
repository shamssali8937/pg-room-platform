"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingBag, Shield, AlertTriangle, ChevronRight } from "lucide-react";
import { mockModerationReports, mockPointsActivity } from "./mockData";
import { useAdminTheme } from "@/context/AdminThemeContext";

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
    const { isDark } = useAdminTheme();

    const dismissReport = (id: string) => {
        setReports((prev) => prev.filter((r) => r.id !== id));
    };

    const cardBg = isDark ? "bg-zinc-900/60 border-white/[0.04] divide-white/[0.04]" : "bg-white border-slate-200 divide-slate-100";
    const pointsBg = isDark ? "bg-black/40 border-white/[0.04]" : "bg-slate-50 border-slate-200";
    const headingColor = isDark ? "text-white" : "text-slate-900";
    const titleColor = isDark ? "text-white" : "text-slate-900";
    const subColor = isDark ? "text-zinc-500" : "text-slate-500";
    const emptyColor = isDark ? "text-zinc-500" : "text-slate-400";
    const chevronColor = isDark ? "text-zinc-600 group-hover:text-zinc-400" : "text-slate-300 group-hover:text-slate-500";
    const ledgerBtn = isDark
        ? "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900";

    return (
        <div className="space-y-8">
            {/* Moderation Reports */}
            <div className="space-y-3">
                <h4 className={`text-lg font-bold tracking-tight ${headingColor}`}>Recent Moderation</h4>
                <div className={`rounded-xl p-4 border divide-y ${cardBg}`}>
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
                                            <p className={`text-sm font-semibold ${titleColor}`}>{report.title}</p>
                                        </div>
                                        <span className={`${sev.bg} ${sev.text} text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest`}>
                                            {sev.label}
                                        </span>
                                    </div>
                                    <p className={`text-xs ml-5 ${subColor}`}>{report.description}</p>

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
                        <p className={`py-4 text-center text-sm ${emptyColor}`}>No pending reports ✓</p>
                    )}
                </div>
            </div>

            {/* Points Activity */}
            <div className="space-y-3">
                <h4 className={`text-lg font-bold tracking-tight ${headingColor}`}>Points Activity</h4>
                <div className={`rounded-xl p-5 border space-y-5 ${pointsBg}`}>
                    {mockPointsActivity.map((activity) => {
                        const isPositive = activity.amount > 0;
                        return (
                            <div key={activity.id} className="flex items-center gap-4 group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPositive ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
                                    {pointsIcons[activity.icon] || <Star size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${titleColor}`}>
                                        {isPositive ? "+" : ""}{activity.amount} Points {activity.type === "earned" ? "Earned" : activity.type === "spent" ? "Spent" : "Reward"}
                                    </p>
                                    <p className={`text-xs truncate ${subColor}`}>{activity.user} • {activity.reason}</p>
                                </div>
                                <ChevronRight size={14} className={`transition-colors flex-shrink-0 ${chevronColor}`} />
                            </div>
                        );
                    })}

                    <button className={`w-full py-3 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${ledgerBtn}`}>
                        Manage Ledger
                    </button>
                </div>
            </div>
        </div>
    );
}