"use client";

import { useState } from "react";
import {
    Mail,
    Lock,
    User,
    Phone,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ParticleBg from "@/components/ParticleBg";
import PasswordChecklist from "@/components/PasswordChecklist";
import LandpageFooter from "@/components/LandpageFooter";
import FloatingInput from "@/components/FloatingInput";
import PasswordStrength from "@/components/PasswordStrength";
import Navbar from "@/components/Navbar";
import { signupApi } from "@/lib/auth.api";

export default function SignupPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        mobile_number: "",
        password: "",
        confirmPassword: "",
        role: "tenant" as "tenant" | "owner",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Validate password strength criteria
    const isPasswordValid =
        form.password.length >= 8 &&
        /[A-Z]/.test(form.password) &&
        /[0-9]/.test(form.password) &&
        /[^A-Za-z0-9]/.test(form.password);

    const handleGoogleSignUp = () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
        window.location.href = `${apiBaseUrl}/auth/google?role=${form.role}`;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        // Validation
        if (!form.name || !form.email || !form.password) {
            setError("All fields are required");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!isPasswordValid) {
            setError("Password does not meet requirements");
            return;
        }

        setLoading(true);

        try {
            const res = await signupApi({
                full_name: form.name,
                email: form.email,
                password: form.password,
                mobile_number: form.mobile_number || undefined,
                role: form.role,
            });

            setSuccessMsg(res.message);
            // Clear form on success
            setForm({
                name: "",
                email: "",
                mobile_number: "",
                password: "",
                confirmPassword: "",
                role: "tenant",
            });
        } catch (err: any) {
            setError(err.message ?? "Something went wrong. Please try again.");
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

                    {/* SUCCESS MESSAGE */}
                    <AnimatePresence>
                        {successMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/50 text-green-400 text-sm text-center flex flex-col items-center gap-2"
                            >
                                <CheckCircle2 size={24} />
                                <p className="font-semibold">{successMsg}</p>
                                <p className="text-green-500/70 text-xs">
                                    Please check your inbox and verify your email before signing in.
                                </p>
                                <a
                                    href="/auth/signin"
                                    className="mt-2 text-xs font-bold text-green-300 hover:text-green-200 underline underline-offset-2 transition-colors"
                                >
                                    Go to Sign In →
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>

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

                    {!successMsg && (
                        <form onSubmit={handleSignup} className="space-y-5">
                            {/* Role Selection */}
                            <div className="flex gap-4">
                                <label
                                    className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                                        form.role === "tenant"
                                            ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value="tenant"
                                        checked={form.role === "tenant"}
                                        onChange={(e) =>
                                            setForm({ ...form, role: e.target.value as "tenant" | "owner" })
                                        }
                                        className="hidden"
                                    />
                                    <span className="font-medium">Tenant</span>
                                </label>
                                <label
                                    className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                                        form.role === "owner"
                                            ? "bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value="owner"
                                        checked={form.role === "owner"}
                                        onChange={(e) =>
                                            setForm({ ...form, role: e.target.value as "tenant" | "owner" })
                                        }
                                        className="hidden"
                                    />
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
                                value={form.mobile_number}
                                onChange={(e: any) =>
                                    setForm({ ...form, mobile_number: e.target.value })
                                }
                                label="Mobile Number (optional)"
                            />

                            <div className="relative">
                                <FloatingInput
                                    icon={Lock}
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e: any) =>
                                        setForm({ ...form, password: e.target.value })
                                    }
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
                                    onChange={(e: any) =>
                                        setForm({ ...form, confirmPassword: e.target.value })
                                    }
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

                            <div className="relative my-5 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <span className="relative px-3 bg-[#0a0a0a] text-xs text-gray-500 uppercase tracking-wider">
                                    Or continue with
                                </span>
                            </div>

                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGoogleSignUp}
                                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-medium transition-all flex justify-center items-center gap-3 text-sm text-white"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.53 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.69 3.42-4.51 6.76-4.51z"
                                    />
                                    <path
                                        fill="#4285F4"
                                        d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.5z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.24 14.88c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.39 7.49C.5 9.29 0 11.29 0 13.4s.5 4.11 1.39 5.91l3.85-2.98c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.34 0-5.86-1.82-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z"
                                    />
                                </svg>
                                Sign Up with Google
                            </motion.button>

                            <p className="text-center text-sm text-gray-400">
                                Already have an account?{" "}
                                <a
                                    href="/auth/signin"
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    Sign In
                                </a>
                            </p>
                        </form>
                    )}
                </motion.div>
            </main>

            <div className="relative z-10 w-full">
                <LandpageFooter />
            </div>
        </div>
    );
}