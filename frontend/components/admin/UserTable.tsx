"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, AlertTriangle, Gavel, ShieldCheck, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";
import { mockUsers, type AdminUser, type UserRole, type AccountStatus } from "./mockData";

interface UserTableProps {
    searchQuery: string;
}

const ITEMS_PER_PAGE = 5;

export default function UserTable({ searchQuery }: UserTableProps) {
    const [users, setUsers] = useState<AdminUser[]>(mockUsers);
    const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
    const [statusFilter, setStatusFilter] = useState<AccountStatus | "Any">("Any");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [actionModal, setActionModal] = useState<{ user: AdminUser; action: "warn" | "ban" } | null>(null);

    // Filtered + searched users
    const filtered = useMemo(() => {
        return users.filter((u) => {
            // Role filter
            if (roleFilter !== "All" && u.role !== roleFilter) return false;
            // Status filter
            if (statusFilter !== "Any" && u.accountStatus !== statusFilter) return false;
            // Search
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    u.id.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [users, roleFilter, statusFilter, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Reset to page 1 when filters change
    const handleRoleChange = (val: string) => { setRoleFilter(val as UserRole | "All"); setCurrentPage(1); };
    const handleStatusChange = (val: string) => { setStatusFilter(val as AccountStatus | "Any"); setCurrentPage(1); };

    const handleWarn = (id: string) => {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, accountStatus: "Warned" as const } : u));
        setActionModal(null);
    };

    const handleBan = (id: string) => {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, accountStatus: "Suspended" as const } : u));
        setActionModal(null);
    };

    const handleRestore = (id: string) => {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, accountStatus: "Active" as const } : u));
    };

    return (
        <>
            <div className="bg-zinc-900/60 rounded-3xl overflow-hidden shadow-2xl border border-white/[0.03]">
                {/* Table Controls */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b border-white/5">
                    <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Role:</span>
                            <select
                                value={roleFilter}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                className="bg-transparent border-none text-sm font-semibold text-white cursor-pointer p-0 focus:ring-0 focus:outline-none"
                            >
                                <option value="All" className="bg-zinc-900">All Roles</option>
                                <option value="Tenant" className="bg-zinc-900">Tenant</option>
                                <option value="Owner" className="bg-zinc-900">Owner</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="bg-transparent border-none text-sm font-semibold text-white cursor-pointer p-0 focus:ring-0 focus:outline-none"
                            >
                                <option value="Any" className="bg-zinc-900">Any Status</option>
                                <option value="Active" className="bg-zinc-900">Active</option>
                                <option value="Suspended" className="bg-zinc-900">Suspended</option>
                                <option value="Warned" className="bg-zinc-900">Warned</option>
                            </select>
                        </div>
                    </div>
                    <div className="text-xs text-zinc-600 italic font-medium">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} users
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">User Profile</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Role</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Verification</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Account Status</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Join Date</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {paged.length > 0 ? paged.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.25 }}
                                        className="hover:bg-white/[0.03] transition-colors group"
                                    >
                                        {/* Profile */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                                                <div>
                                                    <p className="text-sm font-bold text-white">{user.name}</p>
                                                    <p className="text-xs text-zinc-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-6">
                                            <RoleBadge role={user.role} />
                                        </td>

                                        {/* Verification */}
                                        <td className="px-6 py-6">
                                            <VerificationBadge status={user.verification} />
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-6">
                                            <StatusBadge status={user.accountStatus} />
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-6 text-xs text-zinc-500">{user.joinDate}</td>

                                        {/* Actions */}
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setSelectedUser(user)}
                                                    className="w-8 h-8 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-purple-500/20 transition-all"
                                                    title="View Profile"
                                                >
                                                    <Eye size={15} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setActionModal({ user, action: "warn" })}
                                                    className="w-8 h-8 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-500 hover:text-orange-400 hover:bg-orange-500/20 transition-all"
                                                    title="Warn"
                                                >
                                                    <AlertTriangle size={15} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setActionModal({ user, action: "ban" })}
                                                    className="w-8 h-8 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/20 transition-all"
                                                    title="Ban"
                                                >
                                                    <Gavel size={15} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <td colSpan={6} className="px-8 py-16 text-center text-zinc-500 text-sm">
                                            {searchQuery ? `No users matching "${searchQuery}"` : "No users match the current filters"}
                                        </td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between bg-white/[0.01] border-t border-white/5">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={14} /> Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === currentPage ? "bg-purple-500 text-white" : "hover:bg-white/5 text-zinc-500"}`}
                            >
                                {page}
                            </button>
                        ))}
                        {totalPages > 5 && (
                            <>
                                <span className="px-2 text-zinc-600">...</span>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${totalPages === currentPage ? "bg-purple-500 text-white" : "hover:bg-white/5 text-zinc-500"}`}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* View Profile Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-zinc-900 border border-white/[0.08] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="relative bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 flex flex-col items-center">
                                <button onClick={() => setSelectedUser(null)} className="absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
                                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-20 h-20 rounded-full border-2 border-purple-500/30 mb-4" />
                                <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                                <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                                <div className="flex gap-2 mt-3">
                                    <RoleBadge role={selectedUser.role} />
                                    <StatusBadge status={selectedUser.accountStatus} />
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">User ID</p><p className="text-white font-medium font-mono text-xs">{selectedUser.id}</p></div>
                                    <div><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Joined</p><p className="text-white font-medium">{selectedUser.joinDate}</p></div>
                                    <div><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Verification</p><VerificationBadge status={selectedUser.verification} /></div>
                                    <div><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Status</p><StatusBadge status={selectedUser.accountStatus} /></div>
                                </div>
                                {selectedUser.accountStatus === "Suspended" && (
                                    <button onClick={() => { handleRestore(selectedUser.id); setSelectedUser(null); }} className="w-full py-2.5 bg-green-500/10 text-green-400 rounded-lg text-sm font-semibold hover:bg-green-500/20 transition-colors">
                                        Restore Account
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Warn / Ban Confirmation Modal */}
            <AnimatePresence>
                {actionModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="bg-zinc-900 border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${actionModal.action === "warn" ? "bg-orange-500/10 text-orange-400" : "bg-red-500/10 text-red-400"}`}>
                                {actionModal.action === "warn" ? <AlertTriangle size={22} /> : <Gavel size={22} />}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                {actionModal.action === "warn" ? "Warn User" : "Suspend User"}
                            </h3>
                            <p className="text-sm text-zinc-500 mb-6">
                                Are you sure you want to {actionModal.action === "warn" ? "issue a warning to" : "suspend the account of"}{" "}
                                <span className="text-white font-medium">{actionModal.user.name}</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => actionModal.action === "warn" ? handleWarn(actionModal.user.id) : handleBan(actionModal.user.id)}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${actionModal.action === "warn" ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                                >
                                    {actionModal.action === "warn" ? "Issue Warning" : "Suspend"}
                                </button>
                                <button onClick={() => setActionModal(null)} className="flex-1 py-2.5 bg-white/[0.06] text-zinc-400 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ── Sub-components ──

function RoleBadge({ role }: { role: string }) {
    const isOwner = role === "Owner";
    return (
        <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${isOwner ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-white/5 text-zinc-400 border-white/10"}`}>
            {role}
        </span>
    );
}

function VerificationBadge({ status }: { status: string }) {
    if (status === "Verified") {
        return (
            <div className="flex items-center gap-1.5 text-purple-400">
                <ShieldCheck size={15} style={{ fill: "currentColor", fillOpacity: 0.15 }} />
                <span className="text-xs font-semibold">Verified</span>
            </div>
        );
    }
    if (status === "Pending") {
        return (
            <div className="flex items-center gap-1.5 text-zinc-500">
                <Clock size={15} />
                <span className="text-xs font-semibold">Pending</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1.5 text-red-400">
            <X size={15} />
            <span className="text-xs font-semibold">Rejected</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "Active") {
        return (
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs font-medium text-white">Active</span>
            </div>
        );
    }
    if (status === "Warned") {
        return (
            <div className="flex items-center gap-2 text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-xs font-medium">Warned</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-medium">Suspended</span>
        </div>
    );
}
