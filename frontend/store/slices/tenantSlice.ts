import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface PointTransaction {
    id: string;
    type: "EARNED" | "SPENT";
    amount: number;
    description: string;
    created_at: string;
}

interface TenantState {
    points: number;
    pointTransactions: PointTransaction[];
    isLoading: boolean;
    error: string | null;
}

const initialState: TenantState = {
    points: 0,
    pointTransactions: [],
    isLoading: false,
    error: null,
};

export const fetchTenantPoints = createAsyncThunk(
    "tenant/fetchTenantPoints",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/users/me/points");
            return data.data;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch points");
        }
    }
);

export const fetchTenantPointTransactions = createAsyncThunk(
    "tenant/fetchTenantPointTransactions",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/users/me/points/transactions");
            return data.data as any[];
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch transactions");
        }
    }
);

const tenantSlice = createSlice({
    name: "tenant",
    initialState,
    reducers: {
        clearTenantError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTenantPoints.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchTenantPoints.fulfilled, (state, action) => {
            state.isLoading = false;
            state.points = action.payload?.points ?? (typeof action.payload === "number" ? action.payload : 0);
        });
        builder.addCase(fetchTenantPoints.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        builder.addCase(fetchTenantPointTransactions.fulfilled, (state, action) => {
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

export const { clearTenantError } = tenantSlice.actions;
export default tenantSlice.reducer;
