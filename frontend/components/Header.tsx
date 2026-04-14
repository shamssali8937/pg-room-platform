export default function Header() {
    return (
        <header className="fixed top-0 w-full flex justify-between items-center px-8 py-4 backdrop-blur-xl bg-black/30 border-b border-white/10 z-50">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                PG Nexus
            </h1>

            <div className="flex gap-4">
                <a
                    href="/auth/signin"
                    className="px-5 py-2 rounded-lg border border-purple-500 text-purple-400 hover:bg-purple-500/20 transition"
                >
                    Login
                </a>
                <a
                    href="/auth/signup"
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 hover:scale-105 transition"
                >
                    Sign Up
                </a>
            </div>
        </header>
    );
}