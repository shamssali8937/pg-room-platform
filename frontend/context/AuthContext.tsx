"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { AuthUser, getMeApi } from "@/lib/auth.api";

// ─── Context Shape ────────────────────────────────────────────────

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    /** Call after a successful login to persist credentials. */
    saveSession: (user: AuthUser) => void;
    /** Clear the session (logout). */
    clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Rehydrate by verifying session cookie with the backend
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getMeApi();
                if (response.success) {
                    setUser(response.data);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();

        // Listen for session expiry event from Axios interceptor
        const handleAuthExpired = () => {
            setUser(null);
        };
        window.addEventListener("auth-expired", handleAuthExpired);

        return () => {
            window.removeEventListener("auth-expired", handleAuthExpired);
        };
    }, []);

    const saveSession = useCallback((newUser: AuthUser) => {
        setUser(newUser);
    }, []);

    const clearSession = useCallback(() => {
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                saveSession,
                clearSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return ctx;
}
