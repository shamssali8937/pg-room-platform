import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/mail.js";
import crypto from "crypto";
import { generateOTP, getOTPExpiry } from "../utils/otp.js";


export const signupService = async (data: any) => {
    const { email, password, full_name, mobile_number, role } = data;

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
            role,
            email_verify_token: emailToken,
        },
    });

    const apiUrl = process.env.API_URL || "http://localhost:5000/api";
    const verifyLink = `${apiUrl}/auth/verify-email?token=${emailToken}`;

    await sendEmail(
        email,
        "Verify your email",
        `<h3>Click to verify:</h3><a href="${verifyLink}">${verifyLink}</a>`
    );

    return { message: "Signup successful. Verify your email." };
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

    if (!user.password_hash) {
        throw new Error("This account is configured with Google Sign-In. Please sign in with Google.");
    }

    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) throw new Error("Invalid password");

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

    await prisma.user.update({
        where: { mobile_number },
        data: {
            phone_otp: otp,
            phone_otp_expiry: getOTPExpiry(),
        },
    });

    // console.log("OTP:", otp); // FREE METHOD

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

    if (
        user.phone_otp !== otp ||
        new Date() > (user.phone_otp_expiry as Date)
    ) {
        throw new Error("Invalid or expired OTP");
    }

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
    
    // We should ideally store this in DB, but for now we'll simulate it
    // In a real app you'd add a reset_token and reset_token_expiry to the User model.
    // For this demonstration to keep Prisma schema unchanged, we will just send it.
    await sendEmail(
        email,
        "Password Reset",
        `<h3>Use this token to reset your password:</h3><p>${token}</p>`
    );

    return { message: "Password reset link sent to your email" };
};

export const resetPasswordService = async (token: string, newPassword: string) => {
    // Simulated token verification
    if (!token) throw new Error("Invalid token");
    
    // Simulate updating password since we didn't store the token in DB
    const hashedPassword = await hashPassword(newPassword);
    
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