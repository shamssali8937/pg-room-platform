"use client";

import { useState, useRef, useEffect } from "react";
import {
    Mail,
    Lock,
    User,
    Phone,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    RefreshCw,
    ArrowLeft,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ParticleBg from "@/components/ParticleBg";
import PasswordChecklist from "@/components/PasswordChecklist";
import LandpageFooter from "@/components/LandpageFooter";
import FloatingInput from "@/components/FloatingInput";
import PasswordStrength from "@/components/PasswordStrength";
import Navbar from "@/components/Navbar";
import { signupApi, verifyEmailOtpApi, resendEmailOtpApi } from "@/lib/auth.api";
import { useRouter } from "next/navigation";

type Step = "form" | "otp" | "done";

const RESEND_COOLDOWN = 60; // seconds

function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!local || !domain) return email;
    const visible = local.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("form");

    // ── Form state ─────────────────────────────────────────────────────────────
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // ── OTP state ──────────────────────────────────────────────────────────────
    const [otpEmail, setOtpEmail] = useState("");   // email returned from signup
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Resend countdown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            timerRef.current = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [resendCooldown]);

    const isPasswordValid =
        form.password.length >= 8 &&
        /[A-Z]/.test(form.password) &&
        /[0-9]/.test(form.password) &&
        /[^A-Za-z0-9]/.test(form.password);

    const handleGoogleSignUp = () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
        window.location.href = `${apiBaseUrl}/auth/google?role=${form.role}`;
    };

    // ── Signup submit ──────────────────────────────────────────────────────────
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

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

            setOtpEmail(res.email ?? form.email);
            setResendCooldown(RESEND_COOLDOWN);
            setStep("otp");
            // Focus first OTP input after transition
            setTimeout(() => inputRefs.current[0]?.focus(), 400);
        } catch (err: any) {
            setError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── OTP input handling ─────────────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);
        setOtpError("");

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        // Auto-submit when all 6 digits are filled
        if (digit && index === 5 && next.every(Boolean)) {
            submitOtp(next.join(""));
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            const digits = pasted.split("");
            setOtp(digits);
            setOtpError("");
            inputRefs.current[5]?.focus();
            setTimeout(() => submitOtp(pasted), 50);
        }
    };

    // ── OTP verification ───────────────────────────────────────────────────────
    const submitOtp = async (code: string) => {
        if (code.length !== 6) return;
        setOtpLoading(true);
        setOtpError("");
        try {
            await verifyEmailOtpApi(otpEmail, code);
            setStep("done");
        } catch (err: any) {
            setOtpError(err.message ?? "Invalid OTP. Please try again.");
            setOtp(["", "", "", "", "", ""]);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyClick = () => {
        const code = otp.join("");
        if (code.length < 6) {
            setOtpError("Please enter all 6 digits.");
            return;
        }
        submitOtp(code);
    };

    // ── Resend OTP ─────────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (resendCooldown > 0 || resendLoading) return;
        setResendLoading(true);
        setOtpError("");
        try {
            await resendEmailOtpApi(otpEmail);
            setOtp(["", "", "", "", "", ""]);
            setResendCooldown(RESEND_COOLDOWN);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } catch (err: any) {
            setOtpError(err.message ?? "Failed to resend OTP. Please try again.");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBg />
            </div>

            <Navbar />

            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 pt-24 sm:pt-32 pb-16 sm:pb-20">
                <AnimatePresence mode="wait">

                    {/* ── SIGNUP FORM ─────────────────────────────────────────── */}
                    {step === "form" && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -60 }}
                            transition={{ duration: 0.3 }}
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
                        </motion.div>
                    )}

                    {/* ── OTP VERIFICATION STEP ───────────────────────────────── */}
                    {step === "otp" && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 60 }}
                            transition={{ duration: 0.3 }}
                            className="w-full max-w-md p-8 sm:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.2)]"
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                                    <ShieldCheck size={32} className="text-purple-400" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-center mb-2">Verify your email</h1>
                            <p className="text-sm text-gray-400 text-center mb-1">
                                We sent a 6-digit code to
                            </p>
                            <p className="text-sm font-semibold text-purple-300 text-center mb-8">
                                {maskEmail(otpEmail)}
                            </p>

                            {/* OTP Error */}
                            <AnimatePresence>
                                {otpError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm text-center"
                                    >
                                        {otpError}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 6-digit OTP inputs */}
                            <div
                                className="flex gap-3 justify-center mb-8"
                                onPaste={handleOtpPaste}
                            >
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border bg-white/5 text-white outline-none transition-all
                                            ${digit
                                                ? "border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                                                : "border-white/15 focus:border-purple-500/70 focus:shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                                            }
                                            ${otpError ? "border-red-500/50 shake" : ""}
                                        `}
                                        disabled={otpLoading}
                                        aria-label={`OTP digit ${i + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Verify button */}
                            <motion.button
                                onClick={handleVerifyClick}
                                disabled={otpLoading || otp.join("").length < 6}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed mb-5"
                            >
                                {otpLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <ShieldCheck size={18} className="mr-2" />
                                        Verify Email
                                    </>
                                )}
                            </motion.button>

                            {/* Resend */}
                            <div className="text-center">
                                {resendCooldown > 0 ? (
                                    <p className="text-sm text-gray-500">
                                        Resend code in{" "}
                                        <span className="text-purple-400 font-semibold tabular-nums">
                                            {resendCooldown}s
                                        </span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResend}
                                        disabled={resendLoading}
                                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 mx-auto disabled:opacity-60"
                                    >
                                        {resendLoading ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <RefreshCw size={14} />
                                        )}
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            {/* Back to form */}
                            <div className="mt-6 pt-5 border-t border-white/10 flex justify-center">
                                <button
                                    onClick={() => {
                                        setStep("form");
                                        setOtp(["", "", "", "", "", ""]);
                                        setOtpError("");
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
                                >
                                    <ArrowLeft size={12} />
                                    Back to sign up
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── DONE / SUCCESS ──────────────────────────────────────── */}
                    {step === "done" && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, type: "spring" }}
                            className="w-full max-w-md p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(34,197,94,0.15)] text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="flex justify-center mb-6"
                            >
                                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                                    <CheckCircle2 size={40} className="text-green-400" />
                                </div>
                            </motion.div>

                            <h1 className="text-2xl font-bold mb-3">Email Verified!</h1>
                            <p className="text-gray-400 text-sm mb-8">
                                Your account is ready. You can now sign in to PG Nexus.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push("/auth/signin?verified=true")}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all"
                            >
                                Go to Sign In →
                            </motion.button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            <div className="relative z-10 w-full">
                <LandpageFooter />
            </div>
        </div>
    );
}