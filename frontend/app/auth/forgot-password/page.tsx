"use client";

import { useState, useEffect, useRef } from "react";
import {
    Mail,
    Shield,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    RefreshCw,
    KeyRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBg from "@/components/ParticleBg";
import LandpageFooter from "@/components/LandpageFooter";
import FloatingInput from "@/components/FloatingInput";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    requestPasswordOTPApi,
    verifyResetOTPApi,
    resetPasswordWithOTPApi,
} from "@/lib/auth.api";

// ─── Password strength helper ─────────────────────────────────────────────────
function getPasswordStrength(pwd: string) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;
    return score; // 0-5
}

const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

// ─── OTP Input Component ─────────────────────────────────────────────────────
function OTPInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.padEnd(6, "").split("").slice(0, 6);

    const handleChange = (idx: number, val: string) => {
        const sanitized = val.replace(/\D/g, "").slice(-1);
        const newDigits = [...digits];
        newDigits[idx] = sanitized;
        onChange(newDigits.join(""));
        if (sanitized && idx < 5) {
            inputRefs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        onChange(pasted.padEnd(6, "").slice(0, 6));
        const focusIdx = Math.min(pasted.length, 5);
        inputRefs.current[focusIdx]?.focus();
    };

    return (
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
            {Array.from({ length: 6 }).map((_, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                >
                    <input
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digits[idx] || ""}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`
                            w-12 h-14 text-center text-xl font-bold rounded-xl outline-none
                            bg-white/5 border-2 transition-all duration-200
                            ${digits[idx]
                                ? "border-purple-500 text-white bg-purple-500/10"
                                : "border-white/10 text-gray-400"
                            }
                            focus:border-purple-400 focus:bg-purple-500/10 focus:scale-105
                            caret-transparent
                        `}
                    />
                </motion.div>
            ))}
        </div>
    );
}

