"use client";

import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ParticleBg from "@/components/ParticleBg";
import PasswordChecklist from "@/components/PasswordChecklist";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingInput from "@/components/FloatingInput";
import PasswordStrength from "@/components/PasswordStrength";

export default function SignupPage() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white relative pt-24 pb-20">
            <ParticleBg />
            <Header />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-md p-10 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.5)]"
            >
                <h1 className="text-3xl text-center mb-6">Sign Up</h1>

                <div className="space-y-4">
                    <FloatingInput icon={User} type="text" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} label="Full Name" />
                    <FloatingInput icon={Mail} type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} label="Email" />
                    <FloatingInput icon={Lock} type="password" value={form.password} onChange={(e: any) => setForm({ ...form, password: e.target.value })} label="Password" />

                    <AnimatePresence>
                        {form.password.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <PasswordStrength password={form.password} />
                                <PasswordChecklist password={form.password} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:shadow-[0_0_40px_rgba(59,130,246,1)] transition"
                    >
                        Create Account
                    </motion.button>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Already have an account? <a href="/auth/signin" className="text-purple-400 hover:underline">Login</a>
                    </p>
                </div>
            </motion.div>

            <Footer />
        </div>
    );
}