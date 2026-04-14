"use client";

import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

import ParticleBg from "@/components/ParticleBg";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingInput from "@/components/FloatingInput";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleLogin = () => {
        if (!email || !password) {
            setError("Please fill all fields");
            return;
        }

        setError("");
        console.log("Login API call");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white relative">
            <ParticleBg />
            <Header />

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-md p-10 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.5)]"
            >
                <h1 className="text-3xl text-center mb-6">Login</h1>

                <div className="space-y-4">
                    <FloatingInput icon={Mail} type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} label="Email" />
                    <FloatingInput icon={Lock} type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} label="Password" />

                    <div className="text-center text-sm text-purple-400 hover:underline cursor-pointer">
                        Forgot Password?
                    </div>
                    {/* {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )} */}

                    <motion.button
                        onClick={handleLogin}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 font-semibold shadow-[0_0_20px_rgba(139,92,246,0.6)] hover:shadow-[0_0_40px_rgba(139,92,246,1)] transition"
                    >
                        Login
                    </motion.button>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Don’t have an account? <a href="/auth/signup" className="text-purple-400 hover:underline">Sign up</a>
                    </p>
                </div>
            </motion.div>

            <Footer />
        </div>
    );
}