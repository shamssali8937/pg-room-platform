/**
 * Auth validation schemas using Zod.
 * Applied via the `validate` middleware to all auth endpoints.
 */
import { z } from "zod";
import { sanitizeString } from "../utils/sanitize.util.js";

export const signupSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        full_name: z.string().min(2, "Full name must be at least 2 characters").max(100).transform(sanitizeString),
        mobile_number: z.string().min(10, "Mobile number must be at least 10 digits").transform(sanitizeString).optional(),
        role: z.enum(["tenant", "owner"]).optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, "Reset token is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
    }),
});

export const verifyPhoneOTPSchema = z.object({
    body: z.object({
        mobile_number: z.string().min(10, "Mobile number required"),
        otp: z.string().length(6, "OTP must be 6 digits"),
    }),
});

export const sendPhoneOTPSchema = z.object({
    body: z.object({
        mobile_number: z.string().min(10, "Mobile number required"),
    }),
});

export const requestPasswordOTPSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
    }),
});

export const verifyPasswordOTPSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        otp: z.string().length(6, "OTP must be 6 digits"),
    }),
});

export const resetPasswordWithOTPSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        otp: z.string().length(6, "OTP must be 6 digits"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
    }),
});

// ─── Signup Email OTP ─────────────────────────────────────────────────────────

export const verifyEmailOTPSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        otp: z.string().length(6, "OTP must be 6 digits"),
    }),
});

export const resendEmailOTPSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
    }),
});
