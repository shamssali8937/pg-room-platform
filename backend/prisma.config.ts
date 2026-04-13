// import "dotenv/config";
// import { defineConfig, env } from "prisma/config";

// console.log("DIRECT_URL:", process.env.DIRECT_URL); // remove after testing

// export default defineConfig({
//   schema: "./prisma/schema.prisma",
//   migrations: { path: "prisma/migrations" },
//   datasource: { url: env("DIRECT_URL") },
// });

// import "dotenv/config";
// import { defineConfig } from "@prisma/config";

// export default defineConfig({
//   schema: "./prisma/schema.prisma",
//   datasource: {
//     url: process.env.DIRECT_URL as string,
//   },
// });



import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: env("DATABASE_URL"),
  },
});