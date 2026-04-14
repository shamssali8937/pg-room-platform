export default function Footer() {
    return (
        <footer className="mt-32 bg-black border-t border-white/10 text-gray-400">
            <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
                <div>
                    <h3 className="text-white font-semibold mb-3">PG Nexus</h3>
                    <p className="text-sm">Smart rental platform with verified listings.</p>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-3">Explore</h3>
                    <ul className="space-y-2 text-sm">
                        <li>Karachi Rooms</li>
                        <li>Lahore PG</li>
                        <li>Islamabad Rentals</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-3">Legal</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms & Conditions</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-3">Owner</h3>
                    <p className="text-sm">Shams Ali Mehdi</p>
                </div>
            </div>

            <div className="text-center py-4 border-t border-white/10 text-sm">
                © 2026 PG Nexus
            </div>
        </footer>
    );
}