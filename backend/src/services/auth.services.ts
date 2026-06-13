import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/mail.js";
import crypto from "crypto";
import { generateOTP, getOTPExpiry } from "../utils/otp.js";
import { redis } from "../config/redis.js";

// ─── Redis key helpers ────────────────────────────────────────────────────────
const OTP_PHONE_KEY = (mobile: string) => `otp:phone:${mobile}`;
const OTP_RESET_KEY = (email: string) => `otp:reset:${email}`;
const RESET_TOKEN_KEY = (token: string) => `reset:token:${token}`;

const setRedisKey = async (key: string, ttlSeconds: number, value: string): Promise<void> => {
    if (redis) await redis.setex(key, ttlSeconds, value);
};
const getRedisKey = async (key: string): Promise<string | null> => {
    if (!redis) return null;
    return redis.get(key);
};
const delRedisKey = async (key: string): Promise<void> => {
    if (redis) await redis.del(key);
};


export const signupService = async (data: any) => {
    const { email, password, full_name, mobile_number, role } = data;

    // P1-C: Only tenant or owner can be self-registered
    const safeRole = role === "owner" ? "owner" : "tenant";

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const emailToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
        data: {
            email,
            password_hash: hashedPassword,
            full_name,
            mobile_number,
            role: safeRole,
            email_verify_token: emailToken,
        },
    });

    const apiUrl = process.env.API_URL || "http://localhost:5000/api";
    const verifyLink = `${apiUrl}/auth/verify-email?token=${emailToken}`;

    // Print verification link to console as a convenient developer fallback
    console.log("\n==========================================");
    console.log("📨 VERIFICATION LINK:", verifyLink);
    console.log("==========================================\n");

    try {
        await sendEmail(
            email,
            "Verify your email",
            `<h3>Click to verify:</h3><a href="${verifyLink}">${verifyLink}</a>`
        );
    } catch (err: any) {
        console.warn("Verification email sending failed during signup:", err.message || err);
    }

    return { message: "Signup successful. Please verify your email using the link sent." };
};
export const loginService = async (email: string, password: string) => {
    // login user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) throw new Error("User not found");
    if (!user.email_verified_at) {
        throw new Error("Email not verified");
    }

    // Phase 1: Check account lockout
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 15;

    if (user.locked_until && new Date() < user.locked_until) {
        const minutesLeft = Math.ceil(
            (user.locked_until.getTime() - Date.now()) / 60000
        );
        const err: any = new Error(
            `Account is temporarily locked due to too many failed login attempts. Try again in ${minutesLeft} minute(s).`
        );
        err.code = "ACCOUNT_LOCKED";
        err.minutesLeft = minutesLeft;
        throw err;
    }

    if (!user.password_hash) {
        throw new Error("This account is configured with Google Sign-In. Please sign in with Google.");
    }

    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
        // Phase 1: Increment failure counter
        const newAttempts = (user.failed_login_attempts ?? 0) + 1;
        const shouldLock = newAttempts >= MAX_ATTEMPTS;
        const lockUntil = shouldLock
            ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
            : null;

        await prisma.user.update({
            where: { id: user.id },
            data: {
                failed_login_attempts: newAttempts,
                ...(shouldLock && { locked_until: lockUntil }),
            },
        });

        if (shouldLock) {
            const err: any = new Error(
                `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`
            );
            err.code = "ACCOUNT_LOCKED";
            err.minutesLeft = LOCKOUT_MINUTES;
            throw err;
        }

        const remaining = MAX_ATTEMPTS - newAttempts;
        throw new Error(
            `Invalid password. ${remaining} attempt(s) remaining before account lockout.`
        );
    }

    // Phase 1: Reset failure counter on successful login
    await prisma.user.update({
        where: { id: user.id },
        data: { failed_login_attempts: 0, locked_until: null },
    });

    const accessToken = generateAccessToken({
        id: user.id,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        id: user.id,
        role: user.role,
    });

    // Store refresh token
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            user_id: user.id,
            expires_at: expiryDate,
        }
    });

    const { password_hash, ...safeUser } = user;

    return { accessToken, refreshToken, user: safeUser };
};

