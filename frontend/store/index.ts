import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import roomReducer from "@/store/slices/roomSlice";
import bookingReducer from "@/store/slices/bookingSlice";
import chatReducer from "@/store/slices/chatSlice";
import ownerReducer from "@/store/slices/ownerSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import adminReducer from "@/store/slices/adminSlice";
import tenantReducer from "@/store/slices/tenantSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        room: roomReducer,
        booking: bookingReducer,
        chat: chatReducer,
        owner: ownerReducer,
        dashboard: dashboardReducer,
        admin: adminReducer,
        tenant: tenantReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
