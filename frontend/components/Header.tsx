"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react"; // Install lucide-react if not already present
import Link from "next/link";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed top-0 w-full backdrop-blur-xl bg-black/30 border-b border-white/10 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/">
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text cursor-pointer">
                        PG Nexus
                    </h1>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex gap-4">
                    <Link
                        href="/auth/signin"
                        className="px-5 py-2 rounded-lg border border-purple-500 text-purple-400 hover:bg-purple-500/20 transition"
                    >
                        Login
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 hover:scale-105 transition text-white"
                    >
                        Sign Up
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-black/90 border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-200">
                    <Link
                        href="/auth/signin"
                        onClick={() => setIsOpen(false)}
                        className="w-full text-center px-5 py-3 rounded-lg border border-purple-500 text-purple-400"
                    >
                        Login
                    </Link>
                    <Link
                        href="/auth/signup"
                        onClick={() => setIsOpen(false)}
                        className="w-full text-center px-5 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                    >
                        Sign Up
                    </Link>
                </div>
            )}
        </header>
    );
}