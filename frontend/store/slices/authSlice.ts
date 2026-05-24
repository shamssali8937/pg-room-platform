import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser, getMeApi, loginApi, logoutApi, signupApi, LoginPayload, SignupPayload } from "@/lib/auth.api";

// ─── State ─────────────────────────────────────────────────────────────────

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // start as loading to rehydrate session
    error: null,
};

// ─── Async Thunks ──────────────────────────────────────────────────────────

export const hydrateAuth = createAsyncThunk(
    "auth/hydrate",
    async (_, { rejectWithValue }) => {
        try {
            const res = await getMeApi();
            if (res.success) return res.data;
            return rejectWithValue("Not authenticated");
        } catch {
            return rejectWithValue("Session expired");
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async (payload: LoginPayload, { rejectWithValue }) => {
        try {
            const res = await loginApi(payload);
            return res.user;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Login failed");
        }
    }
);

export const signupUser = createAsyncThunk(
    "auth/signup",
    async (payload: SignupPayload, { rejectWithValue }) => {
        try {
            const res = await signupApi(payload);
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Signup failed");
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await logoutApi();
        } catch (err: any) {
            return rejectWithValue(err.message ?? "Logout failed");
        }
    }
);

const mapUserPhotos = (user: AuthUser | null): AuthUser | null => {
    if (!user) return null;
    const photo = user.profile_photo_url ?? user.image;
    return {
        ...user,
        profile_photo_url: photo,
        image: photo,
    };
};

// ─── Slice ─────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<AuthUser>) {
            state.user = mapUserPhotos(action.payload);
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },
        clearUser(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Hydrate
        builder.addCase(hydrateAuth.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(hydrateAuth.fulfilled, (state, action) => {
            state.user = mapUserPhotos(action.payload);
            state.isAuthenticated = true;
            state.isLoading = false;
        });
        builder.addCase(hydrateAuth.rejected, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        });

        // Login
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.user = mapUserPhotos(action.payload);
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        });
    },
});

export const { setUser, clearUser, clearError } = authSlice.actions;
export default authSlice.reducer;
