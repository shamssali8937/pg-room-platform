import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Room {
    id: string;
    title: string;
    description: string | null;
    price: number;
    price_unit: string;
    city: string;
    address: string;
    beds: number;
    baths: number;
    sqft: number | null;
    status: string;
    is_verified: boolean;
    is_featured: boolean;
    is_boosted: boolean;
    views: number;
    images: Array<{ url: string; public_id: string }>;
    amenities: string[];
    owner: {
        id: string;
        full_name: string;
        email: string;
        verification_status?: string;
    };
    rating?: number;
    review_count?: number;
    rejection_reason?: string | null;
    created_at: string;
    inquiries?: number;
    locality?: string;
    landmark?: string | null;
    room_type?: string;
    furnished_status?: string;
    security_deposit_amount?: number;
    available_for?: string;
    gender_preference?: string;
    size_value?: number | null;
    availability_date?: string | null;
}

export interface RoomFilters {
    city?: string;
    min_price?: number;
    max_price?: number;
    beds?: number;
    sort?: string;
    search?: string;
    page?: number;
    limit?: number;
    status?: string;
    room_type?: string;
    furnished_status?: string;
    gender_preference?: string;
    availability_date?: string;
    amenities?: string;
}

interface RoomState {
    rooms: Room[];
    savedRooms: Room[];
    ownerRooms: Room[];
    selectedRoom: Room | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    total: number;
    page: number;
}

const initialState: RoomState = {
    rooms: [],
    savedRooms: [],
    ownerRooms: [],
    selectedRoom: null,
    isLoading: false,
    isSaving: false,
    error: null,
    total: 0,
    page: 1,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchRooms = createAsyncThunk(
    "room/fetchRooms",
    async (filters: RoomFilters = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => {
                if (v !== undefined && v !== "") params.set(k, String(v));
            });
            const { data } = await api.get(`/rooms?${params}`);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch rooms");
        }
    }
);

export const fetchRoomById = createAsyncThunk(
    "room/fetchRoomById",
    async (id: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/rooms/${id}`);
            return data.data as Room;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch room");
        }
    }
);

export const fetchSavedRooms = createAsyncThunk(
    "room/fetchSavedRooms",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/rooms/saved/list");
            return data.data as Room[];
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch saved rooms");
        }
    }
);

export const saveRoom = createAsyncThunk(
    "room/saveRoom",
    async (id: string, { rejectWithValue }) => {
        try {
            await api.post(`/rooms/${id}/save`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to save room");
        }
    }
);

export const unsaveRoom = createAsyncThunk(
    "room/unsaveRoom",
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/rooms/${id}/save`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to unsave room");
        }
    }
);

export const fetchOwnerRooms = createAsyncThunk(
    "room/fetchOwnerRooms",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/owner/rooms");
            return data.data as Room[];
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to fetch owner rooms");
        }
    }
);

export const createRoom = createAsyncThunk(
    "room/createRoom",
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/rooms", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return data.data as Room;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to create room");
        }
    }
);

export const updateRoom = createAsyncThunk(
    "room/updateRoom",
    async ({ id, body }: { id: string; body: Partial<Room> }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/rooms/${id}`, body);
            return data.data as Room;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to update room");
        }
    }
);

export const deleteRoom = createAsyncThunk(
    "room/deleteRoom",
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/rooms/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to delete room");
        }
    }
);

export const submitRoom = createAsyncThunk(
    "room/submitRoom",
    async (id: string, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/rooms/${id}/submit`);
            return data.data as Room;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to submit room");
        }
    }
);

export const boostRoom = createAsyncThunk(
    "room/boostRoom",
    async (id: string, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/owner/rooms/${id}/boost`);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Failed to boost room");
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        clearRoomError(state) {
            state.error = null;
        },
        setSelectedRoom(state, action) {
            state.selectedRoom = action.payload;
        },
        toggleSavedLocal(state, action) {
            const id = action.payload;
            const idx = state.rooms.findIndex((r) => r.id === id);
            // toggle in savedRooms list
            const savedIdx = state.savedRooms.findIndex((r) => r.id === id);
            if (savedIdx >= 0) {
                state.savedRooms.splice(savedIdx, 1);
            }
        },
        updateRoomViews(state, action: { payload: { id: string; views: number } }) {
            const { id, views } = action.payload;
            const room = state.ownerRooms.find((r) => r.id === id);
            if (room) {
                room.views = views;
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch Rooms
        builder.addCase(fetchRooms.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchRooms.fulfilled, (state, action) => {
            state.isLoading = false;
            state.rooms = action.payload.data?.rooms ?? action.payload.data ?? [];
            state.total = action.payload.data?.total ?? 0;
        });
        builder.addCase(fetchRooms.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Owner Rooms
        builder.addCase(fetchOwnerRooms.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchOwnerRooms.fulfilled, (state, action) => {
            state.isLoading = false;
            state.ownerRooms = action.payload;
        });
        builder.addCase(fetchOwnerRooms.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Saved Rooms
        builder.addCase(fetchSavedRooms.fulfilled, (state, action) => {
            state.savedRooms = action.payload;
        });

        // Create Room
        builder.addCase(createRoom.fulfilled, (state, action) => {
            state.ownerRooms.unshift(action.payload);
        });

        // Update Room
        builder.addCase(updateRoom.fulfilled, (state, action) => {
            const idx = state.ownerRooms.findIndex((r) => r.id === action.payload.id);
            if (idx >= 0) state.ownerRooms[idx] = action.payload;
        });

        // Delete Room
        builder.addCase(deleteRoom.fulfilled, (state, action) => {
            state.ownerRooms = state.ownerRooms.filter((r) => r.id !== action.payload);
        });

        // Submit Room
        builder.addCase(submitRoom.fulfilled, (state, action) => {
            const idx = state.ownerRooms.findIndex((r) => r.id === action.payload.id);
            if (idx >= 0) state.ownerRooms[idx] = action.payload;
        });
    },
});

export const { clearRoomError, setSelectedRoom, toggleSavedLocal, updateRoomViews } = roomSlice.actions;
export default roomSlice.reducer;
