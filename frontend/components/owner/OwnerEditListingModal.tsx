"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, UploadCloud, MapPin, Building, DollarSign, BedDouble, Bath,
    FileText, CheckCircle2, Info, ShieldCheck, Edit3, Save
} from "lucide-react";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { type OwnerListing } from "./mockData";

interface OwnerEditListingModalProps {
    listing: OwnerListing | null;
    onClose: () => void;
    onSave?: (updated: OwnerListing) => void;
}

const ALL_AMENITIES = ["WiFi", "AC", "Parking", "Kitchen", "Pool", "Gym", "CCTV", "Power Backup", "Study Room", "Breakfast", "Housekeeping", "Laundry", "Terrace", "Concierge"];
const DOC_TYPES = ["CNIC Copy", "Property Deed", "Utility Bill"];

export default function OwnerEditListingModal({ listing, onClose, onSave }: OwnerEditListingModalProps) {
    const { isDark } = useOwnerTheme();
    const [step, setStep] = useState(1);

    // Pre-fill state from existing listing
    const [title, setTitle] = useState(listing?.title ?? "");
    const [location, setLocation] = useState(listing?.location ?? "");
    const [price, setPrice] = useState(String(listing?.price ?? ""));
    const [roomType, setRoomType] = useState(listing?.roomType ?? "Entire Apartment");
    const [beds, setBeds] = useState(String(listing?.beds ?? ""));
    const [baths, setBaths] = useState(String(listing?.baths ?? ""));
    const [description, setDescription] = useState(listing?.description ?? "");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(listing?.amenities ?? []);
    const [saved, setSaved] = useState(false);

    if (!listing) return null;

    // Theme tokens
    const modalBg = isDark ? "bg-[#131313] border-white/[0.08]" : "bg-white border-slate-200";
    const titleColor = isDark ? "text-white" : "text-slate-900";
    const subText = isDark ? "text-zinc-400" : "text-slate-500";
    const inputBg = isDark
        ? "bg-[#201f1f] border border-white/[0.06] text-white placeholder:text-zinc-600 focus:border-[#ba9eff]/60 focus:ring-1 focus:ring-[#ba9eff]/30"
        : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30";
    const inputLabel = isDark ? "text-zinc-500" : "text-slate-500";
    const uploadArea = isDark ? "bg-[#201f1f] border-dashed border-white/10 hover:border-[#ba9eff]/40" : "bg-slate-50 border-dashed border-slate-300 hover:border-violet-400";
    const closeBtnBg = isDark ? "bg-[#201f1f] border-white/5 text-zinc-400 hover:bg-[#2c2c2c]" : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200";
    const chipBg = isDark ? "bg-[#201f1f] border-white/[0.06] text-zinc-300 hover:border-[#ba9eff]/30" : "bg-slate-100 border-slate-200 text-slate-700 hover:border-violet-300";
    const chipActiveBg = isDark ? "bg-[#ba9eff]/10 border-[#ba9eff]/50 text-[#ba9eff]" : "bg-violet-50 border-violet-500 text-violet-700";

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    const toggleAmenity = (a: string) => setSelectedAmenities(prev => prev.includes(a) ? prev.filter(i => i !== a) : [...prev, a]);

    const handleSave = () => {
        if (onSave) {
            onSave({
                ...listing,
                title,
                location,
                price: Number(price),
                roomType,
                beds: Number(beds),
                baths: Number(baths),
                description,
                amenities: selectedAmenities,
            });
        }
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1200);
    };

    const stepLabels = ["Basic Info", "Features", "Media & Docs"];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[110] flex items-center justify-center p-4 sm:p-6"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 24, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 24, opacity: 0 }}
                    transition={{ type: "spring", damping: 26, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                    className={`w-full max-w-2xl border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] ${modalBg}`}
                >
                    {/* Header */}
                    <div className={`p-6 sm:p-7 flex items-start justify-between border-b ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Edit3 size={16} className="text-[#ba9eff]" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ba9eff]">Edit Listing</p>
                            </div>
                            <h2 className={`text-xl font-extrabold tracking-tight leading-tight ${titleColor}`}>{listing.title}</h2>
                            <p className={`text-xs mt-1 ${subText}`}>Step {step} of 3 — {stepLabels[step - 1]}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ml-4 ${isDark ? "bg-white/5 hover:bg-white/10 text-zinc-400" : "bg-slate-100 hover:bg-slate-200 text-slate-500"}`}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Step progress */}
                    <div className={`w-full h-0.5 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
                            initial={false}
                            animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                            transition={{ duration: 0.35 }}
                        />
                    </div>

                    {/* Step tabs */}
                    <div className={`flex border-b ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                        {stepLabels.map((label, i) => (
                            <button
                                key={label}
                                onClick={() => setStep(i + 1)}
                                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${step === i + 1
                                    ? isDark ? "text-[#ba9eff] border-b-2 border-[#ba9eff]" : "text-violet-600 border-b-2 border-violet-500"
                                    : subText
                                }`}
                            >
                                {i + 1}. {label}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable content */}
                    <div className="p-6 sm:p-7 overflow-y-auto flex-1">
                        <AnimatePresence mode="wait">

                            {/* ── Step 1: Basics ── */}
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="space-y-5">
                                    <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? "text-[#ba9eff]" : "text-violet-600"}`}>
                                        <Building size={14} /> Basic Information
                                    </h3>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Property Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            placeholder="e.g. Executive 2BR Apartment"
                                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Location</label>
                                        <div className="relative">
                                            <MapPin size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={e => setLocation(e.target.value)}
                                                placeholder="e.g. DHA Phase 6, Karachi"
                                                className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Monthly Rent (PKR)</label>
                                            <div className="relative">
                                                <DollarSign size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                                <input
                                                    type="number"
                                                    value={price}
                                                    onChange={e => setPrice(e.target.value)}
                                                    placeholder="85000"
                                                    className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Room Type</label>
                                            <div className="relative">
                                                <Building size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                                <select
                                                    value={roomType}
                                                    onChange={e => setRoomType(e.target.value)}
                                                    className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all appearance-none ${inputBg}`}
                                                >
                                                    <option>Private Room</option>
                                                    <option>Shared Room</option>
                                                    <option>Entire Apartment</option>
                                                    <option>Studio Apartment</option>
                                                    <option>Entire Villa</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Bedrooms</label>
                                            <div className="relative">
                                                <BedDouble size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                                <input
                                                    type="number"
                                                    value={beds}
                                                    onChange={e => setBeds(e.target.value)}
                                                    min="1"
                                                    className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Bathrooms</label>
                                            <div className="relative">
                                                <Bath size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                                <input
                                                    type="number"
                                                    value={baths}
                                                    onChange={e => setBaths(e.target.value)}
                                                    min="1"
                                                    className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Step 2: Features ── */}
                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-5">
                                    <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? "text-[#ba9eff]" : "text-violet-600"}`}>
                                        <Info size={14} /> Features & Description
                                    </h3>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Property Description</label>
                                        <textarea
                                            rows={5}
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Describe the property features, nearby amenities, house rules, etc."
                                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all resize-none ${inputBg}`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-3 ${inputLabel}`}>
                                            Amenities <span className={`normal-case font-normal ${subText}`}>({selectedAmenities.length} selected)</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {ALL_AMENITIES.map(amenity => {
                                                const isActive = selectedAmenities.includes(amenity);
                                                return (
                                                    <button
                                                        key={amenity}
                                                        onClick={() => toggleAmenity(amenity)}
                                                        className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${isActive ? chipActiveBg : chipBg}`}
                                                    >
                                                        {isActive && <CheckCircle2 size={12} />}
                                                        {amenity}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Step 3: Media & Docs ── */}
                            {step === 3 && (
                                <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-5">
                                    <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? "text-[#ba9eff]" : "text-violet-600"}`}>
                                        <ShieldCheck size={14} /> Media & Documents
                                    </h3>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Property Gallery</label>
                                        {/* Existing gallery thumbnails */}
                                        {listing.gallery && listing.gallery.length > 0 && (
                                            <div className="flex gap-2 mb-3 flex-wrap">
                                                {listing.gallery.map((img, i) => (
                                                    <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-white/10 group">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <X size={14} className="text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className={`w-full h-28 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadArea}`}>
                                            <UploadCloud size={24} className={`mb-1.5 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
                                            <p className={`text-sm font-medium ${titleColor}`}>Add more images</p>
                                            <p className={`text-xs mt-0.5 ${subText}`}>PNG, JPG up to 5MB each</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-3 ${inputLabel}`}>Verification Documents</label>
                                        <div className="space-y-2">
                                            {DOC_TYPES.map(doc => {
                                                const existing = listing.documents?.find(d => d.name.toLowerCase().includes(doc.split(" ")[0].toLowerCase()));
                                                return (
                                                    <div key={doc} className={`flex items-center justify-between p-3 border rounded-xl ${isDark ? "bg-[#201f1f] border-white/[0.04]" : "bg-slate-50 border-slate-200"}`}>
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={16} className={isDark ? "text-zinc-500" : "text-slate-400"} />
                                                            <div>
                                                                <span className={`text-sm font-medium ${titleColor}`}>{doc}</span>
                                                                {existing && (
                                                                    <p className={`text-[10px] mt-0.5 capitalize ${existing.status === "verified" ? "text-emerald-400" : existing.status === "pending" ? "text-amber-400" : "text-red-400"}`}>
                                                                        {existing.status}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                                                            {existing ? "Replace" : "Upload"}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className={`p-6 sm:p-7 border-t flex justify-between items-center gap-3 ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                        <button
                            onClick={step > 1 ? prevStep : onClose}
                            className={`py-2.5 px-5 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${closeBtnBg}`}
                        >
                            {step > 1 ? "Back" : "Cancel"}
                        </button>

                        <div className="flex gap-3">
                            {/* Save anywhere from step 1+ */}
                            <button
                                onClick={handleSave}
                                className={`py-2.5 px-5 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${
                                    saved
                                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                                        : isDark
                                        ? "bg-[#ba9eff]/10 border-[#ba9eff]/30 text-[#ba9eff] hover:bg-[#ba9eff]/20"
                                        : "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100"
                                }`}
                            >
                                {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save</>}
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={nextStep}
                                    className="py-2.5 px-7 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_-4px_rgba(138,92,246,0.5)]"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className="py-2.5 px-7 bg-gradient-to-r from-[#ba9eff] to-[#699cff] text-[#39008c] text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_-4px_rgba(186,158,255,0.4)]"
                                >
                                    Save Changes
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
