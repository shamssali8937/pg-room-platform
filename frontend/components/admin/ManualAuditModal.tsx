"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ShieldCheck,
    ShieldAlert,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    FileText,
    MapPin,
    Camera,
    MessageSquare,
    ChevronDown,
} from "lucide-react";
import { type ModerationListing, rejectionReasons } from "./mockData";

interface ManualAuditModalProps {
    listing: ModerationListing | null;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onSuspend: (id: string) => void;
}

type AuditVerdict = "approve" | "reject" | "suspend" | null;

const docStatusConfig = {
    verified: { icon: ShieldCheck, text: "text-emerald-400", bg: "bg-emerald-500/10", label: "Verified" },
    pending: { icon: Clock, text: "text-amber-400", bg: "bg-amber-500/10", label: "Pending" },
    failed: { icon: ShieldAlert, text: "text-red-400", bg: "bg-red-500/10", label: "Failed" },
};

const checklistItems = [
    { id: "images", label: "Property images are clear and accurate", icon: Camera },
    { id: "address", label: "Address & location verified on map", icon: MapPin },
    { id: "docs", label: "Owner documents cross-checked", icon: FileText },
    { id: "pricing", label: "Pricing is consistent with market rates", icon: AlertTriangle },
    { id: "description", label: "Description matches property photos", icon: MessageSquare },
];

