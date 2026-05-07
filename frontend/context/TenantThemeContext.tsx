"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

interface TenantThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const TenantThemeContext = createContext<TenantThemeContextType>({
    theme: "dark",
    toggleTheme: () => {},
    isDark: true,
    searchQuery: "",
    setSearchQuery: () => {},
});

export function TenantThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("tenant-theme") as Theme | null;
        if (saved === "light" || saved === "dark") setTheme(saved);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            root.style.colorScheme = "dark";
        } else {
            root.classList.remove("dark");
            root.style.colorScheme = "light";
        }
        localStorage.setItem("tenant-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <TenantThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark", searchQuery, setSearchQuery }}>
            {children}
        </TenantThemeContext.Provider>
    );
}

export const useTenantTheme = () => useContext(TenantThemeContext);
