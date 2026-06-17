import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminRoom {
    id: string;
    title: string;
    city: string;
    address: string;
    room_type: string;
    price: number;
    beds: number;
    baths: number;
    status: string;
    is_verified: boolean;
    is_featured: boolean;
    is_boosted: boolean;
    views: number;
    rejected_reason?: string | null;
    owner: { id: string; full_name: string; email: string; profile_photo_url?: string | null };
    images: Array<{ url: string; public_id: string }>;
    created_at: string;
    description?: string;
    amenities?: string[];
    amenities_list?: string[];
    locality?: string;
    landmark?: string;
    furnished_status?: string;
    security_deposit_amount?: number;
    available_for?: string;
    gender_preference?: string;
    sqft?: number;
    size_value?: number;
    reviews?: any;
    was_suspended?: boolean;
    last_suspension_reason?: string | null;
    availability_date?: string | null;
    approximate_latitude?: number | null;
    approximate_longitude?: number | null;
}

export interface UserDocument {
    id: string;
    doc_type: string;
    file_url: string;
    status: string;
    created_at: string;
}

export interface AdminUser {
    id: string;
    full_name: string;
    email: string;
    role: string;
    profile_photo_url?: string | null;
    account_status: string;
    mobile_number?: string | null;
    verification_status: string;
    created_at: string;
    documents?: UserDocument[];
    _count?: { rooms: number; bookings_as_tenant: number };
}

export interface AdminReport {
    id: string;
    reporter_id: string;
    reporter: { full_name: string; email: string; profile_photo_url?: string | null };
    target_type: string;
    target_id: string;
    reason_code: string;
    description?: string | null;
    status: string;
    admin_action?: string | null;
    resolved_at?: string | null;
    created_at: string;
}

export interface AdminPointsTx {
    id: string;
    owner_id: string;
    owner: { full_name: string; email: string; profile_photo_url?: string | null };
    transaction_type: string;
    points: number;
    reason_code: string;
    balance_after: number;
    created_at: string;
}

export interface AdminAction {
    id: string;
    admin: { full_name: string; email: string };
    action_type: string;
    target_type: string;
    target_id: string;
    notes?: string | null;
    created_at: string;
}

export interface AdminDashboardStats {
    totalUsers: number;
    totalOwners: number;
    totalTenants: number;
    activeListings: number;
    pendingListings: number;
    pendingReports: number;
}

interface AdminState {
    rooms: AdminRoom[];
    users: AdminUser[];
    reports: AdminReport[];
    pointsTransactions: AdminPointsTx[];
    auditActions: AdminAction[];
    dashboardStats: AdminDashboardStats | null;
    recentReports: Array<{ id: string; title: string; description: string; severity: "high" | "medium" | "low" }>;
    recentPointsActivity: Array<{ id: string; amount: number; type: "earned" | "spent"; user: string; reason: string; icon: string }>;
    isLoading: boolean;
    error: string | null;
    reportsSeen: boolean;
}

const initialState: AdminState = {
    rooms: [],
    users: [],
    reports: [],
    pointsTransactions: [],
    auditActions: [],
    dashboardStats: null,
    recentReports: [],
    recentPointsActivity: [],
    isLoading: false,
    error: null,
    reportsSeen: false,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchAdminDashboard = createAsyncThunk(
    "admin/fetchDashboard",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/dashboard/admin");
            return data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to fetch dashboard");
        }
    }
);

export const fetchAdminListings = createAsyncThunk<AdminRoom[], string | undefined>(
    "admin/fetchListings",
    async (status, { rejectWithValue }) => {
        try {
            const params = status ? `?status=${status}` : "";
            const { data } = await api.get(`/admin/listings${params}`);
            return data.data as AdminRoom[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to fetch listings");
        }
    }
);

export const moderateListing = createAsyncThunk(
    "admin/moderateListing",
    async ({ id, status, reason }: { id: string; status: string; reason?: string }, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/admin/listings/${id}/moderate`, { status, reason });
            return { id, status, reason, room: data.data };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to moderate listing");
        }
    }
);

export const fetchAdminUsers = createAsyncThunk(
    "admin/fetchUsers",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/admin/users");
            return data.data as AdminUser[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to fetch users");
        }
    }
);

export const updateUserStatus = createAsyncThunk(
    "admin/updateUserStatus",
    async ({ id, status, reason }: { id: string; status: string; reason: string }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/admin/users/${id}/status`, { status, reason });
            return { id, status, user: data.data };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to update user status");
        }
    }
);

