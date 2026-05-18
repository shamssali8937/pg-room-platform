import axios from "axios";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Request Interceptor — attach JWT token ───────────────────────
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("pg_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor — normalize errors ─────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error?.response?.data?.message ??
            error?.message ??
            "An unexpected error occurred";
        return Promise.reject(new Error(message));
    }
);

export default api;
