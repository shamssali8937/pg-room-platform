"use client";

import { useState, useRef, useEffect } from "react";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { hydrateAuth } from "@/store/slices/authSlice";
import { Camera, BadgeCheck, Mail, Smartphone, IdCard, CheckCircle2, Edit, X, UploadCloud, Loader2, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function OwnerSettingsPage() {
    const { isDark } = useOwnerTheme();
    const { user } = useAuth();
    const dispatch = useAppDispatch();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [docUploadSuccess, setDocUploadSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const [profileImage, setProfileImage] = useState<string>("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    
    const [docFileName, setDocFileName] = useState<string | null>(null);
    const [docFile, setDocFile] = useState<File | null>(null);
    const [identityStatus, setIdentityStatus] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        full_name: "",
        mobile_number: "",
        city: "",
    });

    const [cardData, setCardData] = useState({
        card_number: "",
        card_expiry: "",
        card_cvv: "",
        card_holder: "",
    });
    const [isSavingCard, setIsSavingCard] = useState(false);
    const [cardSaveSuccess, setCardSaveSuccess] = useState(false);

    const fetchDocuments = async () => {
        try {
            const { data } = await api.get("/users/me/documents");
            const idDoc = data.data?.find((d: any) => d.doc_type === "identity");
            if (idDoc) {
                setIdentityStatus(idDoc.status);
            } else {
                setIdentityStatus(null);
            }
        } catch (err) {
            console.error("Failed to load documents", err);
        }
    };

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name ?? "",
                mobile_number: user.mobile_number ?? "",
                city: user.city ?? "",
            });
            setProfileImage(user.profile_photo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name ?? "U")}&background=ba9eff&color=fff`);
            setCardData({
                card_number: (user as any).card_number ?? "",
                card_expiry: (user as any).card_expiry ?? "",
                card_cvv: (user as any).card_cvv ?? "",
                card_holder: (user as any).card_holder ?? "",
            });
            fetchDocuments();
        }
    }, [user]);

    const handleSaveCard = async () => {
        setIsSavingCard(true);
        try {
            await api.patch("/users/me/card", cardData);
            setCardSaveSuccess(true);
            dispatch(hydrateAuth());
            setTimeout(() => setCardSaveSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to save card", err);
        } finally {
            setIsSavingCard(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately, do NOT upload to backend yet
        const previewUrl = URL.createObjectURL(file);
        setProfileImage(previewUrl);
        setAvatarFile(file);
    };

    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setDocFileName(file.name);
            setDocFile(file);
            setDocUploadSuccess(false);
        }
    };

    const handleDocSubmit = async () => {
        if (!docFile) { setIsVerifyOpen(false); return; }
        setIsUploadingDoc(true);
        try {
            const form = new FormData();
            form.append("file", docFile);
            form.append("doc_type", "identity");
            await api.post("/users/me/documents", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setDocUploadSuccess(true);
            setDocFileName(null);
            setDocFile(null);
            await fetchDocuments(); // Reload documents to get latest status
            setTimeout(() => { setIsVerifyOpen(false); setDocUploadSuccess(false); }, 2000);
        } catch (err: any) {
            console.error("Document upload failed", err);
        } finally {
            setIsUploadingDoc(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            const form = new FormData();
            form.append("full_name", formData.full_name);
            form.append("mobile_number", formData.mobile_number);
            form.append("city", formData.city);
            if (avatarFile) {
                form.append("image", avatarFile);
            }

            await api.patch("/users/me", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            dispatch(hydrateAuth());
            setAvatarFile(null);
            setIsEditing(false);
        } catch (err: any) {
            setSaveError(err.message ?? "Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313]" : "bg-white shadow-sm border border-slate-200";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-200";
    const ghostBorder = isDark ? "border border-[#484847]/15" : "border-none";

    const inputBg = isDark
        ? `border-none text-white focus:ring-2 focus:ring-[#ba9eff]/40 transition-all ${isEditing ? "bg-[#131313]" : "bg-transparent px-0"}`
        : `border text-slate-900 focus:ring-2 focus:ring-violet-400 transition-all ${isEditing ? "bg-white border-slate-200 px-4" : "bg-transparent border-transparent px-0"}`;

    const primaryColor = isDark ? "text-[#ba9eff]" : "text-violet-600";
    const secondaryColor = isDark ? "text-[#699cff]" : "text-blue-600";
    const tertiaryColor = isDark ? "text-[#ff97b5]" : "text-pink-600";
    const uploadArea = isDark ? "bg-[#201f1f] border-dashed border-white/10 hover:border-[#ba9eff]/50" : "bg-slate-50 border-dashed border-slate-300 hover:border-violet-400";
    const modalBg = isDark ? "bg-[#131313] border-white/[0.08]" : "bg-white border-slate-200";

    return (
        <div className="max-w-6xl mx-auto xl:px-8 relative">
            {/* Hero Header */}
            <section className="mb-12 lg:mb-16 flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
                <div className={`relative group shrink-0 ${isEditing ? "cursor-pointer" : ""}`} onClick={() => isEditing && fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <div className="h-28 w-28 md:h-32 md:w-32 rounded-3xl overflow-hidden shadow-2xl relative">
                        <img
                            src={profileImage || `https://ui-avatars.com/api/?name=Owner&background=ba9eff&color=fff`}
                            alt="Owner Profile"
                            className={`h-full w-full object-cover transition-transform duration-500 ${isEditing ? "group-hover:scale-110" : ""}`}
                        />
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                                <Camera className="text-white transform scale-75 group-hover:scale-100 transition-transform duration-300" size={28} />
                            </div>
                        )}
                    </div>
                    {user?.verification_status === "verified" && (
                        <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-xl shadow-lg border-4 ${isDark ? "bg-[#ba9eff] border-[#0e0e0e]" : "bg-violet-500 border-slate-50"}`}>
                            <BadgeCheck className={isDark ? "text-[#39008c]" : "text-white"} size={20} fill="currentColor" />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h2 className={`text-3xl md:text-4xl font-headline font-extrabold tracking-tight mb-2 ${textPrimary}`}>{user?.full_name ?? "Your Name"}</h2>
                    <p className={`text-base md:text-lg max-w-xl ${textVariant}`}>
                        {user?.city ? `Based in ${user.city}. ` : ""}Property owner on PG Nexus.
                    </p>
                    {saveError && <p className="text-red-400 text-sm mt-2">{saveError}</p>}
                </div>

                <div className="flex space-x-3 md:space-x-4 mt-6 md:mt-0 w-full md:w-auto">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => { setIsEditing(false); setSaveError(null); setAvatarFile(null); setProfileImage(user?.profile_photo_url ?? ""); }}
                                className={`flex-1 md:flex-none px-6 py-3 md:py-2.5 rounded-xl border hover:opacity-80 transition-colors font-headline font-bold text-xs md:text-sm tracking-tight uppercase cursor-pointer ${isDark ? "border-[#484847] text-white" : "border-slate-300 text-slate-700"}`}
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 md:flex-none px-8 py-3 md:py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-headline font-bold text-xs md:text-sm tracking-tight uppercase shadow-[0_0_20px_rgba(138,92,246,0.4)] hover:brightness-110 transition-all disabled:opacity-70 flex items-center gap-2 justify-center cursor-pointer"
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 md:flex-none px-8 py-3 md:py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-headline font-bold text-xs md:text-sm tracking-tight uppercase shadow-[0_0_20px_rgba(138,92,246,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Edit size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </section>

            {/* Bento Grid Settings */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Verification Status Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`col-span-12 md:col-span-5 lg:col-span-4 rounded-3xl p-6 md:p-8 space-y-8 ${surfaceLow} ${ghostBorder}`}>
                    <div>
                        <h3 className={`text-xs md:text-sm font-headline font-bold uppercase tracking-widest mb-6 ${primaryColor}`}>Verification Tiers</h3>
                        <div className="space-y-6">

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${surfaceHigh}`}>
                                        <Mail className={primaryColor} size={20} />
                                    </div>
                                    <div className="truncate pr-4">
                                        <p className={`text-sm font-bold ${textPrimary}`}>Email Address</p>
                                        <p className={`text-xs truncate ${textVariant}`}>{user?.email ?? "—"}</p>
                                    </div>
                                </div>
                                {user?.email_verified_at
                                    ? <CheckCircle2 className={primaryColor} size={20} fill="currentColor" />
                                    : <span className="text-xs text-amber-400 font-bold">Unverified</span>
                                }
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${surfaceHigh}`}>
                                        <Smartphone className={primaryColor} size={20} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${textPrimary}`}>Mobile Device</p>
                                        <p className={`text-xs ${textVariant}`}>{user?.mobile_number ?? "Not set"}</p>
                                    </div>
                                </div>
                                {user?.mobile_verified_at
                                    ? <CheckCircle2 className={primaryColor} size={20} fill="currentColor" />
                                    : <span className="text-xs text-amber-400 font-bold">Unverified</span>
                                }
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${surfaceHigh}`}>
                                        <IdCard className={primaryColor} size={20} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${textPrimary}`}>Identity Doc</p>
                                        <p className={`text-xs ${textVariant}`}>Passport / License</p>
                                        {identityStatus && (
                                            <p className={`text-xs mt-1 font-bold ${
                                                (identityStatus === "verified" || identityStatus === "approved") ? "text-emerald-400" :
                                                identityStatus === "rejected" ? "text-red-400" : "text-amber-400 animate-pulse"
                                            }`}>
                                                {(identityStatus === "verified" || identityStatus === "approved") ? "Verified" :
                                                 identityStatus === "rejected" ? "Rejected" : "Under Review by Admin"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {(!identityStatus || identityStatus === "rejected") && (
                                    <button
                                        onClick={() => setIsVerifyOpen(true)}
                                        className={`text-[10px] md:text-xs font-bold uppercase tracking-tighter underline decoration-2 underline-offset-4 transition-opacity cursor-pointer ${secondaryColor} hover:opacity-80`}
                                    >
                                        Upload
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`pt-6 border-t ${isDark ? "border-white/5" : "border-slate-100"}`}>
                        <div className={`rounded-2xl p-4 ${isDark ? "bg-[#ba9eff]/10" : "bg-violet-50"}`}>
                            <p className={`text-xs leading-relaxed ${primaryColor}`}>
                                Complete identity verification to unlock <strong>Elite Curator</strong> status and lower commission rates.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Profile Details Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`col-span-12 md:col-span-7 lg:col-span-8 rounded-3xl p-6 md:p-8 space-y-8 ${surfaceHigh}`}>
                    <h3 className={`text-xs md:text-sm font-headline font-bold uppercase tracking-widest mb-2 ${secondaryColor}`}>Personal Identity</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                            <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Full Legal Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                                disabled={!isEditing}
                                className={`w-full rounded-xl py-3 text-sm outline-none ${inputBg}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Phone Number</label>
                            <input
                                type="text"
                                value={formData.mobile_number}
                                onChange={(e) => setFormData((p) => ({ ...p, mobile_number: e.target.value }))}
                                disabled={!isEditing}
                                className={`w-full rounded-xl py-3 text-sm outline-none ${inputBg}`}
                                placeholder="+92 3xx xxxxxxx"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                                disabled={!isEditing}
                                placeholder="Your city"
                                className={`w-full rounded-xl py-3 text-sm outline-none ${inputBg}`}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* General Information */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`col-span-12 lg:col-span-7 rounded-3xl p-6 md:p-8 relative overflow-hidden ${surfaceLow} ${ghostBorder}`}>
                    <div className="relative z-10">
                        <h3 className={`text-xs md:text-sm font-headline font-bold uppercase tracking-widest mb-8 ${tertiaryColor}`}>Account Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Contact Email</label>
                                    <p className={`text-base md:text-lg font-headline font-bold py-2 ${textPrimary}`}>{user?.email ?? "—"}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Account Role</label>
                                    <p className={`text-base md:text-lg font-headline font-bold py-2 capitalize ${textPrimary}`}>{user?.role ?? "owner"}</p>
                                </div>
                            </div>

                            <div className="space-y-6 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Account Status</label>
                                    <p className={`text-base md:text-lg font-headline font-bold py-2 capitalize ${textPrimary}`}>{user?.account_status ?? "active"}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Member Since</label>
                                    <p className={`text-sm py-2 ${textVariant}`}>
                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -mr-20 -mt-20 ${isDark ? "bg-[#ff97b5]/5" : "bg-pink-400/10"}`}></div>
                </motion.div>

                {/* Notification Preferences */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`col-span-12 lg:col-span-5 rounded-3xl p-6 md:p-8 ${surfaceLow} ${ghostBorder}`}>
                    <h3 className={`text-xs md:text-sm font-headline font-bold uppercase tracking-widest mb-8 ${textVariant}`}>Notifications</h3>

                    <div className="space-y-6 md:space-y-8">
                        {[
                            { label: "Instant Inquiry Alerts", sub: "Push notifications for new property leads", defaultChecked: true },
                            { label: "Market Intelligence", sub: "Weekly reports on local pricing trends", defaultChecked: true },
                            { label: "Email Digest", sub: "Summary of account activity every 24h", defaultChecked: false },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between gap-4">
                                <div>
                                    <p className={`text-sm font-bold ${textPrimary}`}>{item.label}</p>
                                    <p className={`text-xs mt-1 ${textVariant}`}>{item.sub}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                                    <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDark ? "bg-[#201f1f] peer-checked:bg-[#ba9eff]" : "bg-slate-200 peer-checked:bg-violet-500"}`}></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Debit Card Settings / Payment Method */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`col-span-12 rounded-3xl p-6 md:p-8 ${surfaceLow} ${ghostBorder} relative overflow-hidden`}
                >
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-6 space-y-6">
                            <div>
                                <h3 className={`text-xs md:text-sm font-headline font-bold uppercase tracking-widest mb-2 ${secondaryColor}`}>Payment Method</h3>
                                <h2 className={`text-xl font-bold font-display ${textPrimary}`}>Mock Debit Card Details</h2>
                                <p className={`text-xs mt-1 ${textVariant}`}>
                                    Attach a debit card to acquire curator points. Transactions are securely simulated in developer mode. Your mock balance starts at <strong>PKR {((user as any)?.balance ?? 100000).toLocaleString()}</strong>.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[9px] font-bold uppercase tracking-wider ml-1 ${textVariant}`}>Cardholder Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={cardData.card_holder}
                                        onChange={(e) => setCardData((p) => ({ ...p, card_holder: e.target.value }))}
                                        className={`w-full rounded-xl py-2.5 px-4 text-xs outline-none ${
                                            isDark ? "bg-[#201f1f] text-white border-none focus:ring-1 focus:ring-[#ba9eff]" : "bg-slate-50 text-slate-900 border border-slate-200 focus:ring-1 focus:ring-violet-400"
                                        }`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[9px] font-bold uppercase tracking-wider ml-1 ${textVariant}`}>Card Number</label>
                                    <input
                                        type="text"
                                        placeholder="4242 •••• •••• 4242"
                                        maxLength={19}
                                        value={cardData.card_number}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, "");
                                            let formatted = val.match(/.{1,4}/g)?.join(" ") ?? val;
                                            setCardData((p) => ({ ...p, card_number: formatted }));
                                        }}
                                        className={`w-full rounded-xl py-2.5 px-4 text-xs outline-none ${
                                            isDark ? "bg-[#201f1f] text-white border-none focus:ring-1 focus:ring-[#ba9eff]" : "bg-slate-50 text-slate-900 border border-slate-200 focus:ring-1 focus:ring-violet-400"
                                        }`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[9px] font-bold uppercase tracking-wider ml-1 ${textVariant}`}>Expiration Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        value={cardData.card_expiry}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, "");
                                            if (val.length > 2) {
                                                val = val.substring(0, 2) + "/" + val.substring(2, 4);
                                            }
                                            setCardData((p) => ({ ...p, card_expiry: val }));
                                        }}
                                        className={`w-full rounded-xl py-2.5 px-4 text-xs outline-none ${
                                            isDark ? "bg-[#201f1f] text-white border-none focus:ring-1 focus:ring-[#ba9eff]" : "bg-slate-50 text-slate-900 border border-slate-200 focus:ring-1 focus:ring-violet-400"
                                        }`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[9px] font-bold uppercase tracking-wider ml-1 ${textVariant}`}>CVV Security Code</label>
                                    <input
                                        type="password"
                                        placeholder="•••"
                                        maxLength={3}
                                        value={cardData.card_cvv}
                                        onChange={(e) => setCardData((p) => ({ ...p, card_cvv: e.target.value.replace(/\D/g, "") }))}
                                        className={`w-full rounded-xl py-2.5 px-4 text-xs outline-none ${
                                            isDark ? "bg-[#201f1f] text-white border-none focus:ring-1 focus:ring-[#ba9eff]" : "bg-slate-50 text-slate-900 border border-slate-200 focus:ring-1 focus:ring-violet-400"
                                        }`}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                                    <BadgeCheck className="text-emerald-400" size={14} /> Mock bank connection active
                                </span>
                                <button
                                    onClick={handleSaveCard}
                                    disabled={isSavingCard}
                                    className={`px-6 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                        cardSaveSuccess
                                            ? "bg-emerald-500 text-white"
                                            : isDark
                                            ? "bg-white text-slate-900 hover:bg-[#ba9eff] hover:text-white"
                                            : "bg-slate-900 text-white hover:bg-violet-600"
                                    }`}
                                >
                                    {isSavingCard ? <Loader2 size={12} className="animate-spin" /> : null}
                                    {cardSaveSuccess ? "Card Saved Successfully!" : "Attach debit card"}
                                </button>
                            </div>
                        </div>

                        {/* Glassmorphic Card Preview */}
                        <div className="lg:col-span-6 flex justify-center items-center">
                            <div className="w-[340px] h-[200px] rounded-2xl p-6 relative overflow-hidden bg-gradient-to-tr from-violet-600/90 via-purple-600/80 to-blue-500/70 border border-white/20 shadow-2xl flex flex-col justify-between text-white shrink-0">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent)]" />
                                <div className="flex justify-between items-start z-10">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">PG Room Platform</p>
                                        <p className="text-xs font-semibold opacity-60">DEBIT CARD</p>
                                    </div>
                                    <CreditCard size={28} className="opacity-90" />
                                </div>

                                <div className="z-10">
                                    <p className="text-lg font-mono font-medium tracking-[0.25em]">
                                        {cardData.card_number || "•••• •••• •••• ••••"}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end z-10">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest opacity-50">Cardholder</p>
                                        <p className="text-xs font-bold font-headline truncate max-w-[160px]">
                                            {cardData.card_holder || "YOUR LEGAL NAME"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] uppercase tracking-widest opacity-50">Expires</p>
                                        <p className="text-xs font-bold font-mono">
                                            {cardData.card_expiry || "MM/YY"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Verification Modal */}
            <AnimatePresence>
                {isVerifyOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => !isUploadingDoc && setIsVerifyOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-md border rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 ${modalBg}`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-bold ${textPrimary}`}>Identity Verification</h3>
                                <button onClick={() => setIsVerifyOpen(false)} className={`p-2 rounded-full transition-colors cursor-pointer ${isDark ? "text-zinc-400 hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"}`}>
                                    <X size={20} />
                                </button>
                            </div>

                            <p className={`text-sm mb-6 ${textVariant}`}>
                                Upload a clear, legible copy of your valid Passport or National Identity Card to upgrade to Elite Curator status.
                            </p>

                            <input type="file" ref={docInputRef} className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocUpload} />

                            <div
                                onClick={() => docInputRef.current?.click()}
                                className={`w-full h-40 mb-3 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadArea}`}
                            >
                                <UploadCloud size={32} className={`mb-3 ${docUploadSuccess ? "text-emerald-500" : docFileName ? "text-[#ba9eff]" : isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                <p className={`text-sm font-bold ${textPrimary}`}>
                                    {docUploadSuccess ? "Submitted Successfully!" : docFileName ? "Document Selected" : "Upload Identity Document"}
                                </p>
                                <p className={`text-xs mt-1 ${docUploadSuccess ? "text-emerald-500" : docFileName ? "text-[#ba9eff]" : textVariant}`}>
                                    {docUploadSuccess ? "Under review by our team" : docFileName ?? "JPG, PNG or PDF (Max 5MB)"}
                                </p>
                            </div>

                            {/* Added requested informative text below the document upload card */}
                            <p className={`text-xs text-center mb-6 leading-relaxed ${textVariant}`}>
                                Once uploaded, your document will be securely submitted to our administration team for manual verification. Review typically takes 24-48 hours.
                            </p>

                            <button
                                onClick={handleDocSubmit}
                                disabled={isUploadingDoc || docUploadSuccess}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:brightness-110 transition-all disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isUploadingDoc ? <Loader2 size={14} className="animate-spin" /> : null}
                                {isUploadingDoc ? "Uploading..." : docUploadSuccess ? "Submitted for Review" : docFileName ? "Submit for Review" : "Cancel"}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
