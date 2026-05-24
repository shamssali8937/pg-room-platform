"use client";

import {
    createContext,
    useContext,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { AuthUser } from "@/lib/auth.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateAuth, setUser, clearUser } from "@/store/slices/authSlice";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    saveSession: (user: AuthUser) => void;
    clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

    // Rehydrate by verifying session cookie with the backend
    useEffect(() => {
        dispatch(hydrateAuth());

        // Listen for session expiry event from Axios interceptor
        const handleAuthExpired = () => {
            dispatch(clearUser());
        };
        window.addEventListener("auth-expired", handleAuthExpired);
        return () => window.removeEventListener("auth-expired", handleAuthExpired);
    }, [dispatch]);

    const saveSession = useCallback(
        (newUser: AuthUser) => {
            dispatch(setUser(newUser));
        },
        [dispatch]
    );

    const clearSession = useCallback(() => {
        dispatch(clearUser());
    }, [dispatch]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                saveSession,
                clearSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return ctx;
}
