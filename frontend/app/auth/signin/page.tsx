"use client";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-black to-blue-900 animate-pulse opacity-40" />

            {/* Moving Glow Orbs */}
            <div className="absolute w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-30 animate-[spin_20s_linear_infinite] top-[-100px] left-[-100px]" />
            <div className="absolute w-[400px] h-[400px] bg-blue-600 rounded-full blur-[120px] opacity-30 animate-[spin_25s_linear_infinite_reverse] bottom-[-100px] right-[-100px]" />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_0_60px_rgba(139,92,246,0.3)]"
            >
                <h1 className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                    Login
                </h1>

                <div className="space-y-5">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl focus-within:border-purple-400 transition">
                        <Mail size={18} />
                        <input
                            type="email"
                            placeholder="Email"
                            className="bg-transparent outline-none w-full text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl focus-within:border-blue-400 transition">
                        <Lock size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            className="bg-transparent outline-none w-full text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 font-semibold shadow-lg"
                    >
                        Login
                    </motion.button>
                </div>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Don’t have an account? <a href="/signup" className="text-purple-400">Sign up</a>
                </p>
            </motion.div>
        </div>
    );
}