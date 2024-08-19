import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

import { env } from "@/app/env.mjs";

export default defineConfig({
  schema: "./app/(modules)/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials:
    process.env.NODE_ENV === "production"
      ? {
          url: env.DATABASE_URL!,
          authToken: env.DATABASE_TOKEN!,
        }
      : {
          url: "http://127.0.0.1:8080",
        },
});
