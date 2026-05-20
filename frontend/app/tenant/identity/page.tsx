"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { mockTenantProfile } from "@/components/tenant/mockData";
import {
    ShieldCheck, Upload, CheckCircle2, AlertCircle, Clock,
    User, Mail, Phone, Building2, FileText, Camera, X
} from "lucide-react";

type VerifyStatus = "verified" | "pending" | "not_uploaded";

interface DocItem {
    id: string;
    label: string;
    description: string;
    status: VerifyStatus;
    icon: React.ReactNode;
}

const INITIAL_DOCS: DocItem[] = [
    { id: "cnic", label: "CNIC (Front & Back)", description: "Pakistan national identity card, both sides", status: "verified", icon: <FileText size={18} /> },
    { id: "photo", label: "Selfie with CNIC", description: "Clear photo holding your CNIC next to your face", status: "verified", icon: <Camera size={18} /> },
    { id: "employment", label: "Employment Proof", description: "Salary slip or employment letter (last 3 months)", status: "not_uploaded", icon: <Building2 size={18} /> },
    { id: "bank", label: "Bank Statement", description: "Last 3 months bank statement", status: "not_uploaded", icon: <FileText size={18} /> },
];

const STATUS_UI: Record<VerifyStatus, { label: string; badge: string; icon: React.ReactNode }> = {
    verified: { label: "Verified", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: <CheckCircle2 size={14} className="text-emerald-400" /> },
    pending: { label: "Under Review", badge: "bg-amber-400/10 text-amber-400 border-amber-400/20", icon: <Clock size={14} className="text-amber-400" /> },
    not_uploaded: { label: "Not Uploaded", badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: <AlertCircle size={14} className="text-zinc-400" /> },
};

