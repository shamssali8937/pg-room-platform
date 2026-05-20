"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMeApi } from "@/lib/auth.api";
import { Loader2 } from "lucide-react";
import ParticleBg from "@/components/ParticleBg";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { saveSession } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const status = searchParams.get("status");

            if (status !== "success") {
                router.replace("/auth/signin?error=oauth_failed");
                return;
            }

            try {
                // Fetch the authenticated user's profile using the session cookies
                const response = await getMeApi();
                
                if (response.success && response.data) {
                    saveSession(response.data);
                    
                    const role = response.data.role;
                    if (role === "admin") {
                        router.replace("/admin/dashboard");
                    } else if (role === "owner") {
                        router.replace("/owner/dashboard");
                    } else {
                        router.replace("/tenant/dashboard");
                    }
                } else {
                    router.replace("/auth/signin?error=oauth_failed");
                }
            } catch (err) {
                console.error("Error during Google auth callback:", err);
                router.replace("/auth/signin?error=oauth_failed");
            }
        };

        handleCallback();
    }, [router, searchParams, saveSession]);

    return (
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col items-center justify-center">
            {/* Fixed Background Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticleBg />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)] max-w-sm w-full text-center">
                <Loader2 className="animate-spin text-purple-500" size={48} />
                <h2 className="text-xl font-bold">Completing authentication...</h2>
                <p className="text-gray-400 text-sm">Please wait while we set up your secure session.</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
                <p className="text-gray-400">Loading...</p>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
