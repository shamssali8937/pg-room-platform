"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import LandpageFooter from "@/components/LandpageFooter";
import ParticleBg from "@/components/ParticleBg";

// React Icons
import { HiOutlineLocationMarker, HiOutlineSearch } from "react-icons/hi";
import { RiMoneyDollarCircleLine, RiHotelBedLine, RiShieldCheckLine, RiCustomerService2Line } from "react-icons/ri";
import { FiArrowRight, FiPlusCircle, FiLock, FiEyeOff } from "react-icons/fi";
import { MdVerified } from "react-icons/md";

const defaultListings = [
  {
    id: 1,
    title: "Penthouse Studio Suite",
    price: 85000,
    location: "Gulberg III, Lahore",
    type: "featured",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2070",
    featuredLabel: "Premium Luxury",
  },
  {
    id: 2,
    title: "Executive Sharing",
    price: 25000,
    location: "DHA Phase 6, Karachi",
    type: "vertical",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1980",
    featuredLabel: null,
  },
  {
    id: 3,
    title: "Standard Room",
    price: 18000,
    location: "E-11, Islamabad",
    type: "grid",
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: 4,
    title: "Elite PG Wing",
    price: 35000,
    location: "Bahria Town, Rawalpindi",
    type: "grid",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: 5,
    title: "Smart Studio",
    price: 55000,
    location: "Faisal Town, Lahore",
    type: "grid",
    image: "https://images.unsplash.com/photo-1536376074432-8d2a106a334f?auto=format&fit=crop&q=80&w=2070",
  },
];

