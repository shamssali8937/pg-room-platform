// import express from "express";
import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
dotenv.config();
// import authRoutes from "./routes/auth.routes.js"; // Note the .js extension

// const app = express();
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Verification Routes
app.get("/", (req, res) => {
    res.status(200).json({
        message: "PG Room Platform API is Live",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || "development"
    });
});

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

// Feature Routes
// app.use("/api/auth", authRoutes);

export default app;