"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, Bed, Bath, Star, ShieldCheck, ChevronLeft, ChevronRight,
  Wifi, Wind, Car, Dumbbell, Video, Zap, Shield, MessageSquare, Heart,
  Home, Maximize, Loader2, BadgeCheck, ShieldAlert, Flag
} from "lucide-react";
import api from "@/lib/api";
import dynamic from "next/dynamic";

const RoomLocationMap = dynamic(() => import("@/components/RoomLocationMap"), { ssr: false });

const amenityIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  WiFi: Wifi,
  AC: Wind,
  Parking: Car,
  Gym: Dumbbell,
  CCTV: Video,
  Generator: Zap,
  Security: Shield,
  Laundry: Wind,
  Elevator: Home,
  Rooftop: Home,
  Concierge: Shield,
  Pool: Home,
  Cinema: Home,
  Garden: Home,
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1980";

const formatAvailabilityDate = (dateStr?: string) => {
  if (!dateStr) return "Immediate";
  if (dateStr.toLowerCase() === "immediate") return "Immediate";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export interface LandingRoom {
  id: string | number;
  title: string;
  price?: number;
  rent_amount?: number;
  location?: string;
  locality?: string;
  city?: string;
  address?: string;
  image?: string;
  images?: { url: string }[];
  is_featured?: boolean;
  is_verified?: boolean;
  description?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  area_sqft?: number;
  rating?: number;
  reviews?: number;
  amenities?: string[];
  tags?: string[];
  owner?: { full_name?: string; avatar_url?: string; is_verified?: boolean };
  ownerName?: string;
  ownerAvatar?: string;
  furnished_status?: string;
  security_deposit?: number;
  available_for?: string;
  gender_preference?: string;
  availability_date?: string;
  approximate_latitude?: number | null;
  approximate_longitude?: number | null;
  landmark?: string;
  status?: string;
  created_at?: string;
}

interface Props {
  room: LandingRoom | null;
  onClose: () => void;
}

export default function LandingRoomDetailModal({ room, onClose }: Props) {
  const router = useRouter();
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Report form (view only — submitting redirects to login)
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    setGalleryIdx(0);
    setReviewsList([]);
    if (room?.id) {
      setLoadingReviews(true);
      api
        .get(`/rooms/${room.id}/reviews`)
        .then(({ data }) => {
          if (data?.success && Array.isArray(data?.data)) setReviewsList(data.data);
        })
        .catch(() => {})
        .finally(() => setLoadingReviews(false));
    }
  }, [room?.id]);

  if (!room) return null;

  // Normalise gallery
  const gallery =
    room.images && room.images.length > 0
      ? room.images.map((i) => i.url)
      : room.image
      ? [room.image]
      : [PLACEHOLDER_IMAGE];

  const prevImage = () => setGalleryIdx((i) => (i === 0 ? gallery.length - 1 : i - 1));
  const nextImage = () => setGalleryIdx((i) => (i === gallery.length - 1 ? 0 : i + 1));

  const price = room.price ?? room.rent_amount ?? 0;
  const location =
    room.location ??
    [room.locality, room.city].filter(Boolean).join(", ") ??
    room.address ??
    "—";
  const ownerName = room.owner?.full_name ?? room.ownerName ?? "Property Owner";
  const ownerAvatar =
    room.owner?.avatar_url ?? room.ownerAvatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=8455ef&color=fff`;
  const ownerVerified = room.owner?.is_verified ?? false;
  const beds = room.beds ?? 1;
  const baths = room.baths ?? 1;
  const sqft = room.sqft ?? room.area_sqft ?? 0;
  const amenities: string[] = room.amenities ?? [];
  const tags: string[] = room.tags ?? [];
  const isOccupied = room.status === "occupied";
  const postedDaysAgo = room.created_at
    ? Math.floor((Date.now() - new Date(room.created_at).getTime()) / 86400000)
    : 0;

  const goToLogin = () => router.push("/auth/signin");

  // ─── Theme (always dark on landing page) ─────────────────────────────────
  const modalBg = "bg-[#131313] border-white/[0.08]";
  const titleColor = "text-white";
  const locationColor = "text-zinc-400";
  const metaCardBg = "bg-[#201f1f] border-white/[0.04]";
  const metaLabel = "text-zinc-500";
  const metaVal = "text-white";
  const descText = "text-zinc-300";
  const amenityChip = "bg-[#201f1f] border-white/[0.04] text-zinc-300";
  const actionsBorder = "border-white/[0.04]";
  const secActionBg =
    "bg-[#a27cff]/10 border border-[#a27cff]/20 text-[#a27cff] hover:bg-[#a27cff]/20";
  const closeActionBg =
    "bg-[#201f1f] border-white/5 text-zinc-400 hover:bg-[#2c2c2c]";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-3xl border rounded-3xl overflow-hidden shadow-2xl shadow-black/60 flex flex-col max-h-[90dvh] relative ${modalBg}`}
        >
          <div className="overflow-y-auto flex-1">
            {/* ── Gallery ─────────────────────────────────────────────────── */}
            <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden bg-zinc-800">
              <AnimatePresence mode="wait">
                <motion.img
                  key={galleryIdx}
                  src={gallery[galleryIdx]}
                  alt={room.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {isOccupied && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                  <span className="px-6 py-3 border-4 border-rose-500 text-rose-500 font-black text-2xl uppercase tracking-[0.3em] rounded-xl transform -rotate-12 shadow-2xl bg-black/60 select-none animate-pulse">
                    Occupied
                  </span>
                </div>
              )}

              {gallery.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {gallery.map((_: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setGalleryIdx(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === galleryIdx ? "bg-white w-5" : "bg-white/40 w-2 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Verified badge */}
              {room.is_verified && (
                <span className="absolute top-4 left-4 bg-black/40 backdrop-blur-xl text-[10px] uppercase tracking-widest font-bold text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                  <ShieldCheck size={11} /> Verified
                </span>
              )}

              {/* Login nudge banner */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-5 py-3 flex items-center justify-between">
                <span className="text-white/70 text-xs font-medium">
                  🔒 Sign in to inquire or save this listing
                </span>
                <button
                  onClick={goToLogin}
                  className="text-xs font-bold text-[#ba9eff] hover:text-white transition-colors underline underline-offset-2"
                >
                  Login / Register →
                </button>
              </div>
            </div>

            {/* ── Content ──────────────────────────────────────────────────── */}
            <div className="p-5 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <h2
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${titleColor}`}
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {room.title}
                  </h2>
                  <div className={`flex items-center gap-2 text-sm ${locationColor}`}>
                    <MapPin size={14} className="flex-shrink-0" />
                    <span>{location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <p className="text-2xl font-bold text-[#a27cff]">
                    PKR {price.toLocaleString()}
                    <span className={`text-sm font-normal ${locationColor}`}>/mo</span>
                  </p>
                  {(room.rating ?? 0) > 0 && (
                    <div className={`flex items-center gap-1.5 text-sm ${locationColor}`}>
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="font-bold">{room.rating}</span>
                      <span>({reviewsList.length || room.reviews || 0} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Beds",
                    content: (
                      <div className="flex items-center gap-2 mt-1">
                        <Bed size={16} className={metaLabel} />
                        <p className={`text-sm font-semibold ${metaVal}`}>
                          {beds} Bed{beds > 1 ? "s" : ""}
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: "Baths",
                    content: (
                      <div className="flex items-center gap-2 mt-1">
                        <Bath size={16} className={metaLabel} />
                        <p className={`text-sm font-semibold ${metaVal}`}>
                          {baths} Bath{baths > 1 ? "s" : ""}
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: "Area",
                    content: (
                      <div className="flex items-center gap-2 mt-1">
                        <Maximize size={16} className={metaLabel} />
                        <p className={`text-sm font-semibold ${metaVal}`}>
                          {sqft ? `${sqft} sqft` : "—"}
                        </p>
                      </div>
                    ),
                  },
                  {
                    label: "Posted",
                    content: (
                      <p className={`text-sm font-semibold mt-1 ${metaVal}`}>
                        {postedDaysAgo === 0 ? "Today" : `${postedDaysAgo}d ago`}
                      </p>
                    ),
                  },
                ].map(({ label, content }) => (
                  <div key={label} className={`rounded-xl p-4 border ${metaCardBg}`}>
                    <p className={`text-[10px] uppercase tracking-widest font-semibold mb-0.5 ${metaLabel}`}>
                      {label}
                    </p>
                    {content}
                  </div>
                ))}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-[#a27cff]/10 text-[#a27cff] border-[#a27cff]/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Specifications */}
              <div className={`rounded-2xl p-5 border ${metaCardBg} space-y-4`}>
                <h4 className={`text-xs uppercase tracking-widest font-bold ${metaLabel}`}>
                  Property Specifications
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className={metaLabel}>Security Deposit</p>
                    <p className={`font-bold mt-1 ${metaVal}`}>
                      PKR {new Intl.NumberFormat("en-PK").format(room.security_deposit ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className={metaLabel}>Furnished Status</p>
                    <p className={`font-bold mt-1 capitalize ${metaVal}`}>
                      {room.furnished_status || "unfurnished"}
                    </p>
                  </div>
                  <div>
                    <p className={metaLabel}>Area / Size</p>
                    <p className={`font-bold mt-1 ${metaVal}`}>{sqft || "—"} sq ft</p>
                  </div>
                  <div>
                    <p className={metaLabel}>Available For</p>
                    <p className={`font-bold mt-1 capitalize ${metaVal}`}>
                      {room.available_for || "any"}
                    </p>
                  </div>
                  <div>
                    <p className={metaLabel}>Gender Preference</p>
                    <p className={`font-bold mt-1 capitalize ${metaVal}`}>
                      {room.gender_preference || "any"}
                    </p>
                  </div>
                  <div>
                    <p className={metaLabel}>Availability Date</p>
                    <p className={`font-bold mt-1 ${metaVal}`}>
                      {formatAvailabilityDate(room.availability_date)}
                    </p>
                  </div>
                </div>

                {(room.address || room.locality || room.landmark) && (
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    {room.address && (
                      <div>
                        <p className={metaLabel}>Full Address</p>
                        <p className={`font-bold mt-0.5 ${metaVal}`}>{room.address}</p>
                      </div>
                    )}
                    {(room.locality || room.landmark) && (
                      <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                        {room.locality && (
                          <div>
                            <p className={metaLabel}>Locality / Sector</p>
                            <p className={`font-bold mt-0.5 ${metaVal}`}>{room.locality}</p>
                          </div>
                        )}
                        {room.landmark && (
                          <div>
                            <p className={metaLabel}>Landmark</p>
                            <p className={`font-bold mt-0.5 ${metaVal}`}>{room.landmark}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {(room.approximate_latitude || room.approximate_longitude) && (
                      <div className="pt-3">
                        <RoomLocationMap
                          latitude={room.approximate_latitude}
                          longitude={room.approximate_longitude}
                          locality={room.locality}
                          landmark={room.landmark}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {room.description && (
                <div>
                  <h4 className={`text-xs uppercase tracking-widest font-semibold mb-2 ${metaLabel}`}>
                    Description
                  </h4>
                  <p className={`text-sm leading-relaxed ${descText}`}>{room.description}</p>
                </div>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h4 className={`text-xs uppercase tracking-widest font-semibold mb-3 ${metaLabel}`}>
                    Amenities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a) => {
                      const Icon = amenityIcons[a] || Shield;
                      return (
                        <span
                          key={a}
                          className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-medium ${amenityChip}`}
                        >
                          <Icon size={13} className="text-[#a27cff]" />
                          {a}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs uppercase tracking-widest font-semibold ${metaLabel}`}>
                    Stay Reviews
                  </h4>
                  {(room.rating ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className={`text-sm font-bold ${titleColor}`}>{room.rating}</span>
                      <span className={`text-xs ${locationColor}`}>
                        ({reviewsList.length} reviews)
                      </span>
                    </div>
                  )}
                </div>
                {loadingReviews ? (
                  <div className="flex items-center gap-2 text-xs py-4 text-zinc-500">
                    <Loader2 size={14} className="animate-spin text-[#a27cff]" />
                    <span>Loading reviews...</span>
                  </div>
                ) : reviewsList.length === 0 ? (
                  <p className={`text-xs italic py-2 ${locationColor}`}>
                    No reviews yet for this room.
                  </p>
                ) : (
                  <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                    {reviewsList.map((rev: any) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-xl border space-y-1.5 bg-[#201f1f] border-white/[0.04]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#a27cff]/20 text-[#a27cff]">
                              {rev.reviewer?.full_name?.[0] ?? "T"}
                            </div>
                            <span className={`text-xs font-bold ${titleColor}`}>
                              {rev.reviewer?.full_name ?? "Verified Tenant"}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={10}
                                className={
                                  s <= rev.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-zinc-500"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        {rev.comment && (
                          <p className={`text-xs leading-relaxed ${descText}`}>
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                        )}
                        <p className={`text-[9px] ${locationColor}`}>
                          {new Date(rev.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Owner */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${metaCardBg}`}>
                <img
                  src={ownerAvatar}
                  alt={ownerName}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-bold ${titleColor}`}>{ownerName}</p>
                    {ownerVerified && (
                      <BadgeCheck className="text-emerald-400 fill-emerald-950 shrink-0" size={16} />
                    )}
                  </div>
                  <p className={`text-xs ${locationColor}`}>
                    Property Owner · Posted {postedDaysAgo === 0 ? "today" : `${postedDaysAgo} days ago`}
                  </p>
                </div>
              </div>

              {/* ── Actions ────────────────────────────────────────────────── */}
              <div className={`flex flex-col sm:flex-row gap-2 pt-2 border-t ${actionsBorder}`}>
                {/* Send Inquiry → login */}
                <button
                  onClick={goToLogin}
                  disabled={isOccupied}
                  className="flex-1 py-3 bg-gradient-to-r from-[#a27cff] to-[#6e3bd7] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <MessageSquare size={15} />
                  {isOccupied ? "Occupied" : "Send Inquiry"}
                </button>

                {/* Save Listing → login */}
                <button
                  onClick={goToLogin}
                  className={`flex-1 py-3 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${secActionBg}`}
                >
                  <Heart size={15} />
                  Save Listing
                </button>

                {/* Report → login */}
                <button
                  onClick={goToLogin}
                  className="py-3 px-4 border border-rose-500/30 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={15} />
                  Report
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className={`py-3 px-6 border text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${closeActionBg}`}
                >
                  <X size={15} /> Close
                </button>
              </div>

              {/* Login CTA card */}
              <div className="rounded-2xl border border-[#a27cff]/20 bg-[#a27cff]/5 p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm font-bold text-white mb-1">
                    Want to inquire or save this room?
                  </p>
                  <p className="text-xs text-zinc-400">
                    Create a free account or sign in to send inquiries, save favourites and book rooms.
                  </p>
                </div>
                <button
                  onClick={goToLogin}
                  className="shrink-0 px-6 py-2.5 bg-gradient-to-r from-[#8455ef] to-[#699cff] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all"
                >
                  Sign In / Register
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
