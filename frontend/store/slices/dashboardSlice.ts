import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TenantDashboardData {
    active_booking: any | null;
    recent_bookings: any[];
    unread_messages: number;
    saved_count: number;
    points: number;
    tier: string;
}

export interface OwnerDashboardData {
    total_rooms: number;
    live_rooms: number;
    total_views: number;
    total_inquiries: number;
    points: number;
    recent_rooms: any[];
    recent_inquiries: any[];
}

export interface AdminDashboardData {
    total_users: number;
    total_rooms: number;
    pending_rooms: number;
    active_reports: number;
    recent_actions: any[];
}

interface DashboardState {
    tenantData: TenantDashboardData | null;
    ownerData: OwnerDashboardData | null;
    adminData: AdminDashboardData | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    tenantData: null,
    ownerData: null,
    adminData: null,
    isLoading: false,
    error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchTenantDashboard = createAsyncThunk(
    "dashboard/tenant",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/dashboard/tenant");
            return data.data as TenantDashboardData;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to load dashboard");
        }
    }
);

export const fetchOwnerDashboard = createAsyncThunk(
    "dashboard/owner",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/dashboard/owner");
            return data.data as OwnerDashboardData;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to load dashboard");
        }
    }
);

export const fetchAdminDashboard = createAsyncThunk(
    "dashboard/admin",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/dashboard/admin");
            return data.data as AdminDashboardData;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to load admin dashboard");
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        clearDashboardError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Tenant
        builder.addCase(fetchTenantDashboard.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchTenantDashboard.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tenantData = action.payload;
        });
        builder.addCase(fetchTenantDashboard.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Owner
        builder.addCase(fetchOwnerDashboard.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchOwnerDashboard.fulfilled, (state, action) => {
            state.isLoading = false;
            state.ownerData = action.payload;
        });
        builder.addCase(fetchOwnerDashboard.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Admin
        builder.addCase(fetchAdminDashboard.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchAdminDashboard.fulfilled, (state, action) => {
            state.isLoading = false;
            state.adminData = action.payload;
        });
        builder.addCase(fetchAdminDashboard.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