// ─── Countdown Timer ─────────────────────────────────────────────────────────
function Countdown({ seconds, onDone }: { seconds: number; onDone: () => void }) {
    const [remaining, setRemaining] = useState(seconds);
    // Keep a stable ref so the effect below doesn't re-run when onDone changes
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    // Tick down every second
    useEffect(() => {
        setRemaining(seconds);
        if (seconds <= 0) return;
        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0; // pure — no side effects here
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [seconds]);

    // Fire onDone in a separate effect once remaining hits 0
    useEffect(() => {
        if (remaining === 0) {
            onDoneRef.current();
        }
    }, [remaining]);

    const pct = seconds > 0 ? (remaining / seconds) * 100 : 0;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-12 h-12">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke="#7c3aed" strokeWidth="3"
                        strokeDasharray={`${pct * 0.942} 94.2`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 1s linear" }}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-purple-400">
                    {remaining}
                </span>
            </div>
        </div>
    );
}

// ─── Step indicators ─────────────────────────────────────────────────────────
const STEPS = [
    { label: "Email", icon: Mail },
    { label: "OTP", icon: Shield },
    { label: "Password", icon: Lock },
];

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const done = idx < current;
                const active = idx === current;
                return (
                    <div key={idx} className="flex items-center gap-2">
                        <div
                            className={`
                                flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300
                                ${done ? "border-purple-500 bg-purple-500 text-white" : ""}
                                ${active ? "border-purple-400 bg-purple-500/20 text-purple-400 scale-110 shadow-[0_0_16px_rgba(139,92,246,0.4)]" : ""}
                                ${!done && !active ? "border-white/10 bg-white/5 text-gray-600" : ""}
                            `}
                        >
                            {done ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={`w-8 h-0.5 rounded transition-all duration-500 ${done ? "bg-purple-500" : "bg-white/10"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
    const router = useRouter();

    // Steps: 0 = email, 1 = OTP, 2 = new password, 3 = success
    const [step, setStep] = useState(0);

    // Shared state
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [countdownKey, setCountdownKey] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const pwdStrength = getPasswordStrength(newPassword);
    const pwdMismatch = confirmPassword && newPassword !== confirmPassword;

    // ── Step 1: Send OTP ──────────────────────────────────────────
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setError("Please enter your email address"); return; }
        setError(""); setLoading(true);
        try {
            await requestPasswordOTPApi(email.trim());
            setCanResend(false);
            setCountdownKey((k) => k + 1);
            setStep(1);
        } catch (err: any) {
            setError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Verify OTP ────────────────────────────────────────
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) { setError("Please enter the complete 6-digit OTP"); return; }
        setError(""); setLoading(true);
        try {
            await verifyResetOTPApi(email, otp);
            setStep(2);
        } catch (err: any) {
            setError(err.message ?? "Invalid or expired OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Resend OTP ────────────────────────────────────────────────
    const handleResend = async () => {
        setResendLoading(true); setError(""); setOtp("");
        try {
            await requestPasswordOTPApi(email);
            setCanResend(false);
            setCountdownKey((k) => k + 1);
        } catch (err: any) {
            setError(err.message ?? "Failed to resend OTP");
        } finally {
            setResendLoading(false);
        }
    };

    // ── Step 3: Reset Password ────────────────────────────────────
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
        if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
        setError(""); setLoading(true);
        try {
            await resetPasswordWithOTPApi(email, otp, newPassword);
            setStep(3);
        } catch (err: any) {
            setError(err.message ?? "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────
    const panelVariants = {
        initial: { opacity: 0, y: 32, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -24, scale: 0.97 },
    };
    const panelTransition = { duration: 0.4, ease: "easeOut" as const };
    const panelExitTransition = { duration: 0.25 };

    return (
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBg />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
                {/* Purple glow orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
            </div>

            <Navbar />

            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                <AnimatePresence mode="wait">

                    {/* ── SUCCESS ── */}
                    {step === 3 && (
                        <motion.div
                            key="success"
                            variants={panelVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={panelTransition}
                            className="w-full max-w-md p-8 sm:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)] text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/50 mx-auto mb-6"
                            >
                                <CheckCircle2 size={40} className="text-green-400" />
                            </motion.div>
                            <h1 className="text-3xl font-bold mb-3 tracking-tight">Password Reset!</h1>
                            <p className="text-gray-400 mb-8">
                                Your password has been updated successfully. You can now sign in with your new password.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push("/auth/signin")}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                            >
                                Sign In Now
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── STEP 0: Email ── */}
                    {step === 0 && (
                        <motion.div
                            key="step-email"
                            variants={panelVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={panelTransition}
                            className="w-full max-w-md p-6 sm:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)]"
                        >
                            {/* Header */}
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                                    <KeyRound size={28} className="text-purple-400" />
                                </div>
                            </div>

                            <StepIndicator current={0} />

                            <div className="text-center mb-8">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Forgot Password?</h1>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    No worries! Enter your email and we&apos;ll send a one-time code to reset your password.
                                </p>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
                                    >
                                        <AlertCircle size={16} className="shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSendOTP} className="space-y-5">
                                <FloatingInput
                                    icon={Mail}
                                    type="email"
                                    value={email}
                                    onChange={(e: any) => setEmail(e.target.value)}
                                    label="Email Address"
                                />
                                <motion.button
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send OTP Code <span className="text-lg">→</span></>}
                                </motion.button>
                            </form>

                            <p className="text-center text-sm text-gray-500 mt-6">
                                Remember your password?{" "}
                                <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </motion.div>
                    )}

                    {/* ── STEP 1: OTP ── */}
                    {step === 1 && (
                        <motion.div
                            key="step-otp"
                            variants={panelVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={panelTransition}
                            className="w-full max-w-md p-6 sm:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)]"
                        >
                            <button
                                onClick={() => { setStep(0); setOtp(""); setError(""); }}
                                className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 mb-6 transition-colors"
                            >
                                <ArrowLeft size={15} /> Back
                            </button>

                            <div className="flex justify-center mb-6">
                                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                                    <Shield size={28} className="text-purple-400" />
                                </div>
                            </div>

                            <StepIndicator current={1} />

                            <div className="text-center mb-8">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Check Your Email</h1>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    We sent a 6-digit OTP to{" "}
                                    <span className="text-purple-300 font-medium">{email}</span>
                                </p>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
                                    >
                                        <AlertCircle size={16} className="shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <OTPInput value={otp} onChange={setOtp} />

                                <motion.button
                                    disabled={loading || otp.length < 6}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify OTP <span className="text-lg">→</span></>}
                                </motion.button>
                            </form>

                            {/* Resend */}
                            <div className="mt-6 flex flex-col items-center gap-3">
                                {!canResend ? (
                                    <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                                        <span>OTP expires in</span>
                                        <Countdown
                                            key={countdownKey}
                                            seconds={300}
                                            onDone={() => setCanResend(true)}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleResend}
                                        disabled={resendLoading}
                                        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                                    >
                                        {resendLoading ? (
                                            <Loader2 className="animate-spin" size={14} />
                                        ) : (
                                            <RefreshCw size={14} />
                                        )}
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 2: New Password ── */}
                    {step === 2 && (
                        <motion.div
                            key="step-password"
                            variants={panelVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={panelTransition}
                            className="w-full max-w-md p-6 sm:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)]"
                        >
                            <button
                                onClick={() => { setStep(1); setError(""); }}
                                className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 mb-6 transition-colors"
                            >
                                <ArrowLeft size={15} /> Back
                            </button>

                            <div className="flex justify-center mb-6">
                                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                                    <Lock size={28} className="text-purple-400" />
                                </div>
                            </div>

                            <StepIndicator current={2} />

                            <div className="text-center mb-8">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Create New Password</h1>
                                <p className="text-gray-400 text-sm">
                                    Choose a strong password for your account.
                                </p>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
                                    >
                                        <AlertCircle size={16} className="shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                {/* New password */}
                                <div className="relative">
                                    <FloatingInput
                                        icon={Lock}
                                        type={showPwd ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e: any) => setNewPassword(e.target.value)}
                                        label="New Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {/* Password strength bar */}
                                {newPassword && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                                        <div className="flex gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-1 flex-1 rounded-full transition-all duration-300"
                                                    style={{
                                                        background: i < pwdStrength
                                                            ? strengthColors[pwdStrength]
                                                            : "rgba(255,255,255,0.08)",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs" style={{ color: strengthColors[pwdStrength] }}>
                                            {strengthLabels[pwdStrength]}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Confirm password */}
                                <div className="relative">
                                    <FloatingInput
                                        icon={Lock}
                                        type={showConfirmPwd ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e: any) => setConfirmPassword(e.target.value)}
                                        label="Confirm Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {/* Match indicator */}
                                <AnimatePresence>
                                    {confirmPassword && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`flex items-center gap-2 text-xs ${pwdMismatch ? "text-red-400" : "text-green-400"}`}
                                        >
                                            {pwdMismatch
                                                ? <><AlertCircle size={12} /> Passwords do not match</>
                                                : <><CheckCircle2 size={12} /> Passwords match</>
                                            }
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Password requirements */}
                                <ul className="text-xs text-gray-500 space-y-1 pl-1">
                                    {[
                                        { ok: newPassword.length >= 8, label: "At least 8 characters" },
                                        { ok: /[A-Z]/.test(newPassword), label: "One uppercase letter" },
                                        { ok: /[0-9]/.test(newPassword), label: "One number" },
                                        { ok: /[^A-Za-z0-9]/.test(newPassword), label: "One special character" },
                                    ].map((req, i) => (
                                        <li key={i} className={`flex items-center gap-2 transition-colors ${req.ok ? "text-green-400" : "text-gray-500"}`}>
                                            {req.ok ? <CheckCircle2 size={11} /> : <span className="w-[11px] h-[11px] rounded-full border border-current inline-block" />}
                                            {req.label}
                                        </li>
                                    ))}
                                </ul>

                                <motion.button
                                    disabled={loading || !!pwdMismatch || newPassword.length < 8}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <div className="relative z-10 w-full bg-transparent">
                <LandpageFooter />
            </div>
        </div>
    );
}
