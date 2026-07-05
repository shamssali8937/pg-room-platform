"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
    ShieldCheck, Upload, CheckCircle2, AlertCircle, Clock,
    User, Mail, Phone, Building2, FileText, Camera, Edit2, Check, X as CloseIcon
} from "lucide-react";
import api from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { hydrateAuth } from "@/store/slices/authSlice";

type VerifyStatus = "verified" | "pending" | "not_uploaded";

interface DocItem {
    id: string;
    label: string;
    description: string;
    status: VerifyStatus;
    icon: React.ReactNode;
}

const INITIAL_DOCS: DocItem[] = [
    { id: "cnic", label: "CNIC (Front & Back)", description: "Pakistan national identity card, both sides", status: "not_uploaded", icon: <FileText size={18} /> },
    { id: "photo", label: "Selfie with CNIC", description: "Clear photo holding your CNIC next to your face", status: "not_uploaded", icon: <Camera size={18} /> },
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
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Profile edit states
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        mobile_number: "",
        city: "Lahore",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name ?? "",
                mobile_number: user.mobile_number ?? "",
                city: user.city ?? "Lahore",
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const { data } = await api.get("/users/me/documents");
                if (data.success && data.data) {
                    const statusMap: Record<string, VerifyStatus> = {
                        verified: "verified",
                        pending: "pending",
                        approved: "verified",
                        rejected: "not_uploaded",
                    };
                    setDocs((prev) =>
                        prev.map((d) => {
                            const dbDoc = data.data.find((x: any) => x.doc_type === d.id);
                            return dbDoc ? { ...d, status: statusMap[dbDoc.status] ?? "pending" } : d;
                        })
                    );
                }
            } catch (err) {
                console.error("Failed to load documents", err);
            }
        };
        fetchDocs();
    }, []);

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceMid = isDark ? "bg-[#1a1919] border border-[#484847]/10" : "bg-slate-50 border border-slate-100";
    const divider = isDark ? "border-white/[0.06]" : "border-slate-100";

    const verifiedCount = docs.filter((d) => d.status === "verified").length;
    const totalDocs = docs.length;
    const progress = Math.round((verifiedCount / totalDocs) * 100);

    // Show email verified from real auth
    const emailVerified = !!user?.email_verified_at;
    const mobileVerified = !!user?.mobile_verified_at;

    const handleUploadClick = (docId: string) => {
        setActiveDocId(docId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeDocId) return;

        setUploadingId(activeDocId);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("doc_type", activeDocId);

            const { data } = await api.post("/users/me/documents", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (data.success) {
                setDocs((prev) =>
                    prev.map((d) => (d.id === activeDocId ? { ...d, status: "pending" } : d))
                );
                setUploadSuccess(activeDocId);
                setTimeout(() => setUploadSuccess(null), 3000);
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploadingId(null);
            setActiveDocId(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleAvatarClick = () => {
        avatarInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const form = new FormData();
            form.append("image", file);
            form.append("full_name", formData.full_name || user?.full_name || "");
            form.append("mobile_number", formData.mobile_number || user?.mobile_number || "");
            form.append("city", formData.city || user?.city || "Lahore");

            await api.patch("/users/me", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            dispatch(hydrateAuth());
            setUploadSuccess("profile_updated");
            setTimeout(() => setUploadSuccess(null), 3000);
        } catch (err) {
            console.error("Avatar upload failed", err);
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            const form = new FormData();
            form.append("full_name", formData.full_name);
            form.append("mobile_number", formData.mobile_number);
            form.append("city", formData.city);

            await api.patch("/users/me", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            dispatch(hydrateAuth());
            setIsEditing(false);
            setUploadSuccess("profile_updated");
            setTimeout(() => setUploadSuccess(null), 3000);
        } catch (err) {
            console.error("Save profile failed", err);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const joinDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Recently";

    const personalFields = [
        { icon: <User size={15} />, label: "Full Name", value: user?.full_name ?? "—" },
        { icon: <Mail size={15} />, label: "Email", value: user?.email ?? "—" },
        { icon: <Phone size={15} />, label: "Phone", value: user?.mobile_number ?? "Not added" },
        { icon: <Building2 size={15} />, label: "Role", value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Tenant" },
    ];

    const identityChecks = [
        { label: "Email Confirmed", done: emailVerified },
        { label: "Phone Verified", done: mobileVerified },
        { label: "Profile Complete", done: !!user?.full_name && !!user?.email },
    ];
    const identityScore = Math.round((identityChecks.filter((c) => c.done).length / identityChecks.length) * 100);

    return (
        <div className="max-w-[1000px] mx-auto space-y-6 pb-24 lg:pb-4 px-4 sm:px-0">
            {/* Header */}
            <header>
                <p className="text-[#a27cff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">Account Security</p>
                <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>Identity Verification</h2>
                <p className={`text-sm mt-1 ${textVariant}`}>Complete verification to access all platform features and build trust with landlords.</p>
            </header>

            {/* Verification Score */}
            <section className={`rounded-2xl p-5 sm:p-6 relative overflow-hidden ${isDark ? "bg-gradient-to-br from-[#1a1919] to-[#0f0f0f] border border-[#484847]/15" : "bg-gradient-to-br from-violet-50 to-slate-50 border border-violet-100"}`}>
                <div className="absolute right-0 top-0 w-48 h-48 bg-[#a27cff]/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                        <svg className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90" viewBox="0 0 96 96">
                            <circle cx="48" cy="48" r="40" fill="none" strokeWidth="8" stroke={isDark ? "#262626" : "#e2e8f0"} />
                            <circle
                                cx="48" cy="48" r="40" fill="none" strokeWidth="8"
                                stroke="url(#progressGrad)"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - identityScore / 100)}`}
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
                            <p className={`text-lg sm:text-xl font-black ${textPrimary}`}>{identityScore}%</p>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={`text-base sm:text-lg font-headline font-bold ${textPrimary}`}>
                            {identityScore < 50 ? "Get Started" : identityScore < 75 ? "Good Progress" : identityScore === 100 ? "Fully Verified" : "Almost There"}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {identityChecks.map((check, i) => (
                                <span
                                    key={i}
                                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${check.done ? STATUS_UI.verified.badge : STATUS_UI.not_uploaded.badge}`}
                                >
                                    {check.done ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />} {check.label}
                                </span>
                            ))}
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
                        {docs.map((doc) => {
                            const ui = STATUS_UI[doc.status];
                            return (
                                <div key={doc.id} className={`px-4 sm:px-5 py-4 flex flex-wrap items-start sm:items-center gap-3 sm:gap-4 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/50"}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-[#1a1919]" : "bg-slate-100"}`}>
                                        <span className={doc.status === "verified" ? "text-emerald-400" : doc.status === "pending" ? "text-amber-400" : textVariant}>
                                            {doc.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                            <p className={`text-sm font-bold ${textPrimary}`}>{doc.label}</p>
                                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${ui.badge}`}>
                                                {ui.icon} {ui.label}
                                            </span>
                                        </div>
                                        <p className={`text-xs ${textVariant}`}>{doc.description}</p>
                                    </div>
                                    {doc.status === "not_uploaded" && (
                                        <button
                                            onClick={() => handleUploadClick(doc.id)}
                                            disabled={uploadingId === doc.id}
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#a27cff]/10 text-[#a27cff] text-xs font-bold hover:bg-[#a27cff]/20 transition-colors disabled:opacity-60 whitespace-nowrap"
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
                    <div className={`px-6 py-4 border-b flex items-center justify-between gap-3 ${divider}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-[#699cff]/10 flex items-center justify-center">
                                <User size={14} className="text-[#699cff]" />
                            </div>
                            <h3 className={`font-headline font-bold ${textPrimary}`}>Personal Information</h3>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#a27cff]/20 text-[#a27cff] text-xs font-bold hover:bg-[#a27cff]/5 transition-colors"
                            >
                                <Edit2 size={12} /> Edit Info
                            </button>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="p-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    {user?.image ? (
                                        <img src={user.image} alt={user.full_name} className="w-16 h-16 rounded-2xl object-cover" />
                                    ) : (
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${isDark ? "bg-[#a27cff]/20 text-[#a27cff]" : "bg-violet-100 text-violet-600"}`}>
                                            {user?.full_name?.[0] ?? "?"}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleAvatarClick}
                                        className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#a27cff] flex items-center justify-center shadow-lg hover:bg-[#9066ee] transition-colors"
                                    >
                                        <Camera size={13} className="text-white" />
                                    </button>
                                </div>
                                <div>
                                    <p className={`font-bold ${textPrimary}`}>{user?.full_name ?? "Your Name"}</p>
                                    <p className={`text-xs ${textVariant}`}>Member since {joinDate}</p>
                                </div>
                            </div>

                            {/* Edit Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className={`text-[10px] uppercase tracking-widest font-bold ${textVariant}`}>Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className={`w-full mt-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${isDark ? "bg-[#1a1919] border-white/10 text-white focus:border-[#a27cff]" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-[#a27cff]"}`}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className={`text-[10px] uppercase tracking-widest font-bold ${textVariant}`}>Phone Number</label>
                                    <input
                                        type="text"
                                        value={formData.mobile_number}
                                        onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                                        className={`w-full mt-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${isDark ? "bg-[#1a1919] border-white/10 text-white focus:border-[#a27cff]" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-[#a27cff]"}`}
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSavingProfile}
                                        className="flex-1 py-3 bg-gradient-to-r from-[#a27cff] to-[#6e3bd7] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSavingProfile ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Check size={14} />
                                        )}
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className={`py-3 px-6 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${isDark ? "bg-[#201f1f] border-white/5 text-zinc-400 hover:bg-[#2c2c2c]" : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"}`}
                                    >
                                        <CloseIcon size={14} /> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    {user?.image ? (
                                        <img src={user.image} alt={user.full_name} className="w-16 h-16 rounded-2xl object-cover" />
                                    ) : (
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${isDark ? "bg-[#a27cff]/20 text-[#a27cff]" : "bg-violet-100 text-violet-600"}`}>
                                            {user?.full_name?.[0] ?? "?"}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleAvatarClick}
                                        className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#a27cff] flex items-center justify-center shadow-lg hover:bg-[#9066ee] transition-colors"
                                    >
                                        <Camera size={13} className="text-white" />
                                    </button>
                                </div>
                                <div>
                                    <p className={`font-bold ${textPrimary}`}>{user?.full_name ?? "Your Name"}</p>
                                    <p className={`text-xs ${textVariant}`}>Member since {joinDate}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {emailVerified && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400">
                                                Email Verified
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#a27cff]/10 text-[#a27cff]">
                                            {user?.role ?? "Tenant"}
                                        </span>
                                    </div>
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
                    )}
                </section>
            </div>

            {/* Hidden native file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
            />

            <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
            />

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
                        {uploadSuccess === "profile_updated" ? "Profile updated successfully!" : "Document submitted for review!"}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
