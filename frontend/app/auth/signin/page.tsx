"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBg from "@/components/ParticleBg";
import LandpageFooter from "@/components/LandpageFooter";
import FloatingInput from "@/components/FloatingInput";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill all fields");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Your API call here
            console.log("Login API call", { email, password });
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulating delay
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
            {/* 1. Fixed Background Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBg />
                {/* Subtle Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
            </div>

            {/* 2. Navigation */}
            <Navbar />

            {/* 3. Main Content Wrapper */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md p-6 sm:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)]"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-gray-400 text-sm">Enter your details to access your account</p>
                    </div>

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <FloatingInput
                            icon={Mail}
                            type="email"
                            value={email}
                            onChange={(e: any) => setEmail(e.target.value)}
                            label="Email"
                        />

                        <div className="relative">
                            <FloatingInput
                                icon={Lock}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e: any) => setPassword(e.target.value)}
                                label="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="flex justify-start">
                            <button type="button" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                Forgot Password?
                            </button>
                        </div>

                        <motion.button
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex justify-center items-center disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
                        </motion.button>

                        <p className="text-center text-sm text-gray-400">
                            Don’t have an account?{" "}
                            <a href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                Create one
                            </a>
                        </p>
                    </form>
                </motion.div>
            </main>

            {/* 4. Full Width Footer */}
            <div className="relative z-10 w-full bg-transparent">
                <LandpageFooter />
            </div>
        </div>
    );
}