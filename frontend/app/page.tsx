"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import FeaturedListings from "@/components/FeaturedListings";
import LandpageFooter from "@/components/LandpageFooter";
import Navbar from "@/components/Navbar";
import ParticleBg from "@/components/ParticleBg";

// 1. Move static data outside to prevent memory re-allocation
const ALL_LISTINGS = [
  { title: "Luxury Room", city: "Karachi", type: "Single", price: 25000, img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" },
  { title: "Sharing Room", city: "Lahore", type: "Sharing", price: 15000, img: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0" },
  { title: "Budget PG", city: "Islamabad", type: "PG", price: 10000, img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511" },
  { title: "Executive Room", city: "Karachi", type: "Single", price: 30000, img: "https://images.unsplash.com/photo-1586105251261-72a756497a11" },
  { title: "Student Sharing", city: "Lahore", type: "Sharing", price: 12000, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" },
  { title: "Premium PG", city: "Islamabad", type: "PG", price: 20000, img: "https://images.unsplash.com/photo-1560449752-3fdc5f9b79f6" },
];

export default function HomePage() {
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");

  // 2. Memoize filtered results so typing doesn't lag
  const filtered = useMemo(() => {
    return ALL_LISTINGS.filter((item) => {
      const matchCity = !city || item.city.toLowerCase().includes(city.toLowerCase());
      const matchType = !type || item.type === type;
      const matchBudget = !budget || item.price <= Number(budget);
      return matchCity && matchType && matchBudget;
    });
  }, [city, type, budget]);

  return (
    <div className="bg-black min-h-screen text-white relative overflow-x-hidden">
      {/* 3. Background Layer */}
      <div className="fixed inset-0 z-0">
        <ParticleBg />
      </div>

      {/* 4. Content Layer */}
      <div className="relative z-10">
        <Navbar />

        <section className="pt-32 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4"
          >
            Find Your Perfect Room
          </motion.h1>

          <p className="text-gray-400 mb-6">Smart search with real filters</p>

          <div className="flex flex-wrap justify-center gap-4">
            <input
              placeholder="City"
              onChange={(e) => setCity(e.target.value)}
              className="p-3 rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <input
              placeholder="Max Budget"
              type="number"
              onChange={(e) => setBudget(e.target.value)}
              className="p-3 rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <select
              onChange={(e) => setType(e.target.value)}
              className="p-3 mr-2 rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option value="" className="bg-black">All Types</option>
              <option value="Single" className="bg-black">Single</option>
              <option value="Sharing" className="bg-black">Sharing</option>
              <option value="PG" className="bg-black">PG</option>
            </select>
          </div>
        </section>

        <FeaturedListings data={filtered} />

        {/* Added 'viewport={{ once: true }}' to all motion sections to stop scroll lag */}
        <motion.section
          id="about"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center px-6 pb-20"
        >
          <h2 className="text-3xl font-bold mb-4">About</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            PG Nexus aims to revolutionize rental discovery in Pakistan with smart filters and verified listings.
          </p>
        </motion.section>


        {/* CTA */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Post Your Room</h2>
          <p className="text-gray-400 mb-4">
            List your property, get verified, and reach thousands of potential tenants instantly.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
            Post Now
          </button>
        </motion.section>

        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-20 text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Why Trust Us?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            ✔ Verified Owners • ✔ Approved Listings • ✔ No Fake Ads • ✔ Secure Payments • ✔ Privacy Protection • ✔ Customer Support
          </p>
        </motion.section>


        <LandpageFooter />
      </div>
    </div>
  );
}