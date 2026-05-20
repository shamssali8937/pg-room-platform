import axios from "axios";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<void> | null = null;

export const fetchCsrfToken = async () => {
    if (csrfTokenPromise) return csrfTokenPromise;
    csrfTokenPromise = (async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/auth/csrf-token?t=${Date.now()}`, { withCredentials: true });
            csrfToken = data.csrfToken;
        } catch (error) {
            console.error("Failed to fetch CSRF token", error);
        }
    })();
    return csrfTokenPromise;
};

// ─── Request Interceptor — attach CSRF token ───────────────────────
api.interceptors.request.use(
    async (config) => {
        const isSafeMethod = ["get", "head", "options"].includes(config.method?.toLowerCase() || "");
        if (!isSafeMethod && !csrfToken && typeof window !== "undefined") {
            await fetchCsrfToken();
        }
        if (!isSafeMethod && csrfToken) {
            if (typeof config.headers.set === 'function') {
                config.headers.set("x-csrf-token", csrfToken);
            } else {
                config.headers["x-csrf-token"] = csrfToken;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor — normalize errors & handle refresh ─────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                return api(originalRequest);
            } catch (refreshError) {
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("auth-expired"));
                }
                return Promise.reject(refreshError);
            }
        }

        const message =
            error?.response?.data?.message ??
            error?.message ??
            "An unexpected error occurred";
        return Promise.reject(new Error(message));
    }
);

export default api;
