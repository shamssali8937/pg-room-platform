import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OwnerStats {
    total_rooms: number;
    live_rooms: number;
    pending_rooms: number;
    rejected_rooms: number;
    total_views: number;
    total_inquiries: number;
    points: number;
    occupancy_rate: number;
}

export interface PointTransaction {
    id: string;
    type: "EARNED" | "SPENT";
    amount: number;
    description: string;
    created_at: string;
}

interface OwnerState {
    stats: OwnerStats | null;
    points: number;
    pointTransactions: PointTransaction[];
    isLoading: boolean;
    error: string | null;
}

const initialState: OwnerState = {
    stats: null,
    points: 0,
    pointTransactions: [],
    isLoading: false,
    error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchOwnerPoints = createAsyncThunk(
    "owner/fetchOwnerPoints",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/owner/points");
            return data.data;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch points");
        }
    }
);

export const fetchOwnerPointTransactions = createAsyncThunk(
    "owner/fetchPointTransactions",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/owner/points/transactions");
            return data.data as PointTransaction[];
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch transactions");
        }
    }
);

export const boostRoomOwner = createAsyncThunk(
    "owner/boostRoom",
    async (roomId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/owner/rooms/${roomId}/boost`);
            return data.data;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to boost room");
        }
    }
);

export const featureRoomOwner = createAsyncThunk(
    "owner/featureRoom",
    async (roomId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/owner/rooms/${roomId}/feature`);
            return data.data;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to feature room");
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const ownerSlice = createSlice({
    name: "owner",
    initialState,
    reducers: {
        clearOwnerError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchOwnerPoints.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchOwnerPoints.fulfilled, (state, action) => {
            state.isLoading = false;
            state.points = action.payload?.points ?? action.payload?.balance ?? (typeof action.payload === "number" ? action.payload : 0);
        });
        builder.addCase(fetchOwnerPoints.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        builder.addCase(fetchOwnerPointTransactions.fulfilled, (state, action) => {
            state.pointTransactions = (action.payload || []).map((tx: any) => {
                const isEarned = (tx.points ?? 0) >= 0;
                const reasonText = tx.reason_code
                    ? tx.reason_code.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
                    : (tx.transaction_type || "Points Transaction");
                const description = tx.room?.title
                    ? `${reasonText} (${tx.room.title})`
                    : reasonText;

                return {
                    id: tx.id,
                    type: isEarned ? "EARNED" : "SPENT",
                    amount: Math.abs(tx.points ?? 0),
                    description,
                    created_at: tx.created_at,
                };
            });
        });
    },
});

export const { clearOwnerError } = ownerSlice.actions;
export default ownerSlice.reducer;
