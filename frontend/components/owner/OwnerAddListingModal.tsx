"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, MapPin, Building, Info, BedDouble, Bath, FileText, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { useAppDispatch } from "@/store/hooks";
import { createRoom } from "@/store/slices/roomSlice";

interface OwnerAddListingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ALL_AMENITIES = ["WiFi", "AC", "Parking", "Kitchen", "Pool", "Gym", "CCTV", "Power Backup", "Study Room", "Breakfast", "Housekeeping", "Laundry", "Terrace", "Concierge"];
const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Hyderabad"];

const INITIAL_FORM = {
    title: "",
    address: "",
    city: "Lahore",
    price: "",
    price_unit: "month",
    room_type: "Private Room",
    beds: "1",
    baths: "1",
    sqft: "",
    description: "",
    amenities: [] as string[],
    gender_preference: "any",
    locality: "",
    landmark: "",
    furnished_status: "unfurnished",
    security_deposit_amount: "0",
    available_for: "any",
    availability_date: "",
};

export default function OwnerAddListingModal({ isOpen, onClose }: OwnerAddListingModalProps) {
    const { isDark } = useOwnerTheme();
    const dispatch = useAppDispatch();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState(INITIAL_FORM);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const modalBg = isDark ? "bg-[#131313] border-white/[0.08]" : "bg-white border-slate-200";
    const titleColor = isDark ? "text-white" : "text-slate-900";
    const subText = isDark ? "text-zinc-400" : "text-slate-500";
    const inputBg = isDark
        ? "bg-[#201f1f] border border-white/[0.04] text-white focus:border-[#ba9eff] focus:ring-1 focus:ring-[#ba9eff]"
        : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500";
    const inputLabel = isDark ? "text-zinc-500" : "text-slate-600";
    const uploadArea = isDark ? "bg-[#201f1f] border-dashed border-white/10 hover:border-[#ba9eff]/50" : "bg-slate-50 border-dashed border-slate-300 hover:border-violet-400";
    const closeBtnBg = isDark ? "bg-[#201f1f] border-white/5 text-zinc-400 hover:bg-[#2c2c2c]" : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200";
    const chipBg = isDark ? "bg-[#201f1f] border-white/[0.04] text-zinc-300 hover:border-[#ba9eff]/30" : "bg-slate-100 border-slate-200 text-slate-700 hover:border-violet-300";
    const chipActiveBg = isDark ? "bg-[#ba9eff]/10 border-[#ba9eff]/50 text-[#ba9eff]" : "bg-violet-50 border-violet-500 text-violet-700";

    const setField = (field: keyof typeof INITIAL_FORM, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const toggleAmenity = (a: string) => {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(a)
                ? prev.amenities.filter((i) => i !== a)
                : [...prev.amenities, a],
        }));
    };

    const handleImageSelect = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).slice(0, 10 - images.length);
        const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
        setImages((prev) => [...prev, ...newFiles]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeImage = (idx: number) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
        setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!form.title || !form.city || !form.address || !form.price) {
                setSubmitError("Please fill all required fields in step 1");
                return;
            }
        }
        setSubmitError("");
        setStep((s) => Math.min(s + 1, 3));
    };

    const prevStep = () => {
        setSubmitError("");
        setStep((s) => Math.max(s - 1, 1));
    };

    const handleSubmit = async () => {
        if (!form.title || !form.price) {
            setSubmitError("Please fill in the required fields");
            return;
        }

        if (images.length < 3) {
            setSubmitError("You must upload at least 3 photos for your room listing.");
            return;
        }

        if (images.length > 10) {
            setSubmitError("You cannot upload more than 10 photos for your room listing.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("address", form.address);
            formData.append("city", form.city);
            formData.append("price", form.price);
            formData.append("price_unit", form.price_unit);
            formData.append("room_type", form.room_type);
            formData.append("beds", form.beds);
            formData.append("baths", form.baths);
            formData.append("description", form.description);
            formData.append("gender_preference", form.gender_preference);
            if (form.sqft) formData.append("sqft", form.sqft);
            formData.append("locality", form.locality);
            formData.append("landmark", form.landmark);
            formData.append("furnished_status", form.furnished_status);
            formData.append("security_deposit_amount", form.security_deposit_amount);
            formData.append("available_for", form.available_for);
            formData.append("availability_date", form.availability_date || new Date().toISOString().split('T')[0]);
            form.amenities.forEach((a) => formData.append("amenities[]", a));
            images.forEach((img) => formData.append("images", img));

            const result = await dispatch(createRoom(formData));

            if (createRoom.fulfilled.match(result)) {
                setSubmitSuccess(true);
                setTimeout(() => {
                    setSubmitSuccess(false);
                    setStep(1);
                    setForm(INITIAL_FORM);
                    setImages([]);
                    setImagePreviews([]);
                    onClose();
                }, 1500);
            } else {
                setSubmitError((result.payload as string) ?? "Failed to create listing");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setForm(INITIAL_FORM);
        setImages([]);
        setImagePreviews([]);
        setSubmitError("");
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 20, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full max-w-2xl border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${modalBg}`}
                >
                    {/* Header */}
                    <div className={`p-6 sm:p-8 flex items-center justify-between border-b ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                        <div>
                            <h2 className={`text-2xl font-extrabold tracking-tight ${titleColor}`}>Add New Listing</h2>
                            <p className={`text-sm mt-1 ${subText}`}>
                                Step {step} of 3: {step === 1 ? "Basic Information" : step === 2 ? "Features & Description" : "Media & Submit"}
                            </p>
                        </div>
                        <button onClick={handleClose} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-zinc-400">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="w-full h-1 bg-black/5 dark:bg-white/5">
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
                            initial={{ width: "0%" }}
                            animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                        {submitSuccess && (
                            <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                                <CheckCircle2 size={18} />
                                <p className="text-sm font-bold">Listing submitted for review!</p>
                            </div>
                        )}
                        {submitError && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {submitError}
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {/* Step 1 */}
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                                    <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-[#ba9eff]" : "text-violet-600"} flex items-center gap-2`}>
                                        <Building size={16} /> Basic Information
                                    </h3>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Property Title *</label>
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setField("title", e.target.value)}
                                            placeholder="e.g. Executive 2BR Apartment"
                                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>City *</label>
                                            <select
                                                value={form.city}
                                                onChange={(e) => setField("city", e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                            >
                                                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Room Type *</label>
                                            <select
                                                value={form.room_type}
                                                onChange={(e) => setField("room_type", e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                            >
                                                <option>Private Room</option>
                                                <option>Shared Room</option>
                                                <option>Entire Apartment</option>
                                                <option>Studio Apartment</option>
                                                <option>Entire Villa</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Furnished Status *</label>
                                            <select
                                                value={form.furnished_status}
                                                onChange={(e) => setField("furnished_status", e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                            >
                                                <option value="unfurnished">Unfurnished</option>
                                                <option value="semi-furnished">Semi-Furnished</option>
                                                <option value="furnished">Fully Furnished</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Full Address *</label>
                                        <div className="relative">
                                            <MapPin size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                            <input
                                                type="text"
                                                value={form.address}
                                                onChange={(e) => setField("address", e.target.value)}
                                                placeholder="e.g. House 12, Block A, DHA Phase 6"
                                                className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Locality (Neighborhood)</label>
                                            <input
                                                type="text"
                                                value={form.locality}
                                                onChange={(e) => setField("locality", e.target.value)}
                                                placeholder="e.g. DHA Phase 6"
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Landmark (Optional)</label>
                                            <input
                                                type="text"
                                                value={form.landmark}
                                                onChange={(e) => setField("landmark", e.target.value)}
                                                placeholder="e.g. Near Raya Club"
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Monthly Rent *</label>
                                            <div className="relative">
                                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold select-none ${isDark ? "text-zinc-500" : "text-slate-400"}`}>Rs.</span>
                                                <input
                                                    type="number"
                                                    value={form.price}
                                                    onChange={(e) => setField("price", e.target.value)}
                                                    placeholder="45000"
                                                    className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Security Deposit (PKR)</label>
                                            <div className="relative">
                                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold select-none ${isDark ? "text-zinc-500" : "text-slate-400"}`}>Rs.</span>
                                                <input
                                                    type="number"
                                                    value={form.security_deposit_amount}
                                                    onChange={(e) => setField("security_deposit_amount", e.target.value)}
                                                    placeholder="45000"
                                                    className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Beds *</label>
                                            <div className="relative">
                                                <BedDouble size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={form.beds}
                                                    onChange={(e) => setField("beds", e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Baths *</label>
                                            <div className="relative">
                                                <Bath size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={form.baths}
                                                    onChange={(e) => setField("baths", e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Area (sq ft)</label>
                                            <input
                                                type="number"
                                                value={form.sqft}
                                                onChange={(e) => setField("sqft", e.target.value)}
                                                placeholder="800"
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Gender Preference</label>
                                            <select
                                                value={form.gender_preference}
                                                onChange={(e) => setField("gender_preference", e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                            >
                                                <option value="any">Any</option>
                                                <option value="male">Male Only</option>
                                                <option value="female">Female Only</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Available For</label>
                                            <select
                                                value={form.available_for}
                                                onChange={(e) => setField("available_for", e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                            >
                                                <option value="any">Any</option>
                                                <option value="students">Students Only</option>
                                                <option value="professionals">Professionals Only</option>
                                                <option value="families">Families Only</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Availability Date</label>
                                        <input
                                            type="date"
                                            value={form.availability_date}
                                            onChange={(e) => setField("availability_date", e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2 */}
                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                    <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-[#ba9eff]" : "text-violet-600"} flex items-center gap-2`}>
                                        <Info size={16} /> Features & Description
                                    </h3>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Property Description</label>
                                        <textarea
                                            rows={4}
                                            value={form.description}
                                            onChange={(e) => setField("description", e.target.value)}
                                            placeholder="Describe the property features, nearby amenities, house rules, etc."
                                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all resize-none ${inputBg}`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-3 ${inputLabel}`}>
                                            Included Amenities {form.amenities.length > 0 && <span className={isDark ? "text-[#ba9eff]" : "text-violet-600"}>({form.amenities.length} selected)</span>}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {ALL_AMENITIES.map((amenity) => {
                                                const isActive = form.amenities.includes(amenity);
                                                return (
                                                    <button
                                                        key={amenity}
                                                        onClick={() => toggleAmenity(amenity)}
                                                        className={`px-4 py-2 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${isActive ? chipActiveBg : chipBg}`}
                                                    >
                                                        {isActive && <CheckCircle2 size={14} />} {amenity}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3 */}
                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                    <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-[#ba9eff]" : "text-violet-600"} flex items-center gap-2`}>
                                        <ShieldCheck size={16} /> Media & Review
                                    </h3>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>
                                            Property Photos (Max 5) — {images.length} selected
                                        </label>
                                        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e) => handleImageSelect(e.target.files)} className="hidden" />
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`w-full h-32 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadArea}`}
                                        >
                                            <UploadCloud size={28} className={`mb-2 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                            <p className={`text-sm font-medium ${titleColor}`}>Click to upload images</p>
                                            <p className={`text-xs mt-1 ${subText}`}>PNG, JPG up to 5MB each</p>
                                        </div>

                                        {imagePreviews.length > 0 && (
                                            <div className="flex gap-2 mt-3 flex-wrap">
                                                {imagePreviews.map((src, i) => (
                                                    <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden group">
                                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => removeImage(i)}
                                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                        >
                                                            <X size={16} className="text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Summary */}
                                    <div className={`rounded-xl p-5 space-y-2 ${isDark ? "bg-[#201f1f]" : "bg-slate-50"}`}>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${subText}`}>Listing Summary</p>
                                        {[
                                            { label: "Title", value: form.title },
                                            { label: "City", value: form.city },
                                            { label: "Rent", value: `PKR ${Number(form.price).toLocaleString()}/mo` },
                                            { label: "Type", value: form.room_type },
                                            { label: "Beds/Baths", value: `${form.beds} Beds · ${form.baths} Baths` },
                                            { label: "Amenities", value: `${form.amenities.length} selected` },
                                        ].map((item) => (
                                            <div key={item.label} className="flex justify-between items-center">
                                                <span className={`text-xs ${subText}`}>{item.label}</span>
                                                <span className={`text-xs font-bold ${titleColor}`}>{item.value || "—"}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className={`p-6 sm:p-8 border-t flex justify-between items-center ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                        {step > 1 ? (
                            <button onClick={prevStep} className={`py-3 px-6 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${closeBtnBg}`}>
                                Back
                            </button>
                        ) : (
                            <button onClick={handleClose} className={`py-3 px-6 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${closeBtnBg}`}>
                                Cancel
                            </button>
                        )}

                        {step < 3 ? (
                            <button onClick={nextStep} className="py-3 px-8 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_-4px_rgba(138,92,246,0.5)]">
                                Next Step
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="py-3 px-8 bg-gradient-to-r from-[#ba9eff] to-[#39008c] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_-4px_rgba(186,158,255,0.4)] disabled:opacity-60 flex items-center gap-2"
                            >
                                {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : "Submit Listing"}
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
