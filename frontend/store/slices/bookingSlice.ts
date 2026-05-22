import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Booking {
    id: string;
    room_id: string;
    tenant_id: string;
    status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
    check_in: string;
    check_out: string;
    monthly_rent: number;
    deposit_paid: number;
    total_paid: number;
    next_payment_due: string | null;
    room: {
        id: string;
        title: string;
        address: string;
        city: string;
        images: Array<{ url: string }>;
        room_type?: string;
        floor?: number;
        amenities?: string[];
        rent_amount?: number;
        price?: number;
        owner: {
            id: string;
            full_name: string;
            email: string;
        };
    };
    created_at: string;
}

interface BookingState {
    tenantBookings: Booking[];
    ownerBookings: Booking[];
    isLoading: boolean;
    isCreating: boolean;
    error: string | null;
}

const initialState: BookingState = {
    tenantBookings: [],
    ownerBookings: [],
    isLoading: false,
    isCreating: false,
    error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchTenantBookings = createAsyncThunk(
    "booking/fetchTenantBookings",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/bookings/tenant");
            return data.data as Booking[];
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch bookings");
        }
    }
);

export const fetchOwnerBookings = createAsyncThunk(
    "booking/fetchOwnerBookings",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/bookings/owner");
            return data.data as Booking[];
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch owner bookings");
        }
    }
);

export const createBooking = createAsyncThunk(
    "booking/createBooking",
    async (
        { roomId, body }: { roomId: string; body: { check_in: string; check_out: string } },
        { rejectWithValue }
    ) => {
        try {
            const { data } = await api.post(`/bookings/room/${roomId}`, body);
            return data.data as Booking;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to create booking");
        }
    }
);

export const cancelBooking = createAsyncThunk(
    "booking/cancelBooking",
    async (id: string, { rejectWithValue }) => {
        try {
            await api.patch(`/bookings/${id}/cancel`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to cancel booking");
        }
    }
);

export const updateBookingStatus = createAsyncThunk(
    "booking/updateBookingStatus",
    async (
        { id, status }: { id: string; status: string },
        { rejectWithValue }
    ) => {
        try {
            const { data } = await api.patch(`/bookings/${id}/status`, { status });
            return data.data as Booking;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to update booking");
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        clearBookingError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Tenant bookings
        builder.addCase(fetchTenantBookings.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchTenantBookings.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tenantBookings = action.payload;
        });
        builder.addCase(fetchTenantBookings.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Owner bookings
        builder.addCase(fetchOwnerBookings.fulfilled, (state, action) => {
            state.ownerBookings = action.payload;
        });

        // Create
        builder.addCase(createBooking.pending, (state) => {
            state.isCreating = true;
        });
        builder.addCase(createBooking.fulfilled, (state, action) => {
            state.isCreating = false;
            state.tenantBookings.unshift(action.payload);
        });
        builder.addCase(createBooking.rejected, (state, action) => {
            state.isCreating = false;
            state.error = action.payload as string;
        });

        // Cancel
        builder.addCase(cancelBooking.fulfilled, (state, action) => {
            const idx = state.tenantBookings.findIndex((b) => b.id === action.payload);
            if (idx >= 0) state.tenantBookings[idx].status = "cancelled";
        });

        // Update status (owner)
        builder.addCase(updateBookingStatus.fulfilled, (state, action) => {
            const idx = state.ownerBookings.findIndex((b) => b.id === action.payload.id);
            if (idx >= 0) state.ownerBookings[idx] = action.payload;
        });
    },
});

export const { clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
