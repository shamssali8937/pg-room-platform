"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import LandpageFooter from "@/components/LandpageFooter";
import ParticleBg from "@/components/ParticleBg";
import { CheckCircle } from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
};

export default function TermsPage() {
    return (
        <div className="bg-black text-white min-h-screen relative overflow-hidden">

            {/* FIXED PARTICLE LAYER */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBg />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] opacity-70" />
            </div>

            {/* GLOW ORBS */}
            <div className="absolute top-[-100px] left-[-100px] w-[250px] h-[250px] md:top-[-200px] md:left-[-200px] md:w-[500px] md:h-[500px] bg-purple-500/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[250px] h-[250px] md:bottom-[-200px] md:right-[-200px] md:w-[500px] md:h-[500px] bg-blue-500/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />

            <Navbar />

            {/* ═══════════ HERO ═══════════ */}
            <section className="pt-28 pb-12 sm:pt-32 sm:pb-16 md:pt-36 md:pb-20 text-center px-4 sm:px-6 relative z-10">
                <motion.h1
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ duration: 0.6 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
                >
                    Terms{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                        &amp;
                    </span>{" "}
                    Conditions
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 sm:mt-6 text-gray-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed"
                >
                    Last Updated: October 24, 2024. Please review these legal terms carefully
                    as they govern your access to the PG Nexus ecosystem.
                </motion.p>
            </section>

            {/* ═══════════ CONTENT ═══════════ */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-14 md:space-y-16 pb-16 sm:pb-20 md:pb-24">

                {/* ── 01. Acceptance of Terms ── */}
                <motion.article
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="md:w-1/4 shrink-0">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">
                                Section 01
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">
                                Acceptance of Terms
                            </h2>
                        </div>
                        <div className="md:w-3/4 text-gray-400 leading-relaxed space-y-4 text-sm sm:text-base">
                            <p>
                                By accessing or using the PG Nexus platform, including our website,
                                mobile application, and concierge services (collectively, the
                                &quot;Service&quot;), you agree to be bound by these Terms and Conditions
                                and our Privacy Policy. If you do not agree to these terms, you must
                                immediately cease all use of the Service.
                            </p>
                            <p>
                                PG Nexus reserves the right to modify these terms at any time. Your
                                continued use of the platform following any changes constitutes your
                                acceptance of the updated terms.
                            </p>
                        </div>
                    </div>
                </motion.article>

                {/* ── 02. User Responsibilities ── */}
                <motion.article
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="p-5 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="md:w-1/4 shrink-0">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">
                                Section 02
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">
                                User Responsibilities
                            </h2>
                        </div>
                        <div className="md:w-3/4 text-gray-400 leading-relaxed">
                            <ul className="space-y-4 list-none">
                                {[
                                    "You must be at least 21 years of age to create an account and engage in rental transactions.",
                                    "Account security is your sole responsibility. You must notify us immediately of any unauthorized access.",
                                    "Users agree to provide accurate, current, and complete information during the registration process.",
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3 text-sm sm:text-base">
                                        <CheckCircle className="text-purple-400 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.article>

                {/* ── 03. Property Listings ── */}
                <motion.article
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="md:w-1/4 shrink-0">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">
                                Section 03
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">
                                Property Listings
                            </h2>
                        </div>
                        <div className="md:w-3/4 text-gray-400 leading-relaxed space-y-4 text-sm sm:text-base">
                            <p>
                                While PG Nexus strives for absolute accuracy, property listings are
                                provided for informational purposes. Each luxury rental undergoes a
                                proprietary 50-point verification process, but final environmental
                                conditions may vary.
                            </p>
                            <p>
                                PG Nexus acts as a curated marketplace and intermediary. Specific
                                property rules (e.g., noise ordinances, pet policies) are dictated by
                                individual property owners and must be strictly adhered to.
                            </p>
                        </div>
                    </div>
                </motion.article>

                {/* ── 04. Booking & Payments ── */}
                <motion.article
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="p-5 sm:p-8 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="md:w-1/4 shrink-0">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">
                                Section 04
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">
                                Booking &amp; Payments
                            </h2>
                        </div>
                        <div className="md:w-3/4 text-gray-400 leading-relaxed space-y-4 text-sm sm:text-base">
                            <p>
                                All bookings are subject to availability and confirmation. A security
                                deposit is required for all premium residences and will be held until
                                48 hours post-checkout.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                                    <span className="block text-white font-bold mb-1 text-sm sm:text-base">
                                        Currency
                                    </span>
                                    <span className="text-xs sm:text-sm">
                                        All transactions are processed in PKR or local market equivalent.
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                                    <span className="block text-white font-bold mb-1 text-sm sm:text-base">
                                        Taxation
                                    </span>
                                    <span className="text-xs sm:text-sm">
                                        Local hospitality taxes and service fees are calculated at checkout.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.article>

                {/* ── 05. Cancellation Policy ── */}
                <motion.article
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="md:w-1/4 shrink-0">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">
                                Section 05
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">
                                Cancellation Policy
                            </h2>
                        </div>
                        <div className="md:w-3/4 text-gray-400 leading-relaxed text-sm sm:text-base">
                            <p className="mb-4">
                                Our tiered cancellation structure ensures fairness for both members
                                and property owners:
                            </p>
                            <div className="space-y-0">
                                <div className="flex justify-between items-center py-3 border-b border-white/[0.08]">
                                    <span>30+ Days Before</span>
                                    <span className="text-white font-semibold">100% Refund</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-white/[0.08]">
                                    <span>14–30 Days Before</span>
                                    <span className="text-white font-semibold">50% Refund</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span>Less than 14 Days</span>
                                    <span className="text-red-400 font-semibold">No Refund</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.article>

                {/* ── 06. Privacy & Data Protection ── */}
                <motion.article
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="p-5 sm:p-8 rounded-2xl bg-white/[0.03] border-l-4 border-purple-500"
                >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="md:w-1/4 shrink-0">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">
                                Section 06
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">
                                Privacy &amp; Data
                            </h2>
                        </div>
                        <div className="md:w-3/4 text-gray-400 leading-relaxed text-sm sm:text-base">
                            <p>
                                We take data sovereignty seriously. PG Nexus utilizes enterprise-grade
                                encryption for all personal identifiers. We do not sell user data to
                                third-party marketing entities. Your biometric and payment data is
                                handled exclusively by PCI-DSS compliant processors.
                            </p>
                        </div>
                    </div>
                </motion.article>

                {/* ── 07. Limitation of Liability ── */}
                <motion.article
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="md:w-1/4 shrink-0">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">
                                Section 07
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">
                                Limitation of Liability
                            </h2>
                        </div>
                        <div className="md:w-3/4 text-gray-400 leading-relaxed italic text-sm sm:text-base">
                            <p>
                                &quot;To the maximum extent permitted by applicable law, PG Nexus
                                shall not be liable for any indirect, incidental, special,
                                consequential, or punitive damages, or any loss of profits or
                                revenues, whether incurred directly or indirectly, or any loss of
                                data, use, goodwill, or other intangible losses.&quot;
                            </p>
                        </div>
                    </div>
                </motion.article>

            </main>

            {/* ═══════════ CTA ═══════════ */}
            <section className="relative z-10 px-4 sm:px-6 pb-16 sm:pb-20 md:pb-28 text-center">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto p-6 sm:p-8 md:p-12 rounded-3xl bg-gradient-to-tr from-white/[0.04] to-white/[0.02] border border-white/[0.08] shadow-2xl backdrop-blur-xl"
                >
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                        Still have questions?
                    </h3>
                    <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
                        Our legal and support teams are available 24/7 for our members.
                    </p>
                    <button className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold tracking-wide uppercase text-xs sm:text-sm hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-all">
                        Contact Legal Team
                    </button>
                </motion.div>
            </section>

            <LandpageFooter />
        </div>
    );
}
