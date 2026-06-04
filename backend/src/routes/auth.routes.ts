import { Router } from "express";
import {
    signup,
    login,
    logout,
    verifyEmail,
    sendPhoneOTP,
    verifyPhoneOTP,
    refreshSession,
    getCsrfToken,
    googleLoginInitiate,
    googleLoginCallback,
} from "../controllers/auth.controller.js";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authRateLimiter, otpRateLimiter } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    sendPhoneOTPSchema,
    verifyPhoneOTPSchema,
} from "../validators/auth.schema.js";

const router: Router = Router();

router.get("/csrf-token", getCsrfToken);
router.post("/refresh", refreshSession);

router.post("/signup", authRateLimiter, validate(signupSchema), signup);
router.post("/login", authRateLimiter, validate(loginSchema), login);
router.post("/logout", authenticate, logout);

// Google OAuth routes
router.get("/google", googleLoginInitiate);
router.get("/google/callback", googleLoginCallback);

router.get("/verify-email", verifyEmail);
router.post("/send-phone-otp", otpRateLimiter, validate(sendPhoneOTPSchema), sendPhoneOTP);
router.post("/verify-phone-otp", validate(verifyPhoneOTPSchema), verifyPhoneOTP);
router.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);

export default router;