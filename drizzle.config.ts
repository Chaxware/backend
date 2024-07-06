import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/schema.ts",
  out: "./drizzle/",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env["DATABASE_URL"]! as string,
    authToken: process.env["DATABASE_TOKEN"]! as string,
  },
} satisfies Config;
