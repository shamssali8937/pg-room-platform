"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react"; // Install lucide-react or use SVG

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: "Features", href: "/#features" },
        { name: "About", href: "/general/aboutus" },
        { name: "Privacy", href: "/general/privacy" },
        { name: "Terms", href: "/general/term&conditions" },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 text-white">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* LOGO */}
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                    PG Nexus
                </div>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex gap-8 items-center text-sm font-medium">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="relative group text-gray-300 hover:text-white transition-colors"
                        >
                            {link.name}
                            {/* Animated Underline */}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}

                    <div className="flex gap-4 ml-4">
                        <a href="/auth/signin" className="px-5 py-2 border border-purple-500/50 rounded-lg hover:bg-purple-500/10 transition-all active:scale-95">
                            Login
                        </a>
                        <a href="/auth/signup" className="px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all active:scale-95">
                            Sign Up
                        </a>
                    </div>
                </div>

                {/* MOBILE MENU BUTTON */}
                <button
                    className="md:hidden p-2 text-gray-300 hover:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* MOBILE NAV DROPDOWN */}
            <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"} bg-black/90 border-b border-white/10`}>
                <div className="flex flex-col gap-4 p-6 text-center">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="text-lg text-gray-300 hover:text-purple-400"
                        >
                            {link.name}
                        </a>
                    ))}
                    <hr className="border-white/10 my-2" />
                    <a href="/auth/signin" className="text-purple-400 font-semibold py-2">Login</a>
                    <a href="/auth/signup" className="bg-gradient-to-r from-purple-500 to-blue-600 py-3 rounded-xl font-bold">Sign Up</a>
                </div>
            </div>
        </nav>
    );
}