"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface AdminThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
    theme: "dark",
    toggleTheme: () => {},
    isDark: true,
    searchQuery: "",
    setSearchQuery: () => {},
});

export function AdminThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("admin-theme") as Theme | null;
        if (saved === "light" || saved === "dark") setTheme(saved);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            localStorage.setItem("admin-theme", next);
            return next;
        });
    };

    return (
        <AdminThemeContext.Provider value={{ 
            theme, 
            toggleTheme, 
            isDark: theme === "dark",
            searchQuery,
            setSearchQuery
        }}>
            {children}
        </AdminThemeContext.Provider>
    );
}

export function useAdminTheme() {
    return useContext(AdminThemeContext);
}
