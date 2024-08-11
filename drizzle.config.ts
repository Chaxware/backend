import { config } from "dotenv";

config({ path: ".env" });

import { env } from "@/app/env.mjs";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/schema.ts",
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
