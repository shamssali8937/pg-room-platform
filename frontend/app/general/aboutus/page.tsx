"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import LandpageFooter from "@/components/LandpageFooter";
import ParticleBg from "@/components/ParticleBg";
import {
    ShieldCheck,
    Lock,
    Search,
    Users,
    Sparkles,
    Headset,
    Rocket,
    Eye,
    Award,
    UserSearch,
    ShieldPlus,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
};

export default function AboutPage() {
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
            <section className="relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">

                <div className="relative z-10 max-w-5xl px-4 sm:px-6 text-center pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-36 md:pb-24">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-purple-400 font-semibold tracking-[0.25em] uppercase text-[10px] sm:text-xs mb-4 sm:mb-6 block"
                    >
                        Premium Living Redefined
                    </motion.span>

                    <motion.h1
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        transition={{ duration: 0.6 }}
                        className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-8xl tracking-tighter mb-6 sm:mb-8 leading-[0.9]"
                    >
                        Revolutionizing <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            Rental Living
                        </span>
                        <br />
                        in Pakistan
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 sm:p-6 md:p-8 rounded-2xl max-w-2xl mx-auto"
                    >
                        <p className="text-gray-400 text-base sm:text-lg md:text-xl font-light leading-relaxed">
                            The Midnight Curator of shared spaces. We provide verified, high-end
                            living experiences for the modern professional.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════ OUR STORY ═══════════════════════════ */}
            <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">

                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-1 relative"
                    >
                        <div className="aspect-square rounded-3xl overflow-hidden border border-white/5">
                            <img
                                src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
                                alt="Modern living space"
                                className="w-full h-full object-cover grayscale brightness-75"
                            />
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-8 w-36 h-36 sm:w-48 sm:h-48 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hidden md:flex flex-col justify-center">
                            <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1">2024</div>
                            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400">
                                Founded in Lahore
                            </div>
                        </div>
                    </motion.div>

                    {/* Text */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-2"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 tracking-tight">
                            Our Story
                        </h2>
                        <div className="space-y-5 sm:space-y-6 text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed">
                            <p>
                                PG Nexus was born out of a shared frustration. In a landscape of
                                unverified listings, hidden costs, and substandard living conditions,
                                finding a quality room rental in Pakistan&apos;s major cities felt like
                                an impossible quest.
                            </p>
                            <p>
                                We realized that &apos;Premium Living&apos; shouldn&apos;t be reserved
                                just for homeowners. It should be accessible to the digital nomads,
                                the corporate climbers, and the ambitious students who need a
                                sanctuary to thrive.
                            </p>
                            <p>
                                By combining rigorous property verification with a technology-first
                                approach, we&apos;ve created a digital concierge service that
                                doesn&apos;t just find you a room—it finds you a community.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════ MISSION & VISION ═══════════════════════════ */}
            <section className="py-14 sm:py-16 md:py-24 px-4 sm:px-6 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {[
                        {
                            title: "Our Mission",
                            text: "To empower Pakistan's mobile workforce by providing a verified, secure, and dignified shared living experience that feels like home from day one.",
                            icon: Rocket,
                            color: "text-purple-400",
                        },
                        {
                            title: "Our Vision",
                            text: "To become the definitive standard for premium rental living across South Asia, where every PG Nexus home is a hub for innovation and human connection.",
                            icon: Eye,
                            color: "text-blue-400",
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            whileInView={{ opacity: 1, y: 0 }}
                            initial={{ opacity: 0, y: 40 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl group transition-all duration-300 hover:bg-white/[0.08]"
                        >
                            <item.icon className={`${item.color} w-10 h-10 sm:w-12 sm:h-12 mb-5 sm:mb-6`} />
                            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{item.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{item.text}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════ CORE VALUES — BENTO GRID ═══════════════════════════ */}
            <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl font-bold mb-10 sm:mb-16 text-center tracking-tight"
                    >
                        The PG Nexus Code
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:auto-rows-[280px]">

                        {/* Value 01 — Unwavering Trust (large) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="md:col-span-8 bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col justify-end relative overflow-hidden"
                        >
                            <ShieldCheck className="absolute top-8 right-8 w-28 h-28 sm:w-40 sm:h-40 text-white/[0.04]" />
                            <span className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4">
                                Value 01
                            </span>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                                Unwavering Trust
                            </h3>
                            <p className="max-w-md text-gray-400 text-sm sm:text-base">
                                Every listing on our platform undergoes a 50-point physical
                                verification process. No surprises, no scams, just certainty.
                            </p>
                        </motion.div>

                        {/* Value 02 — Total Safety (gradient) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-4 bg-gradient-to-br from-purple-600/80 to-blue-600/80 border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col justify-between text-white"
                        >
                            <Lock className="w-10 h-10 sm:w-12 sm:h-12" />
                            <div>
                                <span className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-2 block">
                                    Value 02
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-bold">Total Safety</h3>
                            </div>
                        </motion.div>

                        {/* Value 03 — Curated Quality */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-5 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col justify-between"
                        >
                            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400" />
                            <div>
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-2 block">
                                    Value 03
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-bold">Curated Quality</h3>
                            </div>
                        </motion.div>

                        {/* Value 04 — Community First */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="md:col-span-7 bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                            <div className="max-w-xs">
                                <h3 className="text-xl sm:text-2xl font-bold mb-2">Community First</h3>
                                <p className="text-gray-400 text-xs sm:text-sm">
                                    We don&apos;t just rent rooms; we curate neighborhoods of
                                    like-minded individuals.
                                </p>
                            </div>
                            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-white/10 shrink-0" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ APPROACH ═══════════════════════════ */}
            <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 md:gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 order-2 lg:order-1"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                            Human Intelligence.{" "}
                            <br className="hidden sm:block" />
                            Tech Precision.
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8">
                            Our approach is hybrid. While our platform leverages AI to match you
                            with your ideal roommate and space, our &quot;Nexus Concierges&quot;
                            are real people on the ground in Lahore, Karachi, and Islamabad,
                            ensuring every property meets our &quot;Midnight Standard.&quot;
                        </p>

                        <div className="flex flex-col gap-3 sm:gap-4">
                            {[
                                {
                                    icon: ShieldPlus,
                                    color: "bg-purple-500/20 text-purple-400",
                                    label: "Rigorous Physical Audits",
                                },
                                {
                                    icon: UserSearch,
                                    color: "bg-blue-500/20 text-blue-400",
                                    label: "Intelligent Resident Matching",
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/[0.04] border border-white/10"
                                >
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${item.color} flex items-center justify-center shrink-0`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex-1 w-full order-1 lg:order-2"
                    >
                        <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/5">
                            <img
                                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80"
                                alt="Premium rental interior"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════ WHY CHOOSE US ═══════════════════════════ */}
            <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12"
                    >
                        Why Choose PG Nexus
                    </motion.h2>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                    >
                        {[
                            { icon: ShieldCheck, title: "Verified Listings", desc: "100% physically verified properties." },
                            { icon: Lock, title: "Secure Platform", desc: "Encrypted and safe communication." },
                            { icon: Search, title: "Smart Search", desc: "AI-powered filtering system." },
                            { icon: Users, title: "Trusted Community", desc: "Real tenants & verified owners." },
                            { icon: Sparkles, title: "No Fake Ads", desc: "Strict moderation system." },
                            { icon: Headset, title: "24/7 Support", desc: "Always here to help you." },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                whileHover={{ scale: 1.05 }}
                                className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:shadow-lg hover:shadow-purple-500/10 transition"
                            >
                                <item.icon className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6 mb-3" />
                                <h3 className="font-semibold mb-1 text-sm sm:text-base">{item.title}</h3>
                                <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════ CTA ═══════════════════════════ */}
            <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-tr from-white/[0.04] to-black/40 border border-white/10 backdrop-blur-xl p-8 sm:p-12 md:p-24 text-center relative overflow-hidden"
                >
                    {/* Top gradient line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-50" />

                    {/* Glow */}
                    <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(circle at 50% 50%, #8b5cf6, transparent 70%)",
                        }}
                    />

                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 relative z-10">
                        Ready to find your{" "}
                        <br className="hidden sm:block" />
                        <span className="text-purple-400 italic">Nexus?</span>
                    </h2>

                    <p className="text-gray-400 text-sm sm:text-base md:text-xl mb-8 sm:mb-10 md:mb-12 max-w-xl mx-auto relative z-10">
                        Whether you&apos;re looking for a premium stay or listing your high-end
                        property, the club is waiting.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-10">
                        <a
                            href="/"
                            className="bg-gradient-to-r from-purple-500 to-blue-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 active:scale-95"
                        >
                            Explore Listings
                        </a>
                        <a
                            href="/"
                            className="border border-purple-500/50 text-purple-300 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-lg hover:bg-purple-500/10 transition-all duration-300 active:scale-95"
                        >
                            List Your Property
                        </a>
                    </div>
                </motion.div>
            </section>

            <LandpageFooter />
        </div>
    );
}