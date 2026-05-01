"use client";

import { useState, useRef } from "react";
import { useOwnerTheme } from "@/context/OwnerThemeContext";
import { Camera, BadgeCheck, Mail, Smartphone, IdCard, CheckCircle2, Edit, X, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OwnerSettingsPage() {
    const { isDark } = useOwnerTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const [profileImage, setProfileImage] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuBCqbISZgS6wjMgpfWW4BxNVMw60vhqBPM85RS6ADzUKrfR7kHPUPJrWqRp7aZYYdn2JUmPSZAGkyrYPLYaqkijsal2hF2JKRGrjoY4jc2x4l2Qx0aOHWa_cLXeGG4Cc8OoAlvJeAsbrpGt7Y5XPII6qoGPSjAy6vH_zB07ImjlFGlwnHgv2txZAOTkZiRtgF2WI31TVaxiZXUhqnMWvnwiYaTnJ3qjUZ0rVEqX9s2NDLm6--D30fywgdgU1hKRsdo0ZeTQ4R7b1g");
    const [docFileName, setDocFileName] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setDocFileName(file.name);
        }
    };

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313]" : "bg-white shadow-sm border border-slate-200";
    const surfaceHigh = isDark ? "bg-[#201f1f]" : "bg-slate-50 border border-slate-200";
    const ghostBorder = isDark ? "border border-[#484847]/15" : "border-none";

    // Dynamic input styling based on edit mode
    const inputBg = isDark 
        ? `border-none text-white focus:ring-2 focus:ring-[#ba9eff]/40 transition-all ${isEditing ? 'bg-[#131313]' : 'bg-transparent px-0'}`
        : `border text-slate-900 focus:ring-2 focus:ring-violet-400 transition-all ${isEditing ? 'bg-white border-slate-200 px-4' : 'bg-transparent border-transparent px-0'}`;
    
    const textAreaBg = isDark
        ? `border-none text-white focus:ring-2 focus:ring-[#ba9eff]/40 transition-all resize-none ${isEditing ? 'bg-[#131313]' : 'bg-transparent px-0'}`
        : `border text-slate-900 focus:ring-2 focus:ring-violet-400 transition-all resize-none ${isEditing ? 'bg-white border-slate-200 px-4' : 'bg-transparent border-transparent px-0'}`;

    const primaryColor = isDark ? "text-[#ba9eff]" : "text-violet-600";
    const secondaryColor = isDark ? "text-[#699cff]" : "text-blue-600";
    const tertiaryColor = isDark ? "text-[#ff97b5]" : "text-pink-600";
    const uploadArea = isDark ? "bg-[#201f1f] border-dashed border-white/10 hover:border-[#ba9eff]/50" : "bg-slate-50 border-dashed border-slate-300 hover:border-violet-400";
    const modalBg = isDark ? "bg-[#131313] border-white/[0.08]" : "bg-white border-slate-200";

    const handleSave = () => {
        // Save logic here
        setIsEditing(false);
    };

    return (
        <div className="max-w-6xl mx-auto xl:px-8 relative">
            {/* Hero Header */}
            <section className="mb-12 lg:mb-16 flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
                <div className={`relative group shrink-0 ${isEditing ? 'cursor-pointer' : ''}`} onClick={() => isEditing && fileInputRef.current?.click()}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                    />
                    <div className="h-28 w-28 md:h-32 md:w-32 rounded-3xl overflow-hidden shadow-2xl relative">
                        <img 
                            src={profileImage} 
                            alt="Owner Profile" 
                            className={`h-full w-full object-cover transition-transform duration-500 ${isEditing ? 'group-hover:scale-110' : ''}`} 
                        />
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                                <Camera className="text-white transform scale-75 group-hover:scale-100 transition-transform duration-300" size={28} />
                            </div>
                        )}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-xl shadow-lg border-4 ${isDark ? 'bg-[#ba9eff] border-[#0e0e0e]' : 'bg-violet-500 border-slate-50'}`}>
                        <BadgeCheck className={isDark ? "text-[#39008c]" : "text-white"} size={20} fill="currentColor" />
                    </div>
                </div>
                
                <div className="flex-1">
                    <h2 className={`text-3xl md:text-4xl font-headline font-extrabold tracking-tight mb-2 ${textPrimary}`}>Alexander Sterling</h2>
                    <p className={`text-base md:text-lg max-w-xl ${textVariant}`}>
                        Curating the world's most exceptional private estates since 2014. Precision, privacy, and prestige.
                    </p>
                </div>
                
                <div className="flex space-x-3 md:space-x-4 mt-6 md:mt-0 w-full md:w-auto">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className={`flex-1 md:flex-none px-6 py-3 md:py-2.5 rounded-xl border hover:opacity-80 transition-colors font-headline font-bold text-xs md:text-sm tracking-tight uppercase ${isDark ? 'border-[#484847] text-white' : 'border-slate-300 text-slate-700'}`}>
                                Discard
                            </button>
                            <button onClick={handleSave} className="flex-1 md:flex-none px-8 py-3 md:py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-headline font-bold text-xs md:text-sm tracking-tight uppercase shadow-[0_0_20px_rgba(138,92,246,0.4)] hover:brightness-110 transition-all">
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none px-8 py-3 md:py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-headline font-bold text-xs md:text-sm tracking-tight uppercase shadow-[0_0_20px_rgba(138,92,246,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2">
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
                                        <p className={`text-xs truncate ${textVariant}`}>a.sterling@curator.io</p>
                                    </div>
                                </div>
                                <CheckCircle2 className={primaryColor} size={20} fill="currentColor" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${surfaceHigh}`}>
                                        <Smartphone className={primaryColor} size={20} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${textPrimary}`}>Mobile Device</p>
                                        <p className={`text-xs ${textVariant}`}>+44 •••• ••• 882</p>
                                    </div>
                                </div>
                                <CheckCircle2 className={primaryColor} size={20} fill="currentColor" />
                            </div>
                            
                            <div className="flex items-center justify-between opacity-60">
                                <div className="flex items-center space-x-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${surfaceHigh}`}>
                                        <IdCard className={textVariant} size={20} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${textPrimary}`}>Identity Doc</p>
                                        <p className={`text-xs ${textVariant}`}>Passport / License</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => isEditing && setIsVerifyOpen(true)} 
                                    disabled={!isEditing}
                                    className={`text-[10px] md:text-xs font-bold uppercase tracking-tighter underline decoration-2 underline-offset-4 transition-opacity ${isEditing ? `${secondaryColor} hover:opacity-80` : `${textVariant} opacity-50 cursor-not-allowed`}`}
                                >
                                    Verify
                                </button>
                            </div>

                        </div>
                    </div>
                    
                    <div className={`pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className={`rounded-2xl p-4 ${isDark ? 'bg-[#ba9eff]/10' : 'bg-violet-50'}`}>
                            <p className={`text-xs leading-relaxed ${primaryColor}`}>
                                Your profile is 85% verified. Complete identity verification to unlock <strong>Elite Curator</strong> status and lower commission rates.
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
                                defaultValue="Alexander Sterling" 
                                disabled={!isEditing}
                                className={`w-full rounded-xl py-3 text-sm outline-none ${inputBg}`} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Public Display Name</label>
                            <input 
                                type="text" 
                                defaultValue="The Curator" 
                                disabled={!isEditing}
                                className={`w-full rounded-xl py-3 text-sm outline-none ${inputBg}`} 
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Professional Bio</label>
                            <textarea 
                                rows={4}
                                defaultValue="Curating the world's most exceptional private estates since 2014. Specializing in Mediterranean coastline properties and alpine retreats. Passionate about architecture and guest experience perfection."
                                disabled={!isEditing}
                                className={`w-full rounded-2xl py-3 text-sm outline-none ${textAreaBg}`} 
                            />
                        </div>
                    </div>
                </motion.div>

                {/* General Information (Previously Business Details) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`col-span-12 lg:col-span-7 rounded-3xl p-6 md:p-8 relative overflow-hidden ${surfaceLow} ${ghostBorder}`}>
                    <div className="relative z-10">
                        <h3 className={`text-xs md:text-sm font-headline font-bold uppercase tracking-widest mb-8 ${tertiaryColor}`}>General Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Contact Email</label>
                                    <p className={`text-base md:text-lg font-headline font-bold py-2 ${textPrimary}`}>a.sterling@curator.io</p>
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Phone Number</label>
                                    <p className={`text-base md:text-lg font-headline font-bold py-2 ${textPrimary}`}>+44 7911 123456</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${textVariant}`}>Primary Location</label>
                                    {isEditing ? (
                                        <textarea rows={3} defaultValue="12 Knightsbridge, Belgravia&#10;London, SW1X 7LY&#10;United Kingdom" className={`w-full rounded-xl py-2 text-sm outline-none ${textAreaBg}`} />
                                    ) : (
                                        <p className={`text-sm leading-relaxed py-2 ${textVariant}`}>
                                            12 Knightsbridge, Belgravia<br/>
                                            London, SW1X 7LY<br/>
                                            United Kingdom
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorative glow */}
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -mr-20 -mt-20 ${isDark ? 'bg-[#ff97b5]/5' : 'bg-pink-400/10'}`}></div>
                </motion.div>

                {/* Notification Preferences */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`col-span-12 lg:col-span-5 rounded-3xl p-6 md:p-8 ${surfaceLow} ${ghostBorder}`}>
                    <h3 className={`text-xs md:text-sm font-headline font-bold uppercase tracking-widest mb-8 ${textVariant}`}>Notifications</h3>
                    
                    <div className="space-y-6 md:space-y-8">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className={`text-sm font-bold ${textPrimary}`}>Instant Inquiry Alerts</p>
                                <p className={`text-xs mt-1 ${textVariant}`}>Push notifications for new property leads</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input type="checkbox" defaultChecked disabled={!isEditing} className="sr-only peer" />
                                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDark ? 'bg-[#201f1f] peer-checked:bg-[#ba9eff]' : 'bg-slate-200 peer-checked:bg-violet-500'} ${!isEditing && 'opacity-50'}`}></div>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className={`text-sm font-bold ${textPrimary}`}>Market Intelligence</p>
                                <p className={`text-xs mt-1 ${textVariant}`}>Weekly reports on local pricing trends</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input type="checkbox" defaultChecked disabled={!isEditing} className="sr-only peer" />
                                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDark ? 'bg-[#201f1f] peer-checked:bg-[#ba9eff]' : 'bg-slate-200 peer-checked:bg-violet-500'} ${!isEditing && 'opacity-50'}`}></div>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className={`text-sm font-bold ${textPrimary}`}>Email Digest</p>
                                <p className={`text-xs mt-1 ${textVariant}`}>Summary of account activity every 24h</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input type="checkbox" disabled={!isEditing} className="sr-only peer" />
                                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDark ? 'bg-[#201f1f] peer-checked:bg-[#ba9eff]' : 'bg-slate-200 peer-checked:bg-violet-500'} ${!isEditing && 'opacity-50'}`}></div>
                            </label>
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
                        onClick={() => setIsVerifyOpen(false)}
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
                                <button onClick={() => setIsVerifyOpen(false)} className={`p-2 rounded-full transition-colors ${isDark ? 'text-zinc-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <p className={`text-sm mb-6 ${textVariant}`}>
                                Please upload a clear, legible copy of your valid Passport or National Identity Card to upgrade to Elite Curator status.
                            </p>

                            <input 
                                type="file" 
                                ref={docInputRef} 
                                className="hidden" 
                                accept=".jpg,.jpeg,.png,.pdf" 
                                onChange={handleDocUpload} 
                            />
                            
                            <div 
                                onClick={() => docInputRef.current?.click()}
                                className={`w-full h-40 mb-6 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadArea}`}
                            >
                                <UploadCloud size={32} className={`mb-3 ${isDark ? 'text-zinc-500' : 'text-slate-400'} ${docFileName ? 'text-emerald-500' : ''}`} />
                                <p className={`text-sm font-bold ${textPrimary}`}>
                                    {docFileName ? 'Document Selected' : 'Upload Identity Document'}
                                </p>
                                <p className={`text-xs mt-1 ${docFileName ? 'text-emerald-500' : textVariant}`}>
                                    {docFileName || 'JPG, PNG or PDF (Max 5MB)'}
                                </p>
                            </div>

                            <button onClick={() => { setIsVerifyOpen(false); setDocFileName(null); }} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:brightness-110 transition-all">
                                {docFileName ? 'Submit for Review' : 'Cancel'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
