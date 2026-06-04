import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in .env");
}

// PrismaNeon acts as the serverless-safe connection adapter for Neon.
// It handles connection pooling and prevents exhausting DB connections on cold starts.
const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
    adapter,
    // Only log warnings + errors in dev; only errors in production to reduce overhead
    log: process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
});