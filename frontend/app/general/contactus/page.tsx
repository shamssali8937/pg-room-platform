"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import LandpageFooter from "@/components/LandpageFooter";
import ParticleBg from "@/components/ParticleBg";
import {
    MapPin,
    Mail,
    Phone,
    ChevronDown,
    ArrowRight,
    ShieldCheck,
    Lock,
    Handshake,
    Star,
    Send,
    Globe,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const faqs = [
    {
        q: "What is the turnaround time for support?",
        a: "Our standard response time is under 15 minutes for current residents via our priority concierge line. General inquiries are typically addressed within 2 business hours.",
    },
    {
        q: "Do you offer on-site maintenance?",
        a: "Yes, all PG Nexus properties include access to our emergency maintenance teams who are available 24/7 for critical utility issues.",
    },
    {
        q: "How do I report an issue with my room?",
        a: "You can report issues directly through your PG Nexus dashboard or by calling our 24/7 concierge line. Our team will respond within minutes.",
    },
];

const locations = [
    {
        city: "Lahore",
        subtitle: "The Cultural Capital",
        count: "12 Properties",
        img: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=80",
    },
    {
        city: "Karachi",
        subtitle: "The City of Lights",
        count: "8 Properties",
        img: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=80",
    },
    {
        city: "Islamabad",
        subtitle: "The Modern Metropolis",
        count: "15 Properties",
        img: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=80",
    },
];

const trustBadges = [
    { icon: ShieldCheck, label: "Vetted Units", desc: "Every property passes 50+ quality checks.", color: "text-purple-400", hover: "hover:bg-purple-500/5" },
    { icon: Lock, label: "Secure Booking", desc: "Bank-grade encryption for all payments.", color: "text-blue-400", hover: "hover:bg-blue-500/5" },
    { icon: Handshake, label: "Fair Housing", desc: "Equality and integrity in every lease.", color: "text-pink-400", hover: "hover:bg-pink-500/5" },
    { icon: Star, label: "4.9/5 Rating", desc: "Consistently rated as top tier service.", color: "text-white", hover: "hover:bg-white/5" },
];

export default function ContactUsPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <div className="bg-black text-white min-h-screen relative overflow-hidden">

            {/* FIXED PARTICLE LAYER */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBg />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] opacity-70" />
            </div>

            {/* FLOATING BACKGROUND GLOW ORBS */}
            <div className="absolute top-[-100px] left-[-100px] w-[250px] h-[250px] md:top-[-200px] md:left-[-200px] md:w-[500px] md:h-[500px] bg-purple-500/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[250px] h-[250px] md:bottom-[-200px] md:right-[-200px] md:w-[500px] md:h-[500px] bg-blue-500/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />

            <Navbar />

            {/* ═══════════════════════════ HERO ═══════════════════════════ */}
            <section className="relative pt-24 pb-10 sm:pt-28 sm:pb-14 md:pt-36 md:pb-20 text-center px-4 sm:px-6">
                <motion.h1
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ duration: 0.6 }}
                    className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-8xl tracking-tight mb-4 sm:mb-6"
                >
                    Get in{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        Touch
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed"
                >
                    Experience the gold standard of premium room rentals. Our concierge
                    team is available around the clock to ensure your stay is nothing
                    short of exceptional.
                </motion.p>
            </section>

            {/* ═══════════════════════════ MAIN GRID ═══════════════════════════ */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

                    {/* ── Contact Form ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-7 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-12 relative overflow-hidden group"
                    >
                        {/* Decorative glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full group-hover:bg-purple-500/20 transition-all duration-700 pointer-events-none" />

                        <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10">
                            Send a Request
                        </h2>

                        <form className="space-y-5 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 ml-1">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 sm:py-4 px-4 sm:px-6 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm sm:text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 ml-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 sm:py-4 px-4 sm:px-6 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm sm:text-base"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 ml-1">
                                    Subject
                                </label>
                                <select className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 sm:py-4 px-4 sm:px-6 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none text-sm sm:text-base cursor-pointer">
                                    <option className="bg-[#1a1a1a] text-white">Booking Inquiry</option>
                                    <option className="bg-[#1a1a1a] text-white">Property Management</option>
                                    <option className="bg-[#1a1a1a] text-white">Partnership Proposal</option>
                                    <option className="bg-[#1a1a1a] text-white">General Support</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 ml-1">
                                    Message
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="How can our concierge assist you?"
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 sm:py-4 px-4 sm:px-6 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none text-sm sm:text-base"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 sm:py-5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Dispatch Request
                            </button>
                        </form>
                    </motion.div>

                    {/* ── Sidebar Info ── */}
                    <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8">

                        {/* Contact Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8"
                        >
                            <h3 className="text-lg sm:text-xl font-bold mb-6">Nexus Headquarters</h3>
                            <div className="space-y-6 sm:space-y-8">
                                {[
                                    {
                                        icon: MapPin,
                                        color: "bg-purple-500/10 text-purple-400",
                                        label: "Lahore Office",
                                        value: (
                                            <>
                                                Level 12, Gold Crest Mall,
                                                <br />
                                                DHA Phase 4, Lahore, Pakistan
                                            </>
                                        ),
                                    },
                                    {
                                        icon: Mail,
                                        color: "bg-blue-500/10 text-blue-400",
                                        label: "Official Inquiry",
                                        value: "concierge@pgnexus.com",
                                    },
                                    {
                                        icon: Phone,
                                        color: "bg-pink-500/10 text-pink-400",
                                        label: "24/7 Concierge Line",
                                        value: "+92 42 111 NEXUS",
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${item.color} shrink-0`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-semibold uppercase text-gray-400 mb-1">
                                                {item.label}
                                            </p>
                                            <p className="text-white text-sm sm:text-base leading-relaxed">
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Global Presence */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                                    <h3 className="text-lg sm:text-xl font-bold">Global Presence</h3>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                        Always Online
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
                                    Our support ecosystem spans across major cities, providing
                                    on-ground assistance 24 hours a day, 7 days a week.
                                </p>
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-gray-400 text-xs"
                                        >
                                            👤
                                        </div>
                                    ))}
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-300">
                                        +12
                                    </div>
                                </div>
                            </div>
                            {/* Decorative */}
                            <Globe className="absolute -bottom-6 -right-6 w-24 h-24 text-white/[0.03] rotate-12 pointer-events-none" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════ LOCATIONS ═══════════════════════════ */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6"
                >
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Prime Hubs</h2>
                        <p className="text-gray-400 max-w-lg text-sm sm:text-base">
                            Strategic locations chosen for accessibility and premium lifestyle
                            standards across Pakistan.
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {locations.map((loc, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative aspect-[4/5] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-white/5 cursor-pointer"
                        >
                            <img
                                src={loc.img}
                                alt={loc.city}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-5 sm:p-8 w-full">
                                <h4 className="text-xl sm:text-2xl font-bold mb-1">{loc.city}</h4>
                                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                                    {loc.subtitle}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-purple-400">
                                        {loc.count}
                                    </span>
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════ FAQ + TRUST BADGES ═══════════════════════════ */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">

                    {/* FAQ */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">
                            Concierge FAQ
                        </h2>
                        <div className="space-y-4 sm:space-y-6">
                            {faqs.map((faq, i) => (
                                <div
                                    key={i}
                                    className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="flex justify-between items-center w-full p-4 sm:p-6 text-left hover:bg-white/[0.03] transition-colors"
                                    >
                                        <span className="font-medium text-sm sm:text-lg pr-4">
                                            {faq.q}
                                        </span>
                                        <ChevronDown
                                            className={`w-5 h-5 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                                    >
                                        <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-gray-400 leading-relaxed text-xs sm:text-sm">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-3 sm:gap-4"
                    >
                        {trustBadges.map((badge, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                className={`p-5 sm:p-8 bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl flex flex-col items-center text-center gap-3 sm:gap-4 ${badge.hover} transition-colors`}
                            >
                                <badge.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${badge.color}`} />
                                <h5 className="font-bold text-sm sm:text-base">{badge.label}</h5>
                                <p className="text-[10px] sm:text-xs text-gray-400">{badge.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <LandpageFooter />
        </div>
    );
}