export default function Home() {
  const [listings] = useState(defaultListings);

  const featuredListing = listings.find((l) => l.type === "featured");
  const verticalListing = listings.find((l) => l.type === "vertical");
  const gridListings = listings.filter((l) => l.type === "grid");

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      {/* --- GLOBAL PARTICLE BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleBg />
        {/* Subtle radial overlay to focus light on center and keep edges deep */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] opacity-70" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 flex flex-col">
        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6">
          <div className="relative text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Find Your <span className="bg-gradient-to-r from-[#ba9eff] to-[#699cff] bg-clip-text text-transparent">Perfect Room</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Elevated living for the modern professional. Curated spaces that blend luxury, comfort, and community in the heart of the city.
            </p>

            {/* Search Bar */}
            <div className="mt-10 backdrop-blur-2xl bg-white/[0.03] p-2 rounded-3xl md:rounded-full border border-white/10 shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-1">
              <div className="w-full md:w-1/3 flex items-center px-5 py-3 gap-3">
                <HiOutlineLocationMarker className="text-[#ba9eff] text-xl shrink-0" />
                <input className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 w-full text-sm font-medium" placeholder="City" type="text" />
              </div>
              <div className="hidden md:block w-px h-6 bg-white/10 mx-2"></div>

              <div className="w-full md:w-1/4 flex items-center px-5 py-3 gap-3">
                <RiMoneyDollarCircleLine className="text-[#ba9eff] text-xl shrink-0" />
                <input className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 w-full text-sm font-medium" placeholder="Budget" type="number" />
              </div>
              <div className="hidden md:block w-px h-6 bg-white/10 mx-2"></div>

              <div className="w-full md:w-1/4 flex items-center px-5 py-3 gap-3">
                <RiHotelBedLine className="text-[#ba9eff] text-xl shrink-0" />
                <select className="bg-transparent border-none focus:ring-0 text-gray-400 text-sm font-medium w-full appearance-none cursor-pointer">
                  <option className="bg-[#1a1a1a]">Room Type</option>
                  <option className="bg-[#1a1a1a]">Luxury Room</option>
                  <option className="bg-[#1a1a1a]">Sharing</option>
                </select>
              </div>

              <button className="w-full md:w-auto bg-gradient-to-r from-[#8455ef] to-[#699cff] rounded-2xl md:rounded-full p-4 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all">
                <HiOutlineSearch className="text-white text-xl" />
              </button>
            </div>
          </div>
        </section>

        {/* Elite Collections */}
        <section className="max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Elite Collections</h2>
              <p className="text-gray-400">Handpicked premium stays across Pakistan</p>
            </div>
            <button className="text-[#699cff] hover:text-[#ba9eff] font-semibold flex items-center gap-2 group transition-all text-sm uppercase tracking-wider">
              Explore All <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredListing && (
              <div className="md:col-span-2 group relative h-[520px] rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5">
                <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src={featuredListing.image} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute top-8 right-8 backdrop-blur-md bg-white/10 border border-white/10 px-5 py-2 rounded-full text-white font-bold text-sm">
                  ₨ {featuredListing.price.toLocaleString()} / mo
                </div>
                <div className="absolute bottom-10 left-10">
                  <div className="flex items-center gap-2 text-[#ba9eff] mb-3">
                    <MdVerified className="text-lg" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">{featuredListing.featuredLabel}</span>
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-3">{featuredListing.title}</h3>
                  <p className="text-gray-300 flex items-center gap-2">
                    <HiOutlineLocationMarker className="text-[#699cff]" /> {featuredListing.location}
                  </p>
                </div>
              </div>
            )}

            {verticalListing && (
              <div className="group relative h-[520px] rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5">
                <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src={verticalListing.image} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute top-8 right-8 backdrop-blur-md bg-white/10 border border-white/10 px-5 py-2 rounded-full text-white font-bold text-sm">
                  ₨ {verticalListing.price.toLocaleString()}
                </div>
                <div className="absolute bottom-10 left-10">
                  <h3 className="text-2xl font-bold text-white mb-2">{verticalListing.title}</h3>
                  <p className="text-gray-300 flex items-center gap-2 text-sm">
                    <HiOutlineLocationMarker className="text-[#699cff]" /> {verticalListing.location}
                  </p>
                </div>
              </div>
            )}

            {gridListings.map((item) => (
              <div key={item.id} className="backdrop-blur-sm bg-white/[0.02] rounded-[2rem] p-5 border border-white/5 hover:bg-white/[0.05] transition-all group">
                <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={item.image} alt="" />
                  <div className="absolute bottom-4 right-4 backdrop-blur-md bg-black/60 px-4 py-1.5 rounded-xl text-xs font-bold text-white border border-white/10">
                    ₨ {item.price.toLocaleString()}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#ba9eff] transition-colors">{item.title}</h4>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <HiOutlineLocationMarker className="text-[#699cff]" /> {item.location}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* The Promise Section */}
        <section className="bg-white/[0.02] backdrop-blur-sm py-32 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-white mb-4">The PG Nexus Promise</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Luxury is in the details, and security is in our DNA.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { icon: <RiShieldCheckLine />, title: "Verified Owners" },
                { icon: <FiLock />, title: "Safe Payments" },
                { icon: <FiEyeOff />, title: "No Hidden Fees" },
                { icon: <RiCustomerService2Line />, title: "24/7 Support" },
              ].map((item, idx) => (
                <div key={idx} className="group text-center">
                  <div className="w-16 h-16 bg-[#ba9eff]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ba9eff]/20 transition-all duration-300">
                    <div className="text-[#ba9eff] text-3xl">{item.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed px-4">Experience the gold standard in premium hospitality.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="relative rounded-[3.5rem] overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/10 py-24 px-12 text-center">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#699cff]/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Have a Room to List?</h2>
              <p className="text-gray-400 text-lg">Join Pakistan's most elite network of verified hosts and reach thousands of tenants.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
                <button className="w-full sm:w-auto bg-gradient-to-r from-[#8455ef] to-[#699cff] px-12 py-4 rounded-2xl text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(132,85,239,0.3)] transition-all flex items-center justify-center gap-3">
                  Post Your Room <FiPlusCircle className="text-xl" />
                </button>
                <button className="w-full sm:w-auto px-12 py-4 rounded-2xl text-white font-bold text-lg border border-white/10 hover:bg-white/5 transition-all">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        <LandpageFooter />
      </div>
    </main>
  );
}