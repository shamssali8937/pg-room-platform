// import express from "express";
import { Router } from "express";
import { signup, login, logout, verifyEmail, sendPhoneOTP, verifyPhoneOTP } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

// const router = express.Router();
const router: Router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authenticate, logout);

router.get("/verify-email", verifyEmail);
router.post("/send-phone-otp", sendPhoneOTP);
router.post("/verify-phone-otp", verifyPhoneOTP);


export default router;