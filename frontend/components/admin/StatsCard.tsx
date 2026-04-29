"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useAdminTheme } from "@/context/AdminThemeContext";

interface StatsCardProps {
    title: string;
    value: string;
    tag: string;
    tagType?: "trend" | "info" | "danger" | "secondary" | "tertiary" | "error";
    accentColor?: string;
    index?: number;
}

const accentColors: Record<string, string> = {
    trend: "border-l-blue-500",
    info: "border-l-purple-400",
    danger: "border-l-red-500",
    secondary: "border-l-blue-400",
    tertiary: "border-l-pink-400",
    error: "border-l-red-500",
};

const tagTextColors: Record<string, string> = {
    trend: "text-blue-500",
    info: "text-purple-500",
    danger: "text-red-500",
    secondary: "text-blue-500",
    tertiary: "text-pink-500",
    error: "text-red-500",
};

const tagTextColorsDark: Record<string, string> = {
    trend: "text-blue-400",
    info: "text-purple-400",
    danger: "text-red-400",
    secondary: "text-blue-400",
    tertiary: "text-pink-400",
    error: "text-red-400",
};

export default function StatsCard({
    title,
    value,
    tag,
    tagType = "info",
    accentColor,
    index = 0,
}: StatsCardProps) {
    const { isDark } = useAdminTheme();
    const borderClass = accentColor || accentColors[tagType] || "border-l-purple-400";
    const tagColor = isDark
        ? tagTextColorsDark[tagType] || "text-purple-400"
        : tagTextColors[tagType] || "text-purple-500";

    const cardBg = isDark
        ? "bg-zinc-900/60 hover:bg-zinc-900/80"
        : "bg-white hover:bg-slate-50 shadow-sm shadow-slate-200/80";
    const titleColor = isDark ? "text-zinc-500" : "text-slate-500";
    const valueColor = isDark ? "text-white" : "text-slate-900";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -2 }}
            className={`p-4 sm:p-6 rounded-2xl border-l-4 ${borderClass} ${cardBg} transition-colors duration-300`}
        >
            <p className={`${titleColor} text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] mb-1`}>
                {title}
            </p>
            <h3
                className={`text-2xl sm:text-3xl font-black tracking-tight ${valueColor}`}
                style={{ fontFamily: "Manrope, sans-serif" }}
            >
                {value}
            </h3>
            <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium ${tagColor}`}>
                {tagType === "trend" && <TrendingUp size={11} className="inline mr-1" />}
                {tag}
            </p>
        </motion.div>
    );
}