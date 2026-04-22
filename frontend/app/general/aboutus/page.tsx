"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import LandpageFooter from "@/components/LandpageFooter";
import ParticleBg from "@/components/ParticleBg";
import { ShieldCheck, Lock, Search, Users, Sparkles, Headset } from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
};

export default function AboutPage() {
    return (
        <div className="bg-black text-white min-h-screen relative overflow-hidden">

            {/* FIXED PARTICLE LAYER */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBg />
                {/* Subtle radial overlay to focus light on center and keep edges deep */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] opacity-70" />
            </div>

            {/* FLOATING BACKGROUND GLOW ORBS — smaller on mobile */}
            <div className="absolute top-[-100px] left-[-100px] w-[250px] h-[250px] md:top-[-200px] md:left-[-200px] md:w-[500px] md:h-[500px] bg-purple-500/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[250px] h-[250px] md:bottom-[-200px] md:right-[-200px] md:w-[500px] md:h-[500px] bg-blue-500/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />

            <Navbar />

            {/* HERO */}
            <section className="relative pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-36 md:pb-24 text-center px-4 sm:px-6">
                <motion.h1
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ duration: 0.6 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight"
                >
                    Revolutionizing <br />
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                        Rental Living
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 sm:mt-6 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg"
                >
                    Premium verified PG ecosystem powered by trust, AI search, and modern living standards.
                </motion.p>
            </section>

            {/* STORY */}
            <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">

                <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    src="https://images.unsplash.com/photo-1505691938895-1758d7feb511"
                    alt="Modern living space"
                    className="rounded-3xl h-[240px] sm:h-[320px] md:h-[420px] w-full object-cover shadow-2xl shadow-purple-500/10"
                />

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold">Our Story</h2>

                    <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                        PG Nexus was built to eliminate fake listings, hidden charges, and unsafe rentals.
                        We combine AI-powered discovery with real-world verification to create trust at scale.
                        <br /><br />
                        Our mission is to redefine rental living in Pakistan with transparency and premium experience.
                    </p>
                </motion.div>

            </section>

            {/* MISSION / VISION */}
            <section className="px-4 sm:px-6 py-14 sm:py-16 md:py-20 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">

                {[
                    {
                        title: "Our Mission",
                        text: "Deliver verified, secure and premium PG living experiences.",
                        icon: ShieldCheck,
                    },
                    {
                        title: "Our Vision",
                        text: "Become South Asia's most trusted rental ecosystem.",
                        icon: Sparkles,
                    },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 40 }}
                        viewport={{ once: true }}
                        className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition"
                    >
                        <item.icon className="text-purple-400 w-7 h-7 sm:w-8 sm:h-8 mb-3" />
                        <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm sm:text-base">{item.text}</p>
                    </motion.div>
                ))}

            </section>

            {/* VALUES */}
            <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 max-w-7xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
                    Why Choose PG Nexus
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

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
                            whileHover={{ scale: 1.05 }}
                            viewport={{ once: true }}
                            className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:shadow-lg hover:shadow-purple-500/10 transition"
                        >
                            <item.icon className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6 mb-3" />
                            <h3 className="font-semibold mb-1 text-sm sm:text-base">{item.title}</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                        </motion.div>
                    ))}

                </div>
            </section>

            {/* APPROACH */}
            <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="order-2 md:order-1"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        Human Intelligence + AI Precision
                    </h2>

                    <p className="text-gray-400 mb-6 text-sm sm:text-base">
                        We blend real-world property verification with AI matching algorithms
                        to ensure perfect living experiences.
                    </p>

                    <div className="space-y-3 text-gray-300 text-sm sm:text-base">
                        <p>✔ Physical Verification Team</p>
                        <p>✔ AI Room Matching Engine</p>
                        <p>✔ Trusted Owner Network</p>
                    </div>
                </motion.div>

                <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
                    alt="Premium rental interior"
                    className="rounded-3xl h-[240px] sm:h-[320px] md:h-[380px] w-full object-cover shadow-2xl shadow-blue-500/10 order-1 md:order-2"
                />

            </section>

            {/* CTA */}
            <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-28 text-center relative">

                <div className="max-w-3xl mx-auto p-6 sm:p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                        Ready to find your Nexus?
                    </h2>

                    <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
                        Explore verified listings or post your property in minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <button className="px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl hover:scale-105 transition text-sm sm:text-base">
                            Explore Listings
                        </button>

                        <button className="px-6 sm:px-8 py-3 border border-purple-500 text-purple-300 rounded-xl hover:bg-purple-500/10 transition text-sm sm:text-base">
                            List Property
                        </button>
                    </div>
                </div>

            </section>

            <LandpageFooter />
        </div>
    );
}   