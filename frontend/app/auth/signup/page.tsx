"use client";

import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Loader2, Phone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ParticleBg from "@/components/ParticleBg";
import PasswordChecklist from "@/components/PasswordChecklist";
import LandpageFooter from "@/components/LandpageFooter";
import FloatingInput from "@/components/FloatingInput";
import PasswordStrength from "@/components/PasswordStrength";
import Navbar from "@/components/Navbar";

export default function SignupPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "tenant",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Logic to validate password against your checklist criteria
    const isPasswordValid =
        form.password.length >= 8 &&
        /[A-Z]/.test(form.password) &&
        /[0-9]/.test(form.password) &&
        /[^A-Za-z0-9]/.test(form.password);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 1. Check for empty fields
        if (!form.name || !form.email || !form.phone || !form.password) {
            setError("All fields are required");
            return;
        }

        // 2. Check if passwords match
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // 3. Check password criteria
        if (!isPasswordValid) {
            setError("Password does not meet requirements");
            return;
        }

        setLoading(true);

        try {
            // Replace with your actual API call
            console.log("Signing up with:", form);
            // const res = await axios.post("/api/auth/signup", {
            //     full_name: form.name,
            //     email: form.email,
            //     mobile_number: form.phone,
            //     password: form.password,
            //     role: form.role
            // });

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            alert("Signup successful!");

        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBg />
            </div>

            <Navbar />

            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 pt-32 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md sm:max-w-lg p-8 sm:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)]"
                >
                    <h1 className="text-3xl text-center mb-8 font-bold tracking-tight">
                        Create Account
                    </h1>

                    {/* ERROR MESSAGE */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSignup} className="space-y-5">
                        {/* Role Selection */}
                        <div className="flex gap-4">
                            <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${form.role === 'tenant' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}>
                                <input type="radio" name="role" value="tenant" checked={form.role === 'tenant'} onChange={(e) => setForm({ ...form, role: e.target.value })} className="hidden" />
                                <span className="font-medium">Tenant</span>
                            </label>
                            <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${form.role === 'owner' ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}>
                                <input type="radio" name="role" value="owner" checked={form.role === 'owner'} onChange={(e) => setForm({ ...form, role: e.target.value })} className="hidden" />
                                <span className="font-medium">Property Owner</span>
                            </label>
                        </div>

                        <FloatingInput
                            icon={User}
                            type="text"
                            value={form.name}
                            onChange={(e: any) => setForm({ ...form, name: e.target.value })}
                            label="Full Name"
                        />

                        <FloatingInput
                            icon={Mail}
                            type="email"
                            value={form.email}
                            onChange={(e: any) => setForm({ ...form, email: e.target.value })}
                            label="Email"
                        />

                        <FloatingInput
                            icon={Phone}
                            type="tel"
                            value={form.phone}
                            onChange={(e: any) => setForm({ ...form, phone: e.target.value })}
                            label="Mobile Number"
                        />

                        <div className="relative">
                            <FloatingInput
                                icon={Lock}
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={(e: any) => setForm({ ...form, password: e.target.value })}
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

                        <div className="relative">
                            <FloatingInput
                                icon={Lock}
                                type={showConfirm ? "text" : "password"}
                                value={form.confirmPassword}
                                onChange={(e: any) => setForm({ ...form, confirmPassword: e.target.value })}
                                label="Confirm Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {form.password.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <PasswordStrength password={form.password} />
                                    <PasswordChecklist password={form.password} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex justify-center items-center disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Get Started"}
                        </motion.button>

                        <p className="text-center text-sm text-gray-400">
                            Already have an account?{" "}
                            <a href="/auth/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Sign In
                            </a>
                        </p>
                    </form>
                </motion.div>
            </main>

            <div className="relative z-10 w-full">
                <LandpageFooter />
            </div>
        </div>
    );
}