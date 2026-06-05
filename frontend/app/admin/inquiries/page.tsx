"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye,
    CheckCircle2,
    XCircle,
    Info,
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Download,
    Loader2,
    ShieldAlert,
    Clock,
    FileText,
    TrendingUp,
    MessageCircle,
    MapPin,
    DollarSign,
    UserCheck,
    PhoneCall
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import { useAdminTheme } from "@/context/AdminThemeContext";
import api from "@/lib/api";

interface AdminInquiry {
    id: string;
    room_id: string;
    tenant_id: string;
    owner_id: string;
    request_type: string;
    status: string;
    message: string | null;
    owner_note: string | null;
    created_at: string;
    updated_at: string;
    tenant: {
        id: string;
        full_name: string;
        email: string;
        mobile_number: string | null;
        profile_photo_url: string | null;
    };
    owner: {
        id: string;
        full_name: string;
        email: string;
        mobile_number: string | null;
        profile_photo_url: string | null;
    };
    room: {
        id: string;
        title: string;
        price: number;
        rent_amount: number;
        city: string;
        locality: string;
    };
}

export default function InquiriesPage() {
    const { isDark } = useAdminTheme();
    const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string>("all");
    const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterType, setFilterType] = useState<"all" | "inquiry" | "booking">("all");

    const ITEMS_PER_PAGE = 5;

    const fetchInquiries = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get("/admin/inquiries");
            if (data.success) {
                setInquiries(data.data || []);
            }
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to load inquiries", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleExportCSV = () => {
        const headers = ["Inquiry ID", "Room Title", "Room Price", "Tenant Name", "Tenant Email", "Owner Name", "Owner Email", "Request Type", "Status", "Message", "Owner Note", "Created At"];
        const rows = filtered.map(i => [
            i.id,
            `"${(i.room?.title || "").replace(/"/g, '""')}"`,
            i.room?.price || i.room?.rent_amount || 0,
            `"${(i.tenant?.full_name || "").replace(/"/g, '""')}"`,
            i.tenant?.email || "",
            `"${(i.owner?.full_name || "").replace(/"/g, '""')}"`,
            i.owner?.email || "",
            i.request_type,
            i.status,
            `"${(i.message || "").replace(/"/g, '""')}"`,
            `"${(i.owner_note || "").replace(/"/g, '""')}"`,
            new Date(i.created_at).toLocaleDateString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `inquiries_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("CSV exported successfully", "success");
    };

    // Moderate Inquiry
    const handleModerate = async (id: string, newStatus: string) => {
        try {
            const { data } = await api.patch(`/admin/inquiries/${id}/status`, {
                status: newStatus,
                notes: adminNotes || undefined
            });
            if (data.success) {
                showToast(`Inquiry marked as ${newStatus}`, "success");
                setAdminNotes("");
                // Refresh list
                await fetchInquiries();
                // Update selected details if applicable
                if (selectedInquiry?.id === id) {
                    const updated = inquiries.find(i => i.id === id);
                    if (updated) {
                        setSelectedInquiry({
                            ...updated,
                            status: newStatus,
                            owner_note: adminNotes || updated.owner_note
                        });
                    } else {
                        setSelectedInquiry(null);
                    }
                }
            }
        } catch (err: any) {
            showToast(err.response?.data?.message || "Action failed", "error");
        }
    };

    // Filtered Inquiries
    const filtered = useMemo(() => {
        let result = inquiries;

        // Tab filter (status)
        if (activeTab === "pending") {
            result = result.filter(i => i.status === "pending");
        } else if (activeTab === "confirmed") {
            result = result.filter(i => i.status === "confirmed" || i.status === "approved");
        } else if (activeTab === "cancelled") {
            result = result.filter(i => i.status === "cancelled" || i.status === "rejected");
        }

        // Type filter (inquiry vs booking)
        if (filterType !== "all") {
            result = result.filter(i => i.request_type === filterType);
        }

        // Search Query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(i => 
                i.room?.title?.toLowerCase().includes(q) ||
                i.tenant?.full_name?.toLowerCase().includes(q) ||
                i.owner?.full_name?.toLowerCase().includes(q) ||
                i.tenant?.email?.toLowerCase().includes(q) ||
                i.owner?.email?.toLowerCase().includes(q) ||
                i.id.toLowerCase().includes(q)
            );
        }

        return result;
    }, [inquiries, activeTab, filterType, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Stats
    const stats = useMemo(() => {
        const total = inquiries.length;
        const pending = inquiries.filter(i => i.status === "pending").length;
        const confirmed = inquiries.filter(i => i.status === "confirmed" || i.status === "approved").length;
        const conversionRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

        return {
            total,
            pending,
            confirmed,
            conversionRate
        };
    }, [inquiries]);

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
            case "approved":
                return { bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", label: "Confirmed" };
            case "pending":
                return { bg: "bg-amber-500/10 text-amber-400 border border-amber-500/20", label: "Pending" };
            case "cancelled":
            case "rejected":
                return { bg: "bg-rose-500/10 text-rose-400 border border-rose-500/20", label: "Cancelled" };
            default:
                return { bg: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20", label: status };
        }
    };

    return (
        <main className="ml-0 pt-20 lg:pt-24 px-4 sm:px-6 lg:px-10 pb-20 min-h-screen">
                {/* Header */}
                <section className="mb-8 lg:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div>
                        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter mb-2 ${isDark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                            Inquiries &amp; Bookings
                        </h2>
                        <p className={`max-w-lg text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                            Administrative dashboard to monitor and moderate tenant room requests, offer logs, and booking interactions.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${filterType !== "all"
                                        ? "bg-purple-500/20 border-purple-500/30 text-purple-500"
                                        : isDark
                                            ? "bg-zinc-800/60 border-white/5 text-white hover:bg-zinc-700/60"
                                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                                    }`}
                            >
                                <SlidersHorizontal size={14} /> {filterType === "all" ? "All Types" : filterType === "inquiry" ? "Inquiries Only" : "Bookings Only"}
                            </button>
                            <AnimatePresence>
                                {showFilterMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className={`absolute right-0 top-full mt-2 w-44 backdrop-blur-xl border rounded-xl p-1.5 z-50 shadow-2xl ${isDark ? "bg-zinc-900/98 border-white/10" : "bg-white border-slate-200"
                                            }`}
                                    >
                                        {(["all", "inquiry", "booking"] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => { setFilterType(t); setShowFilterMenu(false); setCurrentPage(1); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${filterType === t
                                                        ? "bg-purple-500/20 text-purple-500"
                                                        : isDark ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {t === "all" ? "All Types" : t === "inquiry" ? "Inquiries Only" : "Bookings Only"}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${isDark
                                    ? "bg-zinc-800/60 border-white/5 text-white hover:bg-zinc-700/60"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                            }`}
                        >
                            <Download size={14} />
                            <span className="hidden sm:inline">Export</span> CSV
                        </button>
                    </div>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
                    <StatsCard title="Total Offers/Inquiries" value={stats.total.toString()} tag="Lifetime Logged" tagType="secondary" index={0} />
                    <StatsCard title="Pending Review" value={stats.pending.toString()} tag="Requires Action" tagType="info" index={1} />
                    <StatsCard title="Successful Bookings" value={stats.confirmed.toString()} tag="Rented Rooms" tagType="info" index={2} />
                    <StatsCard title="Closing Rate" value={`${stats.conversionRate}%`} tag="Inquiry to Lease" tagType="tertiary" index={3} />
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                    {/* Inquiries Table */}
                    <div className={`xl:col-span-2 rounded-2xl border overflow-hidden ${isDark ? "bg-zinc-900/60 border-white/[0.04]" : "bg-white border-slate-200 shadow-sm"}`}>
                        {/* Table Tabs */}
                        <div className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                            <div className="flex gap-1">
                                {[
                                    { id: "all", label: "All Logs" },
                                    { id: "pending", label: "Pending" },
                                    { id: "confirmed", label: "Confirmed" },
                                    { id: "cancelled", label: "Cancelled" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                                        className={`text-xs sm:text-sm font-semibold pb-2 px-3 border-b-2 transition-colors ${activeTab === tab.id
                                                ? "text-purple-500 border-purple-500"
                                                : isDark ? "text-zinc-500 border-transparent hover:text-white" : "text-slate-500 border-transparent hover:text-slate-900"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <p className={`text-[11px] font-medium ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                {filtered.length} requests matching filters
                            </p>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[750px]">
                                <thead>
                                    <tr className={`text-[10px] uppercase tracking-widest ${isDark ? "text-zinc-500 bg-zinc-900/80" : "text-slate-500 bg-slate-50"}`}>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Room</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Tenant Details</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Owner Details</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Type</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold">Status</th>
                                        <th className="px-4 sm:px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-sm">
                                                <Loader2 className="animate-spin text-purple-500 mx-auto" size={24} />
                                            </td>
                                        </tr>
                                    ) : (
                                        <AnimatePresence mode="popLayout">
                                            {paginated.length > 0 ? paginated.map((item) => {
                                                const statusCfg = getStatusStyle(item.status);
                                                return (
                                                    <motion.tr
                                                        key={item.id}
                                                        layout
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        className={`transition-colors group ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}
                                                    >
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <div className="min-w-[150px]">
                                                                <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{item.room?.title ?? "Unknown Room"}</p>
                                                                <p className={`text-[11px] flex items-center gap-1 ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                                                    <MapPin size={10} /> {item.room?.city}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={item.tenant?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.tenant?.full_name ?? "T")}&background=a27cff&color=fff`}
                                                                    alt=""
                                                                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                                                />
                                                                <div className="min-w-0">
                                                                    <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}>{item.tenant?.full_name}</p>
                                                                    <p className={`text-[11px] ${isDark ? "text-zinc-500" : "text-slate-500"}`}>{item.tenant?.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={item.owner?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.owner?.full_name ?? "O")}&background=ba9eff&color=fff`}
                                                                    alt=""
                                                                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                                                />
                                                                <div className="min-w-0">
                                                                    <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}>{item.owner?.full_name}</p>
                                                                    <p className={`text-[11px] ${isDark ? "text-zinc-500" : "text-slate-500"}`}>{item.owner?.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                                item.request_type === "booking"
                                                                    ? "bg-purple-500/10 text-purple-400"
                                                                    : "bg-blue-500/10 text-blue-400"
                                                            }`}>
                                                                {item.request_type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusCfg.bg}`}>
                                                                {statusCfg.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => setSelectedInquiry(item)}
                                                                    className={`p-2 rounded-lg hover:bg-purple-500/20 hover:text-purple-400 transition-all ${isDark ? "bg-zinc-800/80 text-zinc-400" : "bg-slate-100 text-slate-500"}`}
                                                                    title="Inspect"
                                                                >
                                                                    <Eye size={15} />
                                                                </button>
                                                                {item.status === "pending" && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleModerate(item.id, "approved")}
                                                                            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all"
                                                                            title="Confirm Booking"
                                                                        >
                                                                            <CheckCircle2 size={15} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleModerate(item.id, "cancelled")}
                                                                            className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-all"
                                                                            title="Cancel Booking"
                                                                        >
                                                                            <XCircle size={15} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan={6} className={`px-6 py-16 text-center text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                                        No inquiries match the current filter
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className={`p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                            <p className={`text-xs ${isDark ? "text-zinc-500" : "text-slate-500"}`}>Showing {paginated.length} of {filtered.length}</p>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all ${isDark ? "bg-zinc-800/80 text-white hover:bg-zinc-700" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${p === currentPage ? "bg-purple-500 text-white" : isDark ? "bg-zinc-800/80 text-white hover:bg-zinc-700" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all ${isDark ? "bg-zinc-800/80 text-white hover:bg-zinc-700" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inspector Panel */}
                    <div className={`rounded-2xl border p-5 sm:p-6 flex flex-col ${isDark ? "bg-zinc-900/60 border-white/[0.04]" : "bg-white border-slate-200 shadow-sm"}`}>
                        <h4 className={`text-lg font-bold mb-5 ${isDark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                            {selectedInquiry ? "Oversight & Moderation" : "Inquiry Inspector"}
                        </h4>

                        {selectedInquiry ? (
                            <div className="space-y-5 flex-1 overflow-y-auto">
                                {/* Room Title & Info */}
                                <div className={`p-4 rounded-xl border ${isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200"}`}>
                                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Target Room</p>
                                    <h5 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{selectedInquiry.room?.title}</h5>
                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {selectedInquiry.room?.locality}, {selectedInquiry.room?.city}</span>
                                        <span className="flex items-center gap-0.5"><DollarSign size={12} /> Rent: {selectedInquiry.room?.price || selectedInquiry.room?.rent_amount} PKR</span>
                                    </div>
                                </div>

                                {/* Tenant Contact */}
                                <div className={`p-4 rounded-xl border ${isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200"}`}>
                                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Tenant Profile</p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={selectedInquiry.tenant?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedInquiry.tenant?.full_name ?? "T")}&background=a27cff&color=fff`}
                                            alt=""
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{selectedInquiry.tenant?.full_name}</p>
                                            <p className="text-xs text-zinc-400 truncate">{selectedInquiry.tenant?.email}</p>
                                            {selectedInquiry.tenant?.mobile_number && (
                                                <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1 font-mono">
                                                    <PhoneCall size={10} /> {selectedInquiry.tenant.mobile_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Contact */}
                                <div className={`p-4 rounded-xl border ${isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200"}`}>
                                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Owner Profile</p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={selectedInquiry.owner?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedInquiry.owner?.full_name ?? "O")}&background=ba9eff&color=fff`}
                                            alt=""
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{selectedInquiry.owner?.full_name}</p>
                                            <p className="text-xs text-zinc-400 truncate">{selectedInquiry.owner?.email}</p>
                                            {selectedInquiry.owner?.mobile_number && (
                                                <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1 font-mono">
                                                    <PhoneCall size={10} /> {selectedInquiry.owner.mobile_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Inquiry Text / Message */}
                                {selectedInquiry.message && (
                                    <div className={`p-4 rounded-xl border ${isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200"}`}>
                                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5">Tenant Message</p>
                                        <p className={`text-xs leading-relaxed italic ${isDark ? "text-zinc-300" : "text-slate-700"}`}>"{selectedInquiry.message}"</p>
                                    </div>
                                )}

                                {/* Owner Notes */}
                                {selectedInquiry.owner_note && (
                                    <div className={`p-4 rounded-xl border ${isDark ? "bg-zinc-800/40 border-white/[0.04]" : "bg-slate-50 border-slate-200"}`}>
                                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5">System/Owner Note</p>
                                        <p className="text-xs text-zinc-400 leading-relaxed">{selectedInquiry.owner_note}</p>
                                    </div>
                                )}

                                {/* Quick Moderation Buttons */}
                                {selectedInquiry.status === "pending" ? (
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <button
                                            onClick={() => handleModerate(selectedInquiry.id, "approved")}
                                            className="flex items-center justify-center gap-2 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-emerald-500/20"
                                        >
                                            <CheckCircle2 size={14} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleModerate(selectedInquiry.id, "cancelled")}
                                            className="flex items-center justify-center gap-2 py-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-rose-500/20"
                                        >
                                            <XCircle size={14} /> Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs ${isDark ? "bg-zinc-800/30 border-white/5 text-zinc-500" : "bg-slate-50 border-slate-100 text-slate-500"}`}>
                                        <Info size={14} /> This inquiry has already been finalized.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                                <div className="w-14 h-14 rounded-full bg-zinc-800/60 flex items-center justify-center mb-4">
                                    <ShieldAlert size={24} className="text-zinc-600" />
                                </div>
                                <p className="text-sm text-zinc-500">Select an inquiry from the list to inspect profiles, message strings, and perform moderation.</p>
                            </div>
                        )}

                        {/* Note update */}
                        <div className={`mt-auto pt-5 border-t ${isDark ? "border-white/[0.04]" : "border-slate-100"}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? "text-zinc-500" : "text-slate-500"}`}>Administrative Note</p>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Attach internal notes, moderate reasons..."
                                rows={3}
                                className={`w-full rounded-xl text-sm py-3 px-4 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all border ${isDark ? "bg-zinc-800/60 border-white/[0.04] text-white placeholder:text-zinc-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`}
                            />
                            {selectedInquiry && selectedInquiry.status !== "pending" && (
                                <button
                                    onClick={() => handleModerate(selectedInquiry.id, selectedInquiry.status)}
                                    className="w-full py-3 mt-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all active:scale-[0.98]"
                                >
                                    Update Note
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 40, x: "-50%" }}
                        className={`fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-xl text-sm font-semibold shadow-2xl backdrop-blur-xl border border-white/10 whitespace-nowrap ${toast.type === "success" ? "bg-green-500/20 text-green-400" : toast.type === "error" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                            }`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
