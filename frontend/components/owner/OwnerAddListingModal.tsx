"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, MapPin, Building, DollarSign, Users, Info, BedDouble, Bath, FileText, CheckCircle2, ShieldCheck, Wifi, Wind, Car, Dumbbell } from "lucide-react";
import { useOwnerTheme } from "@/context/OwnerThemeContext";

interface OwnerAddListingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ALL_AMENITIES = ["WiFi", "AC", "Parking", "Kitchen", "Pool", "Gym", "CCTV", "Power Backup", "Study Room", "Breakfast", "Housekeeping", "Laundry", "Terrace", "Concierge"];
const DOC_TYPES = ["CNIC Copy", "Property Deed", "Utility Bill"];

export default function OwnerAddListingModal({ isOpen, onClose }: OwnerAddListingModalProps) {
    const { isDark } = useOwnerTheme();
    const [step, setStep] = useState(1);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    
    if (!isOpen) return null;

    // Theme tokens
    const modalBg = isDark ? "bg-[#131313] border-white/[0.08]" : "bg-white border-slate-200";
    const titleColor = isDark ? "text-white" : "text-slate-900";
    const subText = isDark ? "text-zinc-400" : "text-slate-500";
    const inputBg = isDark ? "bg-[#201f1f] border border-white/[0.04] text-white focus:border-[#ba9eff] focus:ring-1 focus:ring-[#ba9eff]" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500";
    const inputLabel = isDark ? "text-zinc-500" : "text-slate-600";
    const uploadArea = isDark ? "bg-[#201f1f] border-dashed border-white/10 hover:border-[#ba9eff]/50" : "bg-slate-50 border-dashed border-slate-300 hover:border-violet-400";
    const closeBtnBg = isDark ? "bg-[#201f1f] border-white/5 text-zinc-400 hover:bg-[#2c2c2c]" : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200";
    const chipBg = isDark ? "bg-[#201f1f] border-white/[0.04] text-zinc-300 hover:border-[#ba9eff]/30" : "bg-slate-100 border-slate-200 text-slate-700 hover:border-violet-300";
    const chipActiveBg = isDark ? "bg-[#ba9eff]/10 border-[#ba9eff]/50 text-[#ba9eff]" : "bg-violet-50 border-violet-500 text-violet-700";

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    const toggleAmenity = (a: string) => setSelectedAmenities(prev => prev.includes(a) ? prev.filter(i => i !== a) : [...prev, a]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6"
                onClick={onClose}
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
                            <p className={`text-sm mt-1 ${subText}`}>Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Features & Description' : 'Media & Documents'}</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress Bar */}
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
                        <AnimatePresence mode="wait">
                            {/* Step 1: Basics */}
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                                    <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-[#ba9eff]' : 'text-violet-600'} flex items-center gap-2`}><Building size={16}/> Basic Information</h3>
                                    
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Property Title</label>
                                        <input type="text" placeholder="e.g. Executive 2BR Apartment" className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${inputBg}`} />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Location</label>
                                        <div className="relative">
                                            <MapPin size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                                            <input type="text" placeholder="e.g. DHA Phase 6, Karachi" className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Monthly Rent (PKR)</label>
                                            <div className="relative">
                                                <DollarSign size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                                                <input type="number" placeholder="45000" className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Room Type</label>
                                            <div className="relative">
                                                <Building size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                                                <select className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all appearance-none ${inputBg}`}>
                                                    <option value="Private Room">Private Room</option>
                                                    <option value="Shared Room">Shared Room</option>
                                                    <option value="Entire Apartment">Entire Apartment</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Bed Capacity</label>
                                            <div className="relative">
                                                <BedDouble size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                                                <input type="number" placeholder="2" className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Bathrooms</label>
                                            <div className="relative">
                                                <Bath size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                                                <input type="number" placeholder="1" className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${inputBg}`} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Features */}
                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                    <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-[#ba9eff]' : 'text-violet-600'} flex items-center gap-2`}><Info size={16}/> Features & Description</h3>
                                    
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Property Description</label>
                                        <textarea rows={4} placeholder="Describe the property features, nearby amenities, house rules, etc." className={`w-full px-4 py-3 rounded-xl outline-none transition-all resize-none ${inputBg}`} />
                                    </div>
                                    
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-3 ${inputLabel}`}>Included Amenities</label>
                                        <div className="flex flex-wrap gap-2">
                                            {ALL_AMENITIES.map(amenity => {
                                                const isActive = selectedAmenities.includes(amenity);
                                                return (
                                                    <button 
                                                        key={amenity}
                                                        onClick={() => toggleAmenity(amenity)}
                                                        className={`px-4 py-2 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${isActive ? chipActiveBg : chipBg}`}
                                                    >
                                                        {isActive && <CheckCircle2 size={14} />} {amenity}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Media & Docs */}
                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                    <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-[#ba9eff]' : 'text-violet-600'} flex items-center gap-2`}><ShieldCheck size={16}/> Media & Documents</h3>
                                    
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${inputLabel}`}>Property Gallery (Max 5)</label>
                                        <div className={`w-full h-32 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadArea}`}>
                                            <UploadCloud size={28} className={`mb-2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                                            <p className={`text-sm font-medium ${titleColor}`}>Click to upload images</p>
                                            <p className={`text-xs mt-1 ${subText}`}>PNG, JPG up to 5MB</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-widest mb-3 ${inputLabel}`}>Verification Documents</label>
                                        <div className="space-y-3">
                                            {DOC_TYPES.map(doc => (
                                                <div key={doc} className={`flex items-center justify-between p-3 border rounded-xl ${isDark ? 'bg-[#201f1f] border-white/[0.04]' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={18} className={isDark ? 'text-zinc-500' : 'text-slate-400'} />
                                                        <span className={`text-sm font-medium ${titleColor}`}>{doc}</span>
                                                    </div>
                                                    <button className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                                        Upload
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    <div className={`p-6 sm:p-8 border-t flex justify-between items-center ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                        {step > 1 ? (
                            <button onClick={prevStep} className={`py-3 px-6 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${closeBtnBg}`}>
                                Back
                            </button>
                        ) : (
                            <button onClick={onClose} className={`py-3 px-6 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${closeBtnBg}`}>
                                Cancel
                            </button>
                        )}

                        {step < 3 ? (
                            <button onClick={nextStep} className="py-3 px-8 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_-4px_rgba(138,92,246,0.5)]">
                                Next Step
                            </button>
                        ) : (
                            <button onClick={() => { onClose(); setStep(1); setSelectedAmenities([]); }} className="py-3 px-8 bg-gradient-to-r from-[#ba9eff] to-[#39008c] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_-4px_rgba(186,158,255,0.4)]">
                                Submit Listing
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
