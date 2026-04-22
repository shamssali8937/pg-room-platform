"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import LandpageFooter from "@/components/LandpageFooter";
import ParticleBg from "@/components/ParticleBg";
import Card from "@/components/Card";
import {
    ShieldCheck,
    CreditCard,
    Ban,
    Lock,
    FileText,
    AlertTriangle,
} from "lucide-react";

export default function TermsPage() {
    return (
        <div className="bg-black text-white min-h-screen relative overflow-hidden">

            {/* PARTICLES */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBg />
                {/* Subtle radial overlay to focus light on center and keep edges deep */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] opacity-70" />
            </div>


            {/* GLOW BACKGROUND */}
            <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />

            <Navbar />

            {/* HERO */}
            <section className="pt-36 pb-20 text-center px-6">
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-extrabold"
                >
                    Terms &{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                        Conditions
                    </span>
                </motion.h1>

                <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
                    Please read these terms carefully before using PG Nexus platform and services.
                </p>
            </section>

            {/* CONTENT GRID */}
            <section className="max-w-6xl mx-auto px-6 space-y-8 pb-24">

                {/* SECTION 1 */}
                <Card
                    icon={FileText}
                    title="Acceptance of Terms"
                    text="By using PG Nexus, you agree to our platform rules, privacy policy, and rental guidelines. Continued use means acceptance of updates."
                />

                {/* SECTION 2 */}
                <Card
                    icon={ShieldCheck}
                    title="User Responsibilities"
                    list={[
                        "Must be 21+ to use platform",
                        "Provide accurate information",
                        "Protect account credentials",
                    ]}
                />

                {/* SECTION 3 */}
                <Card
                    icon={FileText}
                    title="Property Listings"
                    text="All listings are verified through our internal system, but final property conditions may vary based on owner management."
                />

                {/* SECTION 4 */}
                <Card
                    icon={CreditCard}
                    title="Booking & Payments"
                    text="Payments are securely processed. Security deposits are held until checkout verification."
                    grid={[
                        { label: "Currency", value: "PKR / Local Equivalent" },
                        { label: "Fees", value: "Service charges apply at checkout" },
                    ]}
                />

                {/* SECTION 5 */}
                <Card
                    icon={Ban}
                    title="Cancellation Policy"
                    list={[
                        "30+ days: 100% refund",
                        "14–30 days: 50% refund",
                        "Less than 14 days: No refund",
                    ]}
                />

                {/* SECTION 6 */}
                <Card
                    icon={Lock}
                    title="Privacy & Data Protection"
                    text="Your data is encrypted and never sold. We follow strict security standards for all transactions."
                />

                {/* SECTION 7 */}
                <Card
                    icon={AlertTriangle}
                    title="Limitation of Liability"
                    text="PG Nexus is not liable for indirect damages, disputes, or losses arising from third-party property usage."
                    highlight
                />

            </section>

            {/* CTA */}
            <section className="px-6 pb-28 text-center">
                <div className="max-w-3xl mx-auto p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
                    <p className="text-gray-400 mb-6">
                        Our support team is available 24/7 for legal and platform queries.
                    </p>

                    <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl hover:scale-105 transition">
                        Contact Support
                    </button>
                </div>
            </section>

            <LandpageFooter />
        </div>
    );
}

