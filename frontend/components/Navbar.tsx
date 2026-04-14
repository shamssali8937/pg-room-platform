export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-black/40 backdrop-blur-xl border-b border-white/10 text-white">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                PG Nexus
            </div>

            <div className="flex gap-6 items-center text-sm">

                <a href="#features">Features</a>
                <a href="#about">About</a>
                <a href="/about">About Us</a>
                <a href="/privacy">Privacy</a>
                <a href="/terms">Terms</a>

                <a href="/auth/signin" className="px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/20">
                    Login
                </a>
                <a href="/auth/signup" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
                    Sign Up
                </a>
            </div>
        </nav>
    );
}
