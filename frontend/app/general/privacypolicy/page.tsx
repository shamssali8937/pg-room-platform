"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import LandpageFooter from "@/components/LandpageFooter";
import ParticleBg from "@/components/ParticleBg";
import {
    Database,
    ShieldCheck,
    Lock,
    Star,
    BarChart3,
    Cookie,
    UserCheck,
    Mail,
    CheckCircle2,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

export default function PrivacyPolicyPage() {
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
            <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-36 md:pb-20 text-center px-4 sm:px-6">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-purple-400 font-bold tracking-[0.2em] uppercase text-xs mb-4"
                >
                    Legal Framework
                </motion.p>

                <motion.h1
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ duration: 0.6 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight"
                >
                    Privacy{" "}
                    <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                        Policy
                    </span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 flex items-center justify-center gap-3 text-gray-400 text-sm"
                >
                    <span>🕑</span>
                    <span>Last Updated: October 24, 2024</span>
                </motion.div>
            </section>

            {/* ═══════════════════════════ CONTENT ═══════════════════════════ */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20">

                {/* ── Our Commitment ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="p-6 sm:p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl mb-8"
                >
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">Our Commitment</h2>
                    <p className="text-gray-400 leading-relaxed max-w-3xl text-sm sm:text-base">
                        At PG Nexus, we treat your data with the same discretion as a private
                        concierge treats a high-profile guest. Our privacy protocols are designed
                        to ensure your digital footprint remains as exclusive and secure as your
                        physical lifestyle. We do not sell your personal information—ever.
                    </p>
                </motion.div>

                {/* ── Data Collection + Data Security Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

                    {/* Data Collection */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:col-span-7 p-6 sm:p-8 md:p-10 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Database className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold">Data Collection</h2>
                        </div>

                        <ul className="space-y-6">
                            {[
                                {
                                    num: "01",
                                    title: "Identity Information",
                                    desc: "Full name, official identification for membership verification, and biometric silhouettes for secure entry if applicable.",
                                },
                                {
                                    num: "02",
                                    title: "Transactional Records",
                                    desc: "Booking history, property preferences, and membership tier details.",
                                },
                                {
                                    num: "03",
                                    title: "Technical Telemetry",
                                    desc: "IP address, device signatures, and interaction heatmaps to optimize your digital experience.",
                                },
                            ].map((item) => (
                                <li key={item.num} className="flex gap-4">
                                    <span className="text-blue-400 font-bold text-lg">{item.num}</span>
                                    <div>
                                        <p className="text-white font-semibold mb-1 text-sm sm:text-base">{item.title}</p>
                                        <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Data Security + Third-Party Column */}
                    <div className="lg:col-span-5 flex flex-col gap-8">

                        {/* Data Security */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="p-6 sm:p-8 md:p-10 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 backdrop-blur-xl"
                        >
                            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mb-5" />
                            <h2 className="text-xl sm:text-2xl font-bold mb-4">Data Security</h2>
                            <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
                                We employ military-grade AES-256 encryption for all data at rest
                                and TLS 1.3 for data in transit.
                            </p>
                            <div className="flex flex-col gap-3">
                                {["Quarterly Physical Audits", "Zero-Knowledge Architecture"].map((label) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-3 text-xs text-white font-medium uppercase tracking-widest bg-white/5 p-3 rounded-lg"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Third-Party Sharing */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="p-6 sm:p-8 md:p-10 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl"
                        >
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Third-Party Sharing</h2>
                            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                                Your data is never shared for advertising. We only coordinate with
                                vetted partners when you explicitly request a service that
                                requires it.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* ── How We Use Information — 3 Cards ── */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8"
                >
                    {[
                        {
                            icon: Star,
                            color: "text-purple-400",
                            title: "Service Personalization",
                            desc: "Curating bespoke property recommendations based on your unique lifestyle profile.",
                        },
                        {
                            icon: UserCheck,
                            color: "text-blue-400",
                            title: "Risk Prevention",
                            desc: "Verifying identity to maintain the exclusive security of the PG Nexus ecosystem.",
                        },
                        {
                            icon: BarChart3,
                            color: "text-pink-400",
                            title: "System Optimization",
                            desc: "Anonymized analytics to improve interface fluidity and responsiveness.",
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            variants={fadeUp}
                            whileHover={{ scale: 1.04 }}
                            className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center hover:shadow-lg hover:shadow-purple-500/10 transition"
                        >
                            <item.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${item.color} mb-4`} />
                            <h3 className="text-white font-bold mb-2 text-sm sm:text-base">{item.title}</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Cookies & Tracking ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="p-6 sm:p-8 md:p-10 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col md:flex-row gap-8 md:gap-10 items-start mb-8"
                >
                    <div className="md:w-1/3">
                        <Cookie className="w-7 h-7 text-purple-400 mb-3" />
                        <h2 className="text-xl sm:text-2xl font-bold mb-4">Cookies &amp; Tracking</h2>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                            We use &quot;digital keys&quot; (cookies) to remember your preferences
                            and maintain your secure session.
                        </p>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {[
                            {
                                label: "Essential",
                                color: "text-purple-400",
                                desc: "Mandatory for secure login and encrypted session maintenance.",
                            },
                            {
                                label: "Functional",
                                color: "text-blue-400",
                                desc: "Remembers your dark mode settings and language preferences.",
                            },
                        ].map((c) => (
                            <div
                                key={c.label}
                                className="p-4 sm:p-5 bg-black/40 rounded-xl border border-white/5"
                            >
                                <p className={`${c.color} font-bold text-xs uppercase tracking-wider mb-2`}>
                                    {c.label}
                                </p>
                                <p className="text-gray-400 text-xs">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Your Rights ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="p-6 sm:p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl mb-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold">Your Rights</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            "Access your personal data at any time",
                            "Request correction of inaccurate data",
                            "Delete your account and associated data",
                            "Opt out of non-essential data processing",
                            "Data portability — export your information",
                            "Withdraw consent for any processing",
                        ].map((right, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-gray-400 text-xs sm:text-sm">{right}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Contact CTA ── */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-8 sm:mt-12 p-6 sm:p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center relative overflow-hidden"
                >
                    {/* Glow overlay */}
                    <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 50% 50%, #8b5cf6, transparent 70%)",
                        }}
                    />

                    <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mx-auto mb-4 relative z-10" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 relative z-10">
                        Still have questions about your privacy?
                    </h2>
                    <p className="text-gray-400 mb-6 sm:mb-8 max-w-xl mx-auto relative z-10 text-sm sm:text-base">
                        Our dedicated Data Protection Officer is available for direct
                        consultation regarding your rights and our procedures.
                    </p>
                    <a
                        href="mailto:support@pgnexus.com"
                        className="relative z-10 inline-block px-6 sm:px-8 py-3 border border-purple-500/50 text-purple-300 font-bold uppercase tracking-[0.15em] text-xs rounded-xl hover:bg-purple-500/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300 active:scale-95"
                    >
                        Contact Support
                    </a>
                </motion.section>
            </div>

            <LandpageFooter />
        </div>
    );
}