export const verifyUser = createAsyncThunk(
    "admin/verifyUser",
    async ({ id, status, reason }: { id: string; status: string; reason?: string }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/admin/users/${id}/verify`, { status, reason });
            return { id, status, user: data.data };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to verify user");
        }
    }
);

export const fetchAdminReports = createAsyncThunk(
    "admin/fetchReports",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/admin/reports");
            return data.data as AdminReport[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to fetch reports");
        }
    }
);

export const resolveReport = createAsyncThunk(
    "admin/resolveReport",
    async ({ id, resolutionDetails }: { id: string; resolutionDetails: string }, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/admin/reports/${id}/resolve`, { resolutionDetails });
            return { id, report: data.data };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to resolve report");
        }
    }
);

export const fetchAdminPointsTransactions = createAsyncThunk(
    "admin/fetchPointsTransactions",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/admin/points/transactions");
            return data.data as AdminPointsTx[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to fetch points");
        }
    }
);

export const adjustOwnerPoints = createAsyncThunk(
    "admin/adjustPoints",
    async ({ ownerId, points, reasonCode }: { ownerId: string; points: number; reasonCode: string }, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/admin/points/${ownerId}/adjust`, { points, reasonCode });
            return data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to adjust points");
        }
    }
);

export const fetchAuditActions = createAsyncThunk(
    "admin/fetchAuditActions",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/admin/audit-actions");
            return data.data as AdminAction[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? "Failed to fetch audit actions");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        clearAdminError(state) {
            state.error = null;
        },
        markReportsAsSeen(state) {
            state.reportsSeen = true;
        },
    },
    extraReducers: (builder) => {
        // Generic loading/error helpers
        const addLoadingCases = (thunk: any) => {
            builder.addCase(thunk.pending, (state) => { state.isLoading = true; state.error = null; });
            builder.addCase(thunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
        };

        // Dashboard
        addLoadingCases(fetchAdminDashboard);
        builder.addCase(fetchAdminDashboard.fulfilled, (state, action) => {
            state.isLoading = false;
            state.dashboardStats = action.payload?.stats ?? action.payload;
            state.recentReports = action.payload?.recentReports ?? [];
            state.recentPointsActivity = action.payload?.recentPointsActivity ?? [];
        });

        // Listings
        addLoadingCases(fetchAdminListings);
        builder.addCase(fetchAdminListings.fulfilled, (state, action) => {
            state.isLoading = false;
            state.rooms = action.payload;
        });

        builder.addCase(moderateListing.fulfilled, (state, action) => {
            const { id, status, reason } = action.payload;
            const idx = state.rooms.findIndex((r) => r.id === id);
            if (idx >= 0) {
                state.rooms[idx].status = status;
                if (reason) state.rooms[idx].rejected_reason = reason;
            }
        });

        // Users
        addLoadingCases(fetchAdminUsers);
        builder.addCase(fetchAdminUsers.fulfilled, (state, action) => {
            state.isLoading = false;
            state.users = action.payload;
        });

        builder.addCase(updateUserStatus.fulfilled, (state, action) => {
            const { id, status } = action.payload;
            const idx = state.users.findIndex((u) => u.id === id);
            if (idx >= 0) state.users[idx].account_status = status;
        });

        builder.addCase(verifyUser.fulfilled, (state, action) => {
            const { id, status } = action.payload;
            const idx = state.users.findIndex((u) => u.id === id);
            if (idx >= 0) {
                state.users[idx].verification_status = status;
                if (state.users[idx].documents) {
                    state.users[idx].documents = state.users[idx].documents?.map((d) => ({
                        ...d,
                        status: status === "verified" ? "verified" : "rejected"
                    }));
                }
            }
        });

        // Reports
        addLoadingCases(fetchAdminReports);
        builder.addCase(fetchAdminReports.fulfilled, (state, action) => {
            state.isLoading = false;
            const oldPendingIds = new Set(state.reports.filter(r => r.status !== "resolved").map(r => r.id));
            const newPending = action.payload.filter((r: any) => r.status !== "resolved");
            const hasNewPending = newPending.some((r: any) => !oldPendingIds.has(r.id));
            if (hasNewPending) {
                state.reportsSeen = false;
            }
            state.reports = action.payload;
        });

        builder.addCase(resolveReport.fulfilled, (state, action) => {
            const { id } = action.payload;
            const idx = state.reports.findIndex((r) => r.id === id);
            if (idx >= 0) state.reports[idx].status = "resolved";
        });

        // Points
        addLoadingCases(fetchAdminPointsTransactions);
        builder.addCase(fetchAdminPointsTransactions.fulfilled, (state, action) => {
            state.isLoading = false;
            state.pointsTransactions = action.payload;
        });

        builder.addCase(adjustOwnerPoints.fulfilled, (state, action) => {
            // Prepend new transaction
            if (action.payload) state.pointsTransactions.unshift(action.payload);
        });

        // Audit
        addLoadingCases(fetchAuditActions);
        builder.addCase(fetchAuditActions.fulfilled, (state, action) => {
            state.isLoading = false;
            state.auditActions = action.payload;
        });
    },
});

export const { clearAdminError, markReportsAsSeen } = adminSlice.actions;
export default adminSlice.reducer;