export default function ManualAuditModal({
    listing,
    onClose,
    onApprove,
    onReject,
    onSuspend,
}: ManualAuditModalProps) {
    const [checklist, setChecklist] = useState<Record<string, boolean>>(
        Object.fromEntries(checklistItems.map((c) => [c.id, false]))
    );
    const [verdict, setVerdict] = useState<AuditVerdict>(null);
    const [rejectReason, setRejectReason] = useState(rejectionReasons[0]);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!listing) return null;

    const formattedPrice = new Intl.NumberFormat("en-PK").format(listing.price);
    const completedChecks = Object.values(checklist).filter(Boolean).length;
    const totalChecks = checklistItems.length;
    const progress = (completedChecks / totalChecks) * 100;

    const toggleCheck = (id: string) => {
        setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSubmit = () => {
        if (!verdict) return;
        setIsSubmitting(true);
        // Simulate API call delay
        setTimeout(() => {
            if (verdict === "approve") onApprove(listing.id);
            else if (verdict === "reject") onReject(listing.id, rejectReason);
            else if (verdict === "suspend") onSuspend(listing.id);
            setIsSubmitting(false);
            onClose();
        }, 600);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-start justify-center overflow-y-auto py-6 px-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.92, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.92, y: 30, opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl bg-zinc-900 border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl shadow-black/60 my-auto"
                >
                    {/* ── Header ── */}
                    <div className="relative bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-transparent px-5 sm:px-8 py-6 border-b border-white/[0.06]">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-400 flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck size={22} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h2
                                        className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate"
                                        style={{ fontFamily: "Manrope, sans-serif" }}
                                    >
                                        Manual Audit
                                    </h2>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        #{listing.id} • {listing.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-full bg-zinc-800/80 border border-white/5 text-zinc-400 flex items-center justify-center hover:text-white hover:bg-zinc-700 transition-colors flex-shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="p-5 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* ── Listing Summary ── */}
                        <div className="flex gap-4 bg-zinc-800/40 rounded-xl p-4 border border-white/[0.04]">
                            <img
                                src={listing.image}
                                alt={listing.title}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0 border border-white/[0.06]"
                            />
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base font-bold text-white truncate">{listing.title}</h3>
                                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                    <MapPin size={11} /> {listing.location}
                                </p>
                                <p className="text-sm font-bold text-purple-400 mt-2">
                                    {listing.currency} {formattedPrice}
                                    <span className="text-[10px] text-zinc-500 ml-1 font-medium uppercase">/month</span>
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <img
                                        src={listing.host.avatar}
                                        alt={listing.host.name}
                                        className="w-5 h-5 rounded-full"
                                    />
                                    <p className="text-[11px] text-zinc-400">{listing.host.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Existing Audit Note ── */}
                        {listing.auditNote && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                <p className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold mb-1.5 flex items-center gap-1.5">
                                    <AlertTriangle size={12} /> System Flag
                                </p>
                                <p className="text-sm text-amber-300/80 italic leading-relaxed">
                                    &ldquo;{listing.auditNote}&rdquo;
                                </p>
                            </div>
                        )}

                        {/* ── Document Verification ── */}
                        {listing.documents && listing.documents.length > 0 && (
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">
                                    Document Verification
                                </h4>
                                <div className="space-y-2">
                                    {listing.documents.map((doc) => {
                                        const cfg = docStatusConfig[doc.status];
                                        const DocIcon = cfg.icon;
                                        return (
                                            <div
                                                key={doc.name}
                                                className="flex items-center justify-between bg-zinc-800/40 border border-white/[0.04] rounded-xl px-4 py-3"
                                            >
                                                <p className="text-sm text-zinc-300 font-medium">{doc.name}</p>
                                                <span
                                                    className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${cfg.text} ${cfg.bg} px-2.5 py-1 rounded-lg`}
                                                >
                                                    <DocIcon size={13} />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Checklist ── */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                                    Audit Checklist
                                </h4>
                                <span className="text-[11px] text-zinc-400 font-medium">
                                    {completedChecks}/{totalChecks} completed
                                </span>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-4">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <div className="space-y-2">
                                {checklistItems.map((item) => {
                                    const checked = checklist[item.id];
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleCheck(item.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                                                checked
                                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                                    : "bg-zinc-800/40 border-white/[0.04] hover:border-white/10"
                                            }`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                                                    checked
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-zinc-700 border border-zinc-600"
                                                }`}
                                            >
                                                {checked && <CheckCircle2 size={13} />}
                                            </div>
                                            <item.icon
                                                size={15}
                                                className={checked ? "text-emerald-400" : "text-zinc-500"}
                                            />
                                            <span
                                                className={`text-sm font-medium ${
                                                    checked ? "text-emerald-300" : "text-zinc-300"
                                                }`}
                                            >
                                                {item.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Verdict ── */}
                        <div>
                            <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">
                                Audit Verdict
                            </h4>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                <button
                                    onClick={() => setVerdict("approve")}
                                    className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
                                        verdict === "approve"
                                            ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                                            : "bg-zinc-800/60 text-zinc-400 border-white/[0.04] hover:border-emerald-500/30 hover:text-emerald-400"
                                    }`}
                                >
                                    <CheckCircle2 size={14} />
                                    Approve
                                </button>
                                <button
                                    onClick={() => setVerdict("reject")}
                                    className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
                                        verdict === "reject"
                                            ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20"
                                            : "bg-zinc-800/60 text-zinc-400 border-white/[0.04] hover:border-red-500/30 hover:text-red-400"
                                    }`}
                                >
                                    <XCircle size={14} />
                                    Reject
                                </button>
                                <button
                                    onClick={() => setVerdict("suspend")}
                                    className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
                                        verdict === "suspend"
                                            ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20"
                                            : "bg-zinc-800/60 text-zinc-400 border-white/[0.04] hover:border-amber-500/30 hover:text-amber-400"
                                    }`}
                                >
                                    <AlertTriangle size={14} />
                                    Suspend
                                </button>
                            </div>

                            {/* Reject Reason dropdown */}
                            <AnimatePresence>
                                {verdict === "reject" && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 relative">
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-semibold">
                                                Rejection Reason
                                            </p>
                                            <div className="relative">
                                                <select
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    className="w-full bg-zinc-800 border border-white/5 rounded-xl text-sm py-3 px-4 text-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                                                >
                                                    {rejectionReasons.map((r) => (
                                                        <option key={r} value={r}>
                                                            {r}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown
                                                    size={14}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Admin Notes ── */}
                        <div>
                            <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                                Admin Notes <span className="text-zinc-600">(optional)</span>
                            </h4>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add internal notes about this audit..."
                                rows={3}
                                className="w-full bg-zinc-800/60 border border-white/[0.04] rounded-xl text-sm py-3 px-4 text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                            />
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="px-5 sm:px-8 py-5 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={!verdict || isSubmitting}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                !verdict
                                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                    : verdict === "approve"
                                    ? "bg-emerald-500 text-white hover:brightness-110"
                                    : verdict === "reject"
                                    ? "bg-red-500 text-white hover:brightness-110"
                                    : "bg-amber-500 text-white hover:brightness-110"
                            } ${isSubmitting ? "opacity-60 pointer-events-none" : ""}`}
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : !verdict ? (
                                "Select a Verdict"
                            ) : (
                                <>
                                    <ShieldCheck size={15} />
                                    Submit Audit — {verdict.charAt(0).toUpperCase() + verdict.slice(1)}
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="py-3 px-6 bg-zinc-800 border border-white/5 text-zinc-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
