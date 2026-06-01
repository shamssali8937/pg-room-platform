"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, AlertTriangle, Gavel, ShieldCheck, Clock, X, ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle } from "lucide-react";
import { type AdminUser, type UserRole, type AccountStatus } from "./mockData";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminUsers, updateUserStatus, verifyUser } from "@/store/slices/adminSlice";

interface UserTableProps {
    searchQuery: string;
    roleFilter: UserRole | "All";
    setRoleFilter: (val: UserRole | "All") => void;
    statusFilter: AccountStatus | "Any";
    setStatusFilter: (val: AccountStatus | "Any") => void;
}

interface TableAdminUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: UserRole;
    verification: "Verified" | "Pending" | "Rejected";
    accountStatus: AccountStatus;
    joinDate: string;
    mobile_number?: string | null;
    documents?: Array<{
        id: string;
        doc_type: string;
        file_url: string;
        status: string;
        created_at: string;
    }>;
}

const ITEMS_PER_PAGE = 5;

export default function UserTable({
    searchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter
}: UserTableProps) {
    const dispatch = useAppDispatch();
    const { users: reduxUsers, isLoading } = useAppSelector((state) => state.admin);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<TableAdminUser | null>(null);
    const [actionModal, setActionModal] = useState<{ user: TableAdminUser; action: "warn" | "ban" } | null>(null);
    const { isDark } = useAdminTheme();

    useEffect(() => {
        dispatch(fetchAdminUsers());
    }, [dispatch]);

    const mappedUsers = useMemo((): TableAdminUser[] => {
        return reduxUsers.map((u) => {
            const roleFormatted = (u.role.charAt(0).toUpperCase() + u.role.slice(1)) as UserRole;
            let statusFormatted: AccountStatus = "Active";
            if (u.account_status.toLowerCase() === "suspended") statusFormatted = "Suspended";
            if (u.account_status.toLowerCase() === "warned") statusFormatted = "Warned";

            let verificationFormatted: "Verified" | "Pending" | "Rejected" = "Pending";
            if (u.verification_status && u.verification_status.toLowerCase() === "verified") {
                verificationFormatted = "Verified";
            } else if (u.verification_status && u.verification_status.toLowerCase() === "rejected") {
                verificationFormatted = "Rejected";
            }

            return {
                id: u.id,
                name: u.full_name,
                email: u.email,
                role: roleFormatted,
                verification: verificationFormatted,
                accountStatus: statusFormatted,
                joinDate: new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                avatar: u.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=8b5cf6&color=fff`,
                mobile_number: u.mobile_number,
                documents: u.documents || []
            };
        });
    }, [reduxUsers]);

    const filtered = useMemo(() => {
        return mappedUsers.filter((u) => {
            if (roleFilter !== "All" && u.role !== roleFilter) return false;
            if (statusFilter !== "Any" && u.accountStatus !== statusFilter) return false;
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
    }, [mappedUsers, roleFilter, statusFilter, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleRoleChange = (val: string) => { setRoleFilter(val as UserRole | "All"); setCurrentPage(1); };
    const handleStatusChange = (val: string) => { setStatusFilter(val as AccountStatus | "Any"); setCurrentPage(1); };

    const handleWarn = (id: string) => {
        dispatch(updateUserStatus({ id, status: "warned", reason: "Policy violation warning" }));
        setActionModal(null);
    };

    const handleBan = (id: string) => {
        dispatch(updateUserStatus({ id, status: "suspended", reason: "Severe policy violation suspension" }));
        setActionModal(null);
    };

    const handleRestore = (id: string) => {
        dispatch(updateUserStatus({ id, status: "active", reason: "Account status reinstated" }));
    };

    const handleVerify = (id: string) => {
        dispatch(verifyUser({ id, status: "verified", reason: "Manually verified by Administrator" }));
        setSelectedUser((prev) => prev ? { ...prev, verification: "Verified" } : null);
    };

    const handleRejectVerification = (id: string) => {
        dispatch(verifyUser({ id, status: "rejected", reason: "Documents rejected by Administrator" }));
        setSelectedUser((prev) => prev ? { ...prev, verification: "Rejected" } : null);
    };

    // Theme tokens
    const tableBg = isDark ? "bg-zinc-900/60 border-white/[0.03]" : "bg-white border-slate-200 shadow-sm";
    const controlsBorder = isDark ? "border-white/5" : "border-slate-100";
    const labelColor = isDark ? "text-zinc-500" : "text-slate-500";
    const selectColor = isDark ? "text-white bg-transparent" : "text-slate-900 bg-transparent";
    const countColor = isDark ? "text-zinc-600" : "text-slate-400";
    const headBg = isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100";
    const headText = isDark ? "text-zinc-500" : "text-slate-500";
    const divider = isDark ? "divide-white/5" : "divide-slate-100";
    const rowHover = isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50";
    const nameColor = isDark ? "text-white" : "text-slate-900";
    const emailColor = isDark ? "text-zinc-500" : "text-slate-500";
    const dateColor = isDark ? "text-zinc-500" : "text-slate-500";
    const emptyColor = isDark ? "text-zinc-500" : "text-slate-400";
    const paginationBg = isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-100";
    const prevNextColor = isDark ? "text-zinc-500 hover:text-white" : "text-slate-500 hover:text-slate-900";
    const pageInactive = isDark ? "hover:bg-white/5 text-zinc-500" : "hover:bg-slate-200 text-slate-500";
    const actionBtn = isDark ? "bg-zinc-800/60 text-zinc-500" : "bg-slate-100 text-slate-400";
    const modalBg = isDark ? "bg-zinc-900 border-white/[0.08]" : "bg-white border-slate-200 shadow-2xl";
    const modalNameColor = isDark ? "text-white" : "text-slate-900";
    const modalSubColor = isDark ? "text-zinc-500" : "text-slate-500";
    const modalLabelColor = isDark ? "text-zinc-500" : "text-slate-500";
    const modalValColor = isDark ? "text-white font-medium" : "text-slate-900 font-medium";
    const confirmModalBg = isDark ? "bg-zinc-900 border-white/[0.08]" : "bg-white border-slate-200 shadow-2xl";
    const confirmTitle = isDark ? "text-white" : "text-slate-900";
    const confirmSub = isDark ? "text-zinc-500" : "text-slate-500";
    const cancelBtn = isDark ? "bg-white/[0.06] text-zinc-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200";

    return (
        <>
            <div className={`rounded-3xl overflow-hidden shadow-2xl border ${tableBg}`}>
                {/* Table Controls */}
                <div className={`px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b ${controlsBorder}`}>
                    <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${labelColor}`}>Role:</span>
                            <select value={roleFilter} onChange={(e) => handleRoleChange(e.target.value)} className={`border-none text-sm font-semibold cursor-pointer p-0 focus:ring-0 focus:outline-none ${selectColor}`}>
                                <option value="All">All Roles</option>
                                <option value="Tenant">Tenant</option>
                                <option value="Owner">Owner</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${labelColor}`}>Status:</span>
                            <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)} className={`border-none text-sm font-semibold cursor-pointer p-0 focus:ring-0 focus:outline-none ${selectColor}`}>
                                <option value="Any">Any Status</option>
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Warned">Warned</option>
                            </select>
                        </div>
                    </div>
                    <div className={`text-xs italic font-medium ${countColor}`}>
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} users
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className={`border-b ${headBg}`}>
                                <th className={`px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] ${headText}`}>User Profile</th>
                                <th className={`px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em] ${headText}`}>Role</th>
                                <th className={`px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em] ${headText}`}>Verification</th>
                                <th className={`px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em] ${headText}`}>Account Status</th>
                                <th className={`px-6 py-5 text-[10px] font-bold uppercase tracking-[0.15em] ${headText}`}>Join Date</th>
                                <th className={`px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] ${headText} text-right`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${divider}`}>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-sm">
                                        <Loader2 className="animate-spin text-purple-500 mx-auto" size={24} />
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {paged.length > 0 ? paged.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.25 }}
                                        className={`transition-colors group ${rowHover}`}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <img src={user.avatar} alt={user.name} className={`w-10 h-10 rounded-full object-cover border ${isDark ? "border-white/10" : "border-slate-200"}`} />
                                                <div>
                                                    <p className={`text-sm font-bold ${nameColor}`}>{user.name}</p>
                                                    <p className={`text-xs ${emailColor}`}>{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6"><RoleBadge role={user.role} isDark={isDark} /></td>
                                        <td className="px-6 py-6"><VerificationBadge status={user.verification} isDark={isDark} /></td>
                                        <td className="px-6 py-6"><StatusBadge status={user.accountStatus} isDark={isDark} /></td>
                                        <td className={`px-6 py-6 text-xs ${dateColor}`}>{user.joinDate}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedUser(user)} className={`w-8 h-8 rounded-lg flex items-center justify-center hover:text-white hover:bg-purple-500/20 transition-all ${actionBtn}`} title="View Profile"><Eye size={15} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActionModal({ user, action: "warn" })} className={`w-8 h-8 rounded-lg flex items-center justify-center hover:text-orange-400 hover:bg-orange-500/20 transition-all ${actionBtn}`} title="Warn"><AlertTriangle size={15} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActionModal({ user, action: "ban" })} className={`w-8 h-8 rounded-lg flex items-center justify-center hover:text-red-400 hover:bg-red-500/20 transition-all ${actionBtn}`} title="Ban"><Gavel size={15} /></motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <td colSpan={6} className={`px-8 py-16 text-center text-sm ${emptyColor}`}>
                                            {searchQuery ? `No users matching "${searchQuery}"` : "No users match the current filters"}
                                        </td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className={`px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-t ${paginationBg}`}>
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${prevNextColor}`}>
                        <ChevronLeft size={14} /> Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                            <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === currentPage ? "bg-purple-500 text-white" : pageInactive}`}>
                                {page}
                            </button>
                        ))}
                        {totalPages > 5 && (
                            <>
                                <span className={`px-2 ${isDark ? "text-zinc-600" : "text-slate-400"}`}>...</span>
                                <button onClick={() => setCurrentPage(totalPages)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${totalPages === currentPage ? "bg-purple-500 text-white" : pageInactive}`}>
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${prevNextColor}`}>
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* View Profile Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className={`border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto ${modalBg}`}>
                            <div className="relative bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 flex flex-col items-center">
                                <button onClick={() => setSelectedUser(null)} className={`absolute top-3 right-3 transition-colors ${isDark ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}><X size={18} /></button>
                                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-20 h-20 rounded-full border-2 border-purple-500/30 mb-4" />
                                <h3 className={`text-lg font-bold ${modalNameColor}`}>{selectedUser.name}</h3>
                                <p className={`text-sm ${modalSubColor}`}>{selectedUser.email}</p>
                                <div className="flex gap-2 mt-3">
                                    <RoleBadge role={selectedUser.role} isDark={isDark} />
                                    <StatusBadge status={selectedUser.accountStatus} isDark={isDark} />
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className={`text-xs uppercase tracking-wider mb-1 ${modalLabelColor}`}>User ID</p><p className={`font-mono text-xs ${modalValColor}`}>{selectedUser.id}</p></div>
                                    <div><p className={`text-xs uppercase tracking-wider mb-1 ${modalLabelColor}`}>Joined</p><p className={modalValColor}>{selectedUser.joinDate}</p></div>
                                    <div><p className={`text-xs uppercase tracking-wider mb-1 ${modalLabelColor}`}>Verification</p><VerificationBadge status={selectedUser.verification} isDark={isDark} /></div>
                                    <div><p className={`text-xs uppercase tracking-wider mb-1 ${modalLabelColor}`}>Status</p><StatusBadge status={selectedUser.accountStatus} isDark={isDark} /></div>
                                    {selectedUser.mobile_number && (
                                        <div className="col-span-2">
                                            <p className={`text-xs uppercase tracking-wider mb-1 ${modalLabelColor}`}>Mobile Number</p>
                                            <p className={modalValColor}>{selectedUser.mobile_number}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Uploaded Documents Section */}
                                <div className={`pt-4 border-t ${isDark ? "border-white/5" : "border-slate-100"} space-y-3`}>
                                    <h4 className={`text-xs uppercase font-extrabold tracking-wider ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                                        Verification Documents
                                    </h4>
                                    {selectedUser.documents && selectedUser.documents.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedUser.documents.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                                                        isDark
                                                            ? "bg-zinc-800/40 border-white/5 hover:bg-zinc-800/60"
                                                            : "bg-slate-50 border-slate-200/60 hover:bg-slate-100/75"
                                                    }`}
                                                >
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-xs font-bold uppercase tracking-wide truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                                                            {doc.doc_type === "cnic" ? "CNIC / National ID" : 
                                                             doc.doc_type === "photo" ? "Profile Photo Proof" :
                                                             doc.doc_type === "employment" ? "Employment / Student ID" :
                                                             doc.doc_type === "bank" ? "Bank Statement" : doc.doc_type}
                                                        </span>
                                                        <span className={`text-[10px] ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                                                            Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                            doc.status === "verified"
                                                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                                : doc.status === "rejected"
                                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                        }`}>
                                                            {doc.status.toUpperCase()}
                                                        </span>
                                                        <a
                                                            href={doc.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${
                                                                isDark
                                                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
                                                                    : "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100"
                                                            }`}
                                                            title="Open Document"
                                                        >
                                                            <Eye size={13} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={`text-xs italic ${isDark ? "text-zinc-600" : "text-slate-400"}`}>
                                            No verification documents uploaded.
                                        </p>
                                    )}
                                </div>

                                 {selectedUser.verification !== "Verified" && (
                                     <div className={`pt-4 border-t ${isDark ? "border-white/5" : "border-slate-100"} space-y-2`}>
                                         <p className={`text-xs uppercase font-extrabold tracking-wider ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                                             Verification Control
                                         </p>
                                         <div className="flex gap-2">
                                             <button
                                                 onClick={() => handleVerify(selectedUser.id)}
                                                 className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95"
                                             >
                                                 <CheckCircle size={14} />
                                                 Verify User
                                             </button>
                                             <button
                                                 onClick={() => handleRejectVerification(selectedUser.id)}
                                                 className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all hover:scale-[1.02] active:scale-95 ${
                                                     isDark
                                                         ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400"
                                                         : "bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                                                 }`}
                                             >
                                                 <XCircle size={14} />
                                                 Reject
                                             </button>
                                         </div>
                                     </div>
                                 )}

                                {selectedUser.accountStatus === "Suspended" && (
                                    <button onClick={() => { handleRestore(selectedUser.id); setSelectedUser(null); }} className="w-full py-2.5 bg-green-500/10 text-green-500 rounded-lg text-sm font-semibold hover:bg-green-500/20 transition-colors">
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
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className={`border rounded-2xl w-full max-w-sm p-6 ${confirmModalBg}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${actionModal.action === "warn" ? "bg-orange-500/10 text-orange-400" : "bg-red-500/10 text-red-400"}`}>
                                {actionModal.action === "warn" ? <AlertTriangle size={22} /> : <Gavel size={22} />}
                            </div>
                            <h3 className={`text-lg font-bold mb-1 ${confirmTitle}`}>
                                {actionModal.action === "warn" ? "Warn User" : "Suspend User"}
                            </h3>
                            <p className={`text-sm mb-6 ${confirmSub}`}>
                                Are you sure you want to {actionModal.action === "warn" ? "issue a warning to" : "suspend the account of"}{" "}
                                <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{actionModal.user.name}</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => actionModal.action === "warn" ? handleWarn(actionModal.user.id) : handleBan(actionModal.user.id)}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${actionModal.action === "warn" ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                                >
                                    {actionModal.action === "warn" ? "Issue Warning" : "Suspend"}
                                </button>
                                <button onClick={() => setActionModal(null)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${cancelBtn}`}>
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

function RoleBadge({ role, isDark }: { role: string; isDark: boolean }) {
    const isOwner = role === "Owner";
    return (
        <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${isOwner
            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
            : isDark ? "bg-white/5 text-zinc-400 border-white/10" : "bg-slate-100 text-slate-500 border-slate-200"
        }`}>
            {role}
        </span>
    );
}

function VerificationBadge({ status, isDark }: { status: string; isDark: boolean }) {
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
            <div className={`flex items-center gap-1.5 ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
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

function StatusBadge({ status, isDark }: { status: string; isDark: boolean }) {
    if (status === "Active") {
        return (
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Active</span>
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