export const logoutService = async (refreshToken: string) => {
    if (!refreshToken) return;
    await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
    });
};

export const refreshTokenService = async (token: string) => {
    if (!token) throw new Error("No refresh token provided");

    // Verify token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token }
    });

    if (!storedToken) throw new Error("Invalid refresh token");

    if (new Date() > storedToken.expires_at) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        throw new Error("Refresh token expired");
    }

    try {
        const decoded: any = verifyToken(token);
        
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) throw new Error("User not found");

        const newAccessToken = generateAccessToken({ id: user.id, role: user.role });
        const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });

        // Rotate refresh token
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: {
                token: newRefreshToken,
                expires_at: expiryDate,
            }
        });

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        throw new Error("Invalid refresh token");
    }
};

export const sendPhoneOTPService = async (mobile_number: string) => {
    const user = await prisma.user.findUnique({
        where: { mobile_number },
    });

    if (!user) throw new Error("User not found");

    const otp = generateOTP();

    // Store OTP in Redis with 5-minute TTL instead of Postgres
    await setRedisKey(OTP_PHONE_KEY(mobile_number), 300, otp);

    return { message: "OTP sent" };
};

export const verifyPhoneOTPService = async (
    mobile_number: string,
    otp: string
) => {
    const user = await prisma.user.findUnique({
        where: { mobile_number },
    });

    if (!user) throw new Error("User not found");

    // Verify OTP from Redis
    const storedOtp = await getRedisKey(OTP_PHONE_KEY(mobile_number));
    if (!storedOtp || storedOtp !== otp) {
        throw new Error("Invalid or expired OTP");
    }

    // OTP verified — delete it immediately (single-use)
    await delRedisKey(OTP_PHONE_KEY(mobile_number));

    await prisma.user.update({
        where: { id: user.id },
        data: {
            mobile_verified_at: new Date(),
            phone_otp: null,
        },
    });

    return { message: "Phone verified successfully" };
};

export const verifyEmailService = async (token: string) => {
    if (!token) {
        throw new Error("Token is required");
    }

    const user = await prisma.user.findFirst({
        where: { email_verify_token: String(token) },
    });

    if (!user) {
        throw new Error("Invalid token");
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            email_verified_at: new Date(),
            email_verify_token: null,
        },
    });

    return {
        message: "Email verified successfully",
        userId: updatedUser.id,
    };
};

export const forgotPasswordService = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const token = crypto.randomBytes(32).toString("hex");

    // Store reset token in Redis with 1-hour TTL
    await setRedisKey(RESET_TOKEN_KEY(token), 3600, user.id);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    console.log("\n==========================================");
    console.log("🔑 PASSWORD RESET LINK:", resetLink);
    console.log("==========================================\n");

    try {
        await sendEmail(
            email,
            "Reset your password",
            `<h3>Password Reset</h3><p>Click the link below to reset your password (valid for 1 hour):</p><a href="${resetLink}">${resetLink}</a><p>If you did not request this, ignore this email.</p>`
        );
    } catch (err: any) {
        console.warn("Password reset email failed:", err.message || err);
    }

    return { message: "Password reset link sent to your email" };
};

export const resetPasswordService = async (token: string, newPassword: string) => {
    if (!token) throw new Error("Invalid or missing token");

    // Look up userId from Redis (token has 1h TTL set in forgotPasswordService)
    const userId = await getRedisKey(RESET_TOKEN_KEY(token));
    if (!userId) throw new Error("Invalid or expired password reset token");

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: userId },
        data: {
            password_hash: hashedPassword,
            reset_token: null,
            reset_token_expiry: null,
        },
    });

    // Delete the token from Redis — single use
    await delRedisKey(RESET_TOKEN_KEY(token));

    return { message: "Password reset successfully" };
};