export default function TenantIdentity() {
    const { isDark } = useTenantTheme();
    const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceMid = isDark ? "bg-[#1a1919] border border-[#484847]/10" : "bg-slate-50 border border-slate-100";
    const divider = isDark ? "border-white/[0.06]" : "border-slate-100";

    const verifiedCount = docs.filter(d => d.status === "verified").length;
    const totalDocs = docs.length;
    const progress = Math.round((verifiedCount / totalDocs) * 100);

    const handleUpload = (docId: string) => {
        setUploadingId(docId);
        setTimeout(() => {
            setDocs(prev => prev.map(d => d.id === docId ? { ...d, status: "pending" } : d));
            setUploadingId(null);
            setUploadSuccess(docId);
            setTimeout(() => setUploadSuccess(null), 3000);
        }, 1500);
    };

    const personalFields = [
        { icon: <User size={15} />, label: "Full Name", value: mockTenantProfile.name },
        { icon: <Mail size={15} />, label: "Email", value: mockTenantProfile.email },
        { icon: <Phone size={15} />, label: "Phone", value: mockTenantProfile.phone },
        { icon: <FileText size={15} />, label: "CNIC", value: mockTenantProfile.cnic },
        { icon: <Building2 size={15} />, label: "Occupation", value: mockTenantProfile.occupation },
        { icon: <Building2 size={15} />, label: "Company", value: mockTenantProfile.company },
    ];

    return (
        <div className="max-w-[1000px] mx-auto space-y-6 pb-24 lg:pb-4">
            {/* Header */}
            <header className="pl-14 xl:pl-0">
                <p className="text-[#a27cff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">Account Security</p>
                <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>Identity Verification</h2>
                <p className={`text-sm mt-1 ${textVariant}`}>Complete verification to access all platform features and build trust with landlords.</p>
            </header>

            {/* Verification Score */}
            <section className={`rounded-2xl p-6 relative overflow-hidden ${isDark ? "bg-gradient-to-br from-[#1a1919] to-[#0f0f0f] border border-[#484847]/15" : "bg-gradient-to-br from-violet-50 to-slate-50 border border-violet-100"}`}>
                <div className="absolute right-0 top-0 w-48 h-48 bg-[#a27cff]/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Circle progress */}
                    <div className="relative w-24 h-24 shrink-0">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                            <circle cx="48" cy="48" r="40" fill="none" strokeWidth="8" stroke={isDark ? "#262626" : "#e2e8f0"} />
                            <circle
                                cx="48" cy="48" r="40" fill="none" strokeWidth="8"
                                stroke="url(#progressGrad)"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                                className="transition-all duration-1000"
                            />
                            <defs>
                                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#a27cff" />
                                    <stop offset="100%" stopColor="#6e3bd7" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className={`text-xl font-black ${textPrimary}`}>{progress}%</p>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-headline font-bold ${textPrimary}`}>
                            {progress < 50 ? "Get Started" : progress < 75 ? "Good Progress" : progress === 100 ? "Fully Verified" : "Almost There"}
                        </h3>
                        <p className={`text-sm mt-1 ${textVariant}`}>
                            {verifiedCount} of {totalDocs} documents verified. {totalDocs - verifiedCount} remaining.
                        </p>
                        <div className={`flex flex-wrap gap-2 mt-3`}>
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_UI.verified.badge}`}>
                                <CheckCircle2 size={10} /> {docs.filter(d => d.status === "verified").length} Verified
                            </span>
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_UI.pending.badge}`}>
                                <Clock size={10} /> {docs.filter(d => d.status === "pending").length} Pending
                            </span>
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_UI.not_uploaded.badge}`}>
                                <AlertCircle size={10} /> {docs.filter(d => d.status === "not_uploaded").length} Not Uploaded
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Documents */}
                <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                    <div className={`px-6 py-4 border-b flex items-center gap-3 ${divider}`}>
                        <div className="w-7 h-7 rounded-lg bg-[#a27cff]/10 flex items-center justify-center">
                            <ShieldCheck size={14} className="text-[#a27cff]" />
                        </div>
                        <h3 className={`font-headline font-bold ${textPrimary}`}>Document Upload</h3>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {docs.map(doc => {
                            const ui = STATUS_UI[doc.status];
                            return (
                                <div key={doc.id} className={`p-5 flex items-center gap-4 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/50"}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`}>
                                        <span className={doc.status === "verified" ? "text-emerald-400" : doc.status === "pending" ? "text-amber-400" : textVariant}>
                                            {doc.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className={`text-sm font-bold ${textPrimary}`}>{doc.label}</p>
                                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${ui.badge}`}>
                                                {ui.icon} {ui.label}
                                            </span>
                                        </div>
                                        <p className={`text-xs ${textVariant}`}>{doc.description}</p>
                                    </div>
                                    {doc.status === "not_uploaded" && (
                                        <button
                                            onClick={() => handleUpload(doc.id)}
                                            disabled={uploadingId === doc.id}
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#a27cff]/10 text-[#a27cff] text-xs font-bold hover:bg-[#a27cff]/20 transition-colors disabled:opacity-60"
                                        >
                                            {uploadingId === doc.id ? (
                                                <span className="w-3 h-3 border-2 border-[#a27cff]/30 border-t-[#a27cff] rounded-full animate-spin" />
                                            ) : (
                                                <Upload size={13} />
                                            )}
                                            Upload
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Personal Info */}
                <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                    <div className={`px-6 py-4 border-b flex items-center gap-3 ${divider}`}>
                        <div className="w-7 h-7 rounded-lg bg-[#699cff]/10 flex items-center justify-center">
                            <User size={14} className="text-[#699cff]" />
                        </div>
                        <h3 className={`font-headline font-bold ${textPrimary}`}>Personal Information</h3>
                    </div>
                    <div className="p-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <img
                                    src={mockTenantProfile.avatarUrl}
                                    alt={mockTenantProfile.name}
                                    className="w-16 h-16 rounded-2xl object-cover"
                                />
                                <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#a27cff] flex items-center justify-center shadow-lg hover:bg-[#9066ee] transition-colors">
                                    <Camera size={13} className="text-white" />
                                </button>
                            </div>
                            <div>
                                <p className={`font-bold ${textPrimary}`}>{mockTenantProfile.name}</p>
                                <p className={`text-xs ${textVariant}`}>Member since {mockTenantProfile.joinedDate}</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#a27cff]/10 text-[#a27cff] mt-1 inline-block">
                                    {mockTenantProfile.tier} Tier
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {personalFields.map((field, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl ${surfaceMid}`}>
                                    <span className={textVariant}>{field.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[10px] uppercase tracking-widest ${textVariant}`}>{field.label}</p>
                                        <p className={`text-sm font-medium mt-0.5 truncate ${textPrimary}`}>{field.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {uploadSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-400/90 backdrop-blur-sm text-black font-bold text-sm shadow-2xl z-50"
                    >
                        <CheckCircle2 size={18} />
                        Document submitted for review!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
