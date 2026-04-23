import { motion } from "framer-motion";
export default function FeaturedListings({ data }: any) {
    return (
        <section className="mt-20 px-10 text-white">
            <h2 className="text-3xl font-bold mb-6">Listings</h2>

            <div className="grid md:grid-cols-3 gap-6">
                {data.map((item: any, i: number) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.4 }}
                        className="rounded-xl overflow-hidden bg-white/5 border border-white/10"
                    >
                        <img src={item.img} className="h-48 w-full object-cover" />

                        <div className="p-4">
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-sm text-gray-400">{item.city}</p>
                            <p className="text-sm text-purple-400">PKR {item.price}</p>
                            <p className="text-xs text-green-400">✔ Verified Owner</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
