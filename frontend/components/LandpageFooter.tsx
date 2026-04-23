import {
    MapPin,
    ShieldCheck,
    FileText,
    Users,
    Mail,
    Headset,
    Globe,
    AtSign,
    Send,
    Code,
    ChevronRight,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-transparent backdrop-blur-sm text-gray-400">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <h3 className="text-white font-bold text-lg tracking-tight">PG Nexus</h3>
                        <p className="text-sm leading-relaxed">
                            A trusted discovery marketplace for verified room rentals and PG listings.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-3 pt-2">
                            {[
                                { icon: Globe, href: "#" },
                                { icon: AtSign, href: "#" },
                                { icon: Send, href: "#" },
                                { icon: Code, href: "#" },
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore Section */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-400" />
                            Explore Cities
                        </h3>
                        <ul className="space-y-2 text-sm">
                            {["Karachi", "Lahore", "Islamabad"].map((city) => (
                                <li key={city} className="hover:text-white transition-colors cursor-pointer flex items-center gap-2 group">
                                    <ChevronRight className="w-3 h-3 text-purple-500/0 group-hover:text-purple-400 transition-all duration-300 -ml-1" />
                                    {city}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Section */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                            Legal
                        </h3>
                        <ul className="space-y-2 text-sm">
                            {[
                                { label: "Privacy Policy", href: "/general/privacypolicy", icon: ShieldCheck },
                                { label: "Terms & Conditions", href: "/general/termsandcondition", icon: FileText },
                                { label: "About Us", href: "/general/aboutus", icon: Users },
                            ].map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="cursor-pointer hover:text-white transition-colors flex items-center gap-2 group"
                                    >
                                        <ChevronRight className="w-3 h-3 text-purple-500/0 group-hover:text-blue-400 transition-all duration-300 -ml-1" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Headset className="w-4 h-4 text-pink-400" />
                            Support
                        </h3>
                        <div className="space-y-3 text-sm">
                            <p className="cursor-pointer italic flex items-center gap-2 hover:text-white transition-colors">
                                <Users className="w-4 h-4 text-gray-500" />
                                Shams Ali Mehdi
                            </p>
                            <a href="mailto:support@pgnexus.com" className="flex items-center gap-2 hover:text-white transition-colors">
                                <Mail className="w-4 h-4 text-gray-500" />
                                support@pgnexus.com
                            </a>
                            <a href="/general/contactus" className="flex items-center gap-2 hover:text-white transition-colors">
                                <Headset className="w-4 h-4 text-gray-500" />
                                Contact Us
                            </a>
                            <p className="text-xs mt-2 opacity-70">
                                Built for founders and urban renters.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p>© 2026 PG Nexus. All rights reserved.</p>
                    <div className="flex gap-6 opacity-60">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Listings
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3" />
                            Safe Communication
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}