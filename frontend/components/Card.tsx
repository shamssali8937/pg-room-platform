/* ---------------- COMPONENT ---------------- */
import { motion } from "framer-motion";
export default function Card({ icon: Icon, title, text, list, grid, highlight }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border backdrop-blur-xl transition
        ${highlight ? "bg-white/10 border-purple-500/40" : "bg-white/5 border-white/10"}
      `}
        >
            <div className="flex items-center gap-3 mb-3">
                <Icon className="text-purple-400 w-5 h-5" />
                <h3 className="text-xl font-semibold">{title}</h3>
            </div>

            {text && <p className="text-gray-400">{text}</p>}

            {list && (
                <ul className="mt-3 space-y-2 text-gray-300">
                    {list.map((item: string, i: number) => (
                        <li key={i}>• {item}</li>
                    ))}
                </ul>
            )}

            {grid && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {grid.map((g: any, i: number) => (
                        <div key={i} className="p-4 bg-black/30 rounded-xl border border-white/10">
                            <p className="text-sm text-gray-400">{g.label}</p>
                            <p className="font-semibold">{g.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}