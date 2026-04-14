"use client";

import FeaturedListings from "@/components/FeaturedListings";
import LandpageFooter from "@/components/LandpageFooter";
import Navbar from "@/components/Navbar";
import ParticleBg from "@/components/ParticleBg";
import { motion } from "framer-motion";
import { useState } from "react";

export default function HomePage() {
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const allListings = [
    { title: "Luxury Room", city: "Karachi", type: "Single", price: 25000, img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2" },
    { title: "Sharing Room", city: "Lahore", type: "Sharing", price: 15000, img: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0" },
    { title: "Budget PG", city: "Islamabad", type: "PG", price: 10000, img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511" },
    { title: "Executive Room", city: "Karachi", type: "Single", price: 30000, img: "https://images.unsplash.com/photo-1586105251261-72a756497a11" },
    { title: "Student Sharing", city: "Lahore", type: "Sharing", price: 12000, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" },
    { title: "Premium PG", city: "Islamabad", type: "PG", price: 20000, img: "https://images.unsplash.com/photo-1560449752-3fdc5f9b79f6" },
  ];
  const filtered = allListings.filter((item) => {
    return (
      (city ? item.city.toLowerCase().includes(city.toLowerCase()) : true) &&
      (type ? item.type === type : true) &&
      (budget ? item.price <= Number(budget) : true)
    );
  });

  return (
    // <div className="bg-black min-h-screen text-white">
    <div className="bg-black min-h-screen text-white relative">
      <div className="relative z-10">

        <Navbar />

        {/* HERO */}
        <section className="pt-32 text-center px-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-bold mb-4">
            Find Your Perfect Room
          </motion.h1>

          <p className="text-gray-400 mb-6">Smart search with real filters</p>

          <div className="flex flex-wrap justify-center gap-4">
            <input placeholder="City" onChange={(e) => setCity(e.target.value)} className="p-3 rounded-lg bg-white/10" />
            <input placeholder="Max Budget" onChange={(e) => setBudget(e.target.value)} className="p-3 rounded-lg bg-white/10" />
            <select onChange={(e) => setType(e.target.value)} className="p-3 rounded-lg bg-white/10">
              <option value="">All</option>
              <option>Single</option>
              <option>Sharing</option>
              <option>PG</option>
            </select>
          </div>
        </section>

        <FeaturedListings data={filtered} />

        {/* ABOUT */}
        <motion.section id="about" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-20 text-center px-6">
          <h2 className="text-3xl font-bold mb-4">About</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            PG Nexus, created by Shams Ali Mehdi, aims to revolutionize rental discovery in Pakistan with smart filters, verified listings, and modern UI/UX.
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


