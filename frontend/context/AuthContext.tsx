"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { AuthUser } from "@/lib/auth.api";

// ─── Context Shape ────────────────────────────────────────────────

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    /** Call after a successful login to persist credentials. */
    saveSession: (token: string, user: AuthUser) => void;
    /** Clear the session (logout). */
    clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Rehydrate from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("pg_token");
        const storedUser = localStorage.getItem("pg_user");
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("pg_token");
                localStorage.removeItem("pg_user");
            }
        }
        setIsLoading(false);
    }, []);

    const saveSession = useCallback((newToken: string, newUser: AuthUser) => {
        localStorage.setItem("pg_token", newToken);
        localStorage.setItem("pg_user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem("pg_token");
        localStorage.removeItem("pg_user");
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
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
