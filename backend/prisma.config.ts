import "dotenv/config";
import { defineConfig, env } from "prisma/config";

console.log("DIRECT_URL:", process.env.DIRECT_URL); // remove after testing

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DIRECT_URL") },
});