export const googleAuthService = async (code: string, state: string) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error("Google OAuth environment variables are not configured.");
    }

    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: callbackUrl,
            grant_type: "authorization_code",
        }).toString(),
    });

    if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Failed to exchange Google OAuth code: ${errText}`);
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };

    // 2. Fetch user profile from Google
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
    });

    if (!profileResponse.ok) {
        throw new Error("Failed to retrieve user profile from Google");
    }

    const profile = (await profileResponse.json()) as {
        sub: string;
        email: string;
        email_verified: boolean;
        name: string;
        picture?: string;
    };

    if (!profile.email_verified) {
        throw new Error("Google email is not verified");
    }

    // 3. Find or create user
    let user = await prisma.user.findUnique({
        where: { email: profile.email },
    });

    if (user) {
        // Support existing users: check if we need to update profile photo or verify email
        let needsUpdate = false;
        const updateData: any = {};

        if (!user.profile_photo_url && profile.picture) {
            updateData.profile_photo_url = profile.picture;
            needsUpdate = true;
        }

        if (!user.email_verified_at) {
            updateData.email_verified_at = new Date();
            needsUpdate = true;
        }

        if (needsUpdate) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });
        }
    } else {
        // Automatically create user on first login (signup)
        const role = (state === "owner" || state === "admin" || state === "tenant") ? state : "tenant";
        user = await prisma.user.create({
            data: {
                email: profile.email,
                full_name: profile.name,
                profile_photo_url: profile.picture || null,
                role,
                email_verified_at: new Date(),
                password_hash: null as any,
                mobile_number: null as any,
            },
        });
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken({
        id: user.id,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        id: user.id,
        role: user.role,
    });

    // Store refresh token
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            user_id: user.id,
            expires_at: expiryDate,
        },
    });

    const { password_hash, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
};

// ─── OTP-based Password Reset ─────────────────────────────────────────────────

export const requestPasswordOTPService = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return { message: "If this email exists, an OTP has been sent." };

    const otp = generateOTP();

    // Store OTP in Redis with 5-minute TTL
    await setRedisKey(OTP_RESET_KEY(email), 300, otp);

    console.log("\n==========================================");
    console.log("🔑 PASSWORD RESET OTP:", otp);
    console.log("==========================================\n");

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 16px; border: 1px solid #2d2d2d;">
            <h2 style="color: #a78bfa; margin-bottom: 8px;">Password Reset OTP</h2>
            <p style="color: #9ca3af; margin-bottom: 24px;">You requested a password reset for your PG Room account. Use the OTP below (valid for 5 minutes):</p>
            <div style="background: #1a1a2e; border: 2px solid #7c3aed; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #a78bfa;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 13px;">If you did not request this, please ignore this email. Your password will not change.</p>
        </div>
    `;

    try {
        await sendEmail(email, "Your Password Reset OTP – PG Room", html);
    } catch (err: any) {
        console.warn("OTP email failed:", err.message || err);
    }

    return { message: "If this email exists, an OTP has been sent." };
};

export const verifyPasswordOTPService = async (email: string, otp: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid OTP or email");

    // Verify OTP from Redis
    const storedOtp = await getRedisKey(OTP_RESET_KEY(email));
    if (!storedOtp || storedOtp !== otp) {
        throw new Error("Invalid or expired OTP");
    }

    return { message: "OTP verified successfully" };
};

export const resetPasswordWithOTPService = async (
    email: string,
    otp: string,
    newPassword: string
) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid OTP or email");

    // Verify OTP from Redis
    const storedOtp = await getRedisKey(OTP_RESET_KEY(email));
    if (!storedOtp || storedOtp !== otp) {
        throw new Error("Invalid or expired OTP");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password_hash: hashedPassword,
            reset_token: null,
            reset_token_expiry: null,
            failed_login_attempts: 0,
            locked_until: null,
        },
    });

    // Delete OTP from Redis — single use
    await delRedisKey(OTP_RESET_KEY(email));

    return { message: "Password reset successfully. You can now sign in." };
};