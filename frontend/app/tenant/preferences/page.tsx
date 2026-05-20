"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantTheme } from "@/context/TenantThemeContext";
import { mockTenantProfile } from "@/components/tenant/mockData";
import {
    SlidersHorizontal, MapPin, Wallet, Home, Wifi, Car, Dumbbell,
    Dog, Cigarette, CheckCircle2, Save, Bell, Moon, Globe,
    Sun, ToggleLeft, ToggleRight, Gem
} from "lucide-react";

const CITIES = ["Lahore", "Islamabad", "Rawalpindi", "Karachi", "Peshawar", "Quetta"];
const ROOM_TYPES = ["Studio", "1-Bedroom", "2-Bedroom", "3-Bedroom+", "Shared Room"];

export default function TenantPreferences() {
    const { isDark, toggleTheme } = useTenantTheme();
    const [saved, setSaved] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Local editable state
    const [preferredCities, setPreferredCities] = useState<string[]>(mockTenantProfile.preferredCities);
    const [budget, setBudget] = useState({ min: mockTenantProfile.budget.min, max: mockTenantProfile.budget.max });
    const [roomType, setRoomType] = useState(mockTenantProfile.preferences.roomType);
    const [amenityPrefs, setAmenityPrefs] = useState({ ...mockTenantProfile.preferences });
    const [notifications, setNotifications] = useState({ email: true, push: true, sms: false, weeklyDigest: true });

    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textVariant = isDark ? "text-[#adaaaa]" : "text-slate-500";
    const surfaceLow = isDark ? "bg-[#131313] border border-[#484847]/15" : "bg-white border border-slate-200 shadow-sm";
    const surfaceMid = isDark ? "bg-[#1a1919] border border-[#484847]/10" : "bg-slate-50 border border-slate-100";
    const divider = isDark ? "border-white/[0.06]" : "border-slate-100";
    const chipActive = isDark ? "bg-[#a27cff]/20 text-[#a27cff] border-[#a27cff]/40" : "bg-violet-100 text-violet-700 border-violet-300";
    const chipInactive = isDark ? "bg-[#1a1919] text-[#adaaaa] border-[#484847]/20 hover:bg-white/5" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100";

    const toggleCity = (city: string) => {
        if (!editMode) return;
        setPreferredCities(prev =>
            prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
        );
    };

    const handleSave = () => {
        setEditMode(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const Toggle = ({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
        <button
            onClick={() => !disabled && onChange(!value)}
            className={`transition-colors ${disabled ? "opacity-50 cursor-default" : "cursor-pointer"}`}
        >
            {value
                ? <ToggleRight size={28} className="text-[#a27cff]" />
                : <ToggleLeft size={28} className={isDark ? "text-zinc-600" : "text-slate-300"} />
            }
        </button>
    );

    const amenityList: { key: keyof typeof amenityPrefs; label: string; icon: React.ReactNode }[] = [
        { key: "furnished", label: "Furnished", icon: <Home size={15} /> },
        { key: "internet", label: "Internet / WiFi", icon: <Wifi size={15} /> },
        { key: "parking", label: "Parking", icon: <Car size={15} /> },
        { key: "gym", label: "Gym Access", icon: <Dumbbell size={15} /> },
        { key: "petsAllowed", label: "Pets Allowed", icon: <Dog size={15} /> },
        { key: "smokingAllowed", label: "Smoking Allowed", icon: <Cigarette size={15} /> },
    ];

    return (
        <div className="max-w-[1000px] mx-auto space-y-6 pb-24 lg:pb-4">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-14 xl:pl-0">
                <div>
                    <p className="text-[#a27cff] font-bold tracking-[0.25em] text-[10px] uppercase mb-1.5">Personalization</p>
                    <h2 className={`text-2xl md:text-3xl font-headline font-extrabold tracking-tight ${textPrimary}`}>Preferences</h2>
                    <p className={`text-sm mt-1 ${textVariant}`}>Customize your room-finding experience and notifications.</p>
                </div>
                <div className="flex gap-3">
                    {editMode ? (
                        <>
                            <button
                                onClick={() => setEditMode(false)}
                                className={`px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${isDark ? "border-[#484847]/30 text-[#adaaaa] hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a27cff] to-[#6e3bd7] text-white font-bold text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(162,124,255,0.3)]"
                            >
                                <Save size={15} /> Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all ${isDark ? "border-[#484847]/30 text-[#adaaaa] hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                            <SlidersHorizontal size={15} /> Edit Preferences
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Room Preferences */}
                <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                    <div className={`px-6 py-4 border-b flex items-center gap-3 ${divider}`}>
                        <div className="w-7 h-7 rounded-lg bg-[#a27cff]/10 flex items-center justify-center">
                            <Home size={14} className="text-[#a27cff]" />
                        </div>
                        <h3 className={`font-headline font-bold ${textPrimary}`}>Room Preferences</h3>
                    </div>
                    <div className="p-6 space-y-5">
                        {/* Preferred Cities */}
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textVariant}`}>Preferred Cities</p>
                            <div className="flex flex-wrap gap-2">
                                {CITIES.map(city => (
                                    <button
                                        key={city}
                                        onClick={() => toggleCity(city)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${preferredCities.includes(city) ? chipActive : chipInactive} ${!editMode ? "cursor-default" : ""}`}
                                    >
                                        <span className="flex items-center gap-1.5"><MapPin size={10} />{city}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Budget Range */}
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textVariant}`}>
                                Budget Range: <span className={textPrimary}>PKR {budget.min.toLocaleString()} – {budget.max.toLocaleString()}/mo</span>
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <label className={`text-[10px] ${textVariant} mb-1 block`}>Minimum</label>
                                    <input
                                        type="range" min={10000} max={100000} step={5000}
                                        value={budget.min}
                                        onChange={e => editMode && setBudget(prev => ({ ...prev, min: Number(e.target.value) }))}
                                        disabled={!editMode}
                                        className="w-full accent-[#a27cff] disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <label className={`text-[10px] ${textVariant} mb-1 block`}>Maximum</label>
                                    <input
                                        type="range" min={20000} max={200000} step={5000}
                                        value={budget.max}
                                        onChange={e => editMode && setBudget(prev => ({ ...prev, max: Number(e.target.value) }))}
                                        disabled={!editMode}
                                        className="w-full accent-[#a27cff] disabled:opacity-60"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Room Type */}
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textVariant}`}>Room Type</p>
                            <div className="flex flex-wrap gap-2">
                                {ROOM_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => editMode && setRoomType(type)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${roomType === type ? chipActive : chipInactive} ${!editMode ? "cursor-default" : ""}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Amenity Preferences */}
                <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                    <div className={`px-6 py-4 border-b flex items-center gap-3 ${divider}`}>
                        <div className="w-7 h-7 rounded-lg bg-[#699cff]/10 flex items-center justify-center">
                            <Gem size={14} className="text-[#699cff]" />
                        </div>
                        <h3 className={`font-headline font-bold ${textPrimary}`}>Amenity Preferences</h3>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {amenityList.map(({ key, label, icon }) => (
                            <div key={key} className={`flex items-center justify-between px-6 py-4 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/50"}`}>
                                <div className="flex items-center gap-3">
                                    <span className={textVariant}>{icon}</span>
                                    <span className={`text-sm font-medium ${textPrimary}`}>{label}</span>
                                </div>
                                <Toggle
                                    value={amenityPrefs[key] as boolean}
                                    onChange={v => editMode && setAmenityPrefs(prev => ({ ...prev, [key]: v }))}
                                    disabled={!editMode}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Notification Settings */}
                <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                    <div className={`px-6 py-4 border-b flex items-center gap-3 ${divider}`}>
                        <div className="w-7 h-7 rounded-lg bg-[#ff97b5]/10 flex items-center justify-center">
                            <Bell size={14} className="text-[#ff97b5]" />
                        </div>
                        <h3 className={`font-headline font-bold ${textPrimary}`}>Notifications</h3>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {[
                            { key: "email" as const, label: "Email Alerts", sub: "Booking confirmations, messages" },
                            { key: "push" as const, label: "Push Notifications", sub: "Real-time app alerts" },
                            { key: "sms" as const, label: "SMS Alerts", sub: "Critical updates via SMS" },
                            { key: "weeklyDigest" as const, label: "Weekly Digest", sub: "New listings matching your preferences" },
                        ].map(item => (
                            <div key={item.key} className={`flex items-center justify-between px-6 py-4 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/50"}`}>
                                <div>
                                    <p className={`text-sm font-medium ${textPrimary}`}>{item.label}</p>
                                    <p className={`text-xs ${textVariant}`}>{item.sub}</p>
                                </div>
                                <Toggle
                                    value={notifications[item.key]}
                                    onChange={v => setNotifications(prev => ({ ...prev, [item.key]: v }))}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Appearance Settings */}
                <section className={`rounded-2xl overflow-hidden ${surfaceLow}`}>
                    <div className={`px-6 py-4 border-b flex items-center gap-3 ${divider}`}>
                        <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center">
                            {isDark ? <Moon size={14} className="text-amber-400" /> : <Sun size={14} className="text-amber-400" />}
                        </div>
                        <h3 className={`font-headline font-bold ${textPrimary}`}>Appearance</h3>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col gap-4">
                            {/* Theme Toggle */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border ${divider} ${surfaceMid}`}>
                                <div className="flex items-center gap-3">
                                    {isDark ? <Moon size={18} className="text-[#a27cff]" /> : <Sun size={18} className="text-amber-400" />}
                                    <div>
                                        <p className={`text-sm font-medium ${textPrimary}`}>{isDark ? "Dark Mode" : "Light Mode"}</p>
                                        <p className={`text-xs ${textVariant}`}>Switch to {isDark ? "light" : "dark"} theme</p>
                                    </div>
                                </div>
                                <Toggle value={isDark} onChange={toggleTheme} />
                            </div>

                            {/* Language */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border ${divider} ${surfaceMid}`}>
                                <div className="flex items-center gap-3">
                                    <Globe size={18} className={textVariant} />
                                    <div>
                                        <p className={`text-sm font-medium ${textPrimary}`}>Language</p>
                                        <p className={`text-xs ${textVariant}`}>English (Pakistan)</p>
                                    </div>
                                </div>
                                <button className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${isDark ? "border-[#484847]/30 text-[#adaaaa] hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Saved Toast */}
            <AnimatePresence>
                {saved && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#a27cff]/90 backdrop-blur-sm text-white font-bold text-sm shadow-2xl z-50"
                    >
                        <CheckCircle2 size={18} />
                        Preferences saved successfully!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
