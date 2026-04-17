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
                    </div>

                    {/* Explore Section */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Explore Cities</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="hover:text-white transition-colors cursor-pointer">Delhi</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Faridabad</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Gurgaon</li>
                        </ul>
                    </div>

                    {/* Legal Section */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a>
                            </li>
                            <li>
                                <a href="/about" className="hover:text-white transition-colors">About Us</a>
                            </li>
                        </ul>
                    </div>

                    {/* Owner/Contact Section */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <p className="text-sm italic">Shams Ali Mehdi</p>
                        <p className="text-xs mt-2 opacity-70">
                            Built for founders and urban renters.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p>© 2026 PG Nexus. All rights reserved.</p>
                    <div className="flex gap-6 opacity-60">
                        <span>Verified Listings</span>
                        <span>Safe Communication</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}