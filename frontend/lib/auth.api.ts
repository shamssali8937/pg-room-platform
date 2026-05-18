import api from "./api";

// ─── Types ────────────────────────────────────────────────────────

export type UserRole = "tenant" | "owner" | "admin";

export interface SignupPayload {
    full_name: string;
    email: string;
    password: string;
    mobile_number?: string;
    role: UserRole;
}

export interface SignupResponse {
    success: boolean;
    message: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    mobile_number: string | null;
    email_verified_at: string | null;
    mobile_verified_at: string | null;
    created_at: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: AuthUser;
}

// ─── API calls ───────────────────────────────────────────────────

export const signupApi = async (
    payload: SignupPayload
): Promise<SignupResponse> => {
    const { data } = await api.post<SignupResponse>("/auth/signup", payload);
    return data;
};

export const loginApi = async (
    payload: LoginPayload
): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return data;
};

export const logoutApi = async (): Promise<void> => {
    await api.post("/auth/logout");
};

export const forgotPasswordApi = async (email: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
};
