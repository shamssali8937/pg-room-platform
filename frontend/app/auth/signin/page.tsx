"use client";

import { useState, useEffect, Suspense } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBg from "@/components/ParticleBg";
import LandpageFooter from "@/components/LandpageFooter";
import FloatingInput from "@/components/FloatingInput";
import Navbar from "@/components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginApi, forgotPasswordApi } from "@/lib/auth.api";

function LoginContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Forgot password state
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMsg, setForgotMsg] = useState("");
    const [forgotError, setForgotError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const { saveSession } = useAuth();

    // ─── Query Params Handling ────────────────────────────────────
    useEffect(() => {
        const verified = searchParams.get("verified");
        const queryError = searchParams.get("error");
        
        if (verified === "true") {
            setSuccessMsg("Email verified successfully! You can now sign in.");
        }
        if (queryError === "verification_failed") {
            setError("Email verification failed. The link might be invalid or expired.");
        }
    }, [searchParams]);

    // ─── Role-based redirect ──────────────────────────────────────
    const redirectByRole = (role: string) => {
        if (role === "admin") return router.push("/admin/dashboard");
        if (role === "owner") return router.push("/owner/dashboard");
        return router.push("/tenant/dashboard");
    };

    // ─── Google OAuth handler ──────────────────────────────────────
    const handleGoogleSignIn = () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
        window.location.href = `${apiBaseUrl}/auth/google?role=tenant`;
    };

    // ─── Login handler ────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill all fields");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const data = await loginApi({ email, password });
            saveSession(data.user);
            redirectByRole(data.user.role);
        } catch (err: any) {
            setError(err.message ?? "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ─── Forgot password handler ──────────────────────────────────
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail) {
            setForgotError("Please enter your email address");
            return;
        }
        setForgotError("");
        setForgotMsg("");
        setForgotLoading(true);
        try {
            const res = await forgotPasswordApi(forgotEmail);
            setForgotMsg(res.message);
        } catch (err: any) {
            setForgotError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
            {/* Fixed Background Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBg />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
            </div>

            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                <AnimatePresence mode="wait">
                    {/* ── FORGOT PASSWORD PANEL ── */}
                    {showForgot ? (
                        <motion.div
                            key="forgot"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="w-full max-w-md p-6 sm:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)]"
                        >
                            <button
                                onClick={() => { setShowForgot(false); setForgotMsg(""); setForgotError(""); }}
                                className="text-sm text-purple-400 hover:text-purple-300 mb-6 flex items-center gap-1 transition-colors"
                            >
                                ← Back to Sign In
                            </button>

                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold tracking-tight mb-2">Reset Password</h1>
                                <p className="text-gray-400 text-sm">
                                    Enter your email and we&apos;ll send you a reset link
                                </p>
                            </div>

                            <AnimatePresence>
                                {forgotError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
                                    >
                                        <AlertCircle size={16} />
                                        {forgotError}
                                    </motion.div>
                                )}
                                {forgotMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/50 text-green-400 text-sm"
                                    >
                                        <CheckCircle2 size={16} />
                                        {forgotMsg}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <FloatingInput
                                    icon={Mail}
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e: any) => setForgotEmail(e.target.value)}
                                    label="Email Address"
                                />
                                <motion.button
                                    disabled={forgotLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex justify-center items-center disabled:opacity-70"
                                >
                                    {forgotLoading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
                                </motion.button>
                            </form>
                        </motion.div>
                    ) : (
                        /* ── LOGIN PANEL ── */
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="w-full max-w-md p-6 sm:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)]"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
                                <p className="text-gray-400 text-sm">Enter your details to access your account</p>
                            </div>

                            {/* Success & Error Display */}
                            <AnimatePresence>
                                {successMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/50 text-green-400 text-sm"
                                    >
                                        <CheckCircle2 size={16} />
                                        {successMsg}
                                    </motion.div>
                                )}
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
                                    <button
                                        type="button"
                                        onClick={() => { setShowForgot(true); setError(""); }}
                                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                    >
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
                                    onClick={handleGoogleSignIn}
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
                                    Sign In with Google
                                </motion.button>

                                <p className="text-center text-sm text-gray-400">
                                    Don&apos;t have an account?{" "}
                                    <a href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                        Create one
                                    </a>
                                </p>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <div className="relative z-10 w-full bg-transparent">
                <LandpageFooter />
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin text-purple-500" size={48} /></div>}>
            <LoginContent />
        </Suspense>
    );
}