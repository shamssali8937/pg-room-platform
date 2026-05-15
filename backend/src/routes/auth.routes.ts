import { Router } from "express";
import {
    signup,
    login,
    logout,
    verifyEmail,
    sendPhoneOTP,
    verifyPhoneOTP,
} from "../controllers/auth.controller.js";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authRateLimiter, otpRateLimiter } from "../middleware/rateLimit.middleware.js";

const router: Router = Router();

router.post("/signup", authRateLimiter, signup);
router.post("/login", authRateLimiter, login);
router.post("/logout", authenticate, logout);

router.get("/verify-email", verifyEmail);
router.post("/send-phone-otp", otpRateLimiter, sendPhoneOTP);
router.post("/verify-phone-otp", verifyPhoneOTP);
router.post("/forgot-password", authRateLimiter, authController.forgotPassword);
router.post("/reset-password", authRateLimiter, authController.resetPassword);

export default router;