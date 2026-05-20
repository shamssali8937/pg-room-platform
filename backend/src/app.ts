import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// ─── Config ──────────────────────────────────────────────
dotenv.config();

// ─── Logger (must be imported before routes so it's initialized) ──
import { logger } from "./config/logger.js";

// ─── Middleware ──────────────────────────────────────────
import { requestIdMiddleware } from "./middleware/requestId.middleware.js";
import { httpLogger } from "./middleware/httpLogger.middleware.js";
import { performanceMonitor } from "./middleware/performance.middleware.js";
import { globalRateLimiter } from "./middleware/rateLimit.middleware.js";
import {
    globalErrorHandler,
    notFoundHandler,
} from "./middleware/errorHandler.middleware.js";
import { csrfSynchronisedProtection } from "./config/csrf.js";

// ─── Routes ──────────────────────────────────────────────
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import roomRoutes from "./routes/room.routes.js";
import healthRoutes from "./routes/health.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ownerRoutes from "./routes/owner.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import reportRoutes from "./routes/report.routes.js";

// ─── App ─────────────────────────────────────────────────
const app: Application = express();

// ─── Security Headers ─────────────────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// ─── CORS ─────────────────────────────────────────────────
const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ?? "http://localhost:3000"
).split(",").map((o) => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, Postman)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                logger.warn(`CORS blocked origin: ${origin}`);
                callback(new Error(`CORS policy: origin ${origin} not allowed`));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Request-ID",
            "x-csrf-token",
        ],
        exposedHeaders: ["X-Request-ID"],
    })
);

// ─── Request ID (must be before http logger) ──────────────
app.use(requestIdMiddleware);

// ─── HTTP Request Logger ──────────────────────────────────
app.use(httpLogger);

// ─── Performance Monitor ──────────────────────────────────
app.use(performanceMonitor);

// ─── Body Parsers & Cookies ───────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.JWT_SECRET));

// ─── Health Routes (exempt from rate limiting) ────────────
app.use("/health", healthRoutes);

// ─── Global Rate Limiter for all API routes ───────────────
app.use("/api", globalRateLimiter);

// ─── Global CSRF Protection ────────────────────────────────
app.use("/api", csrfSynchronisedProtection);

// ─── API Routes ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", reviewRoutes);
app.use("/api", reportRoutes);

// ─── Root ─────────────────────────────────────────────────
app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "PG Room Platform API",
        version: process.env.npm_package_version ?? "1.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV ?? "development",
        docs: "/health/detailed",
    });
});

// ─── 404 Handler ─────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ─────────────────────────────────
app.use(globalErrorHandler);

export default app;