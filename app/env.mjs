import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { config } from "dotenv";

config({ path: ".env" });

const onProduction = (x) => {
  const production = process.env.NODE_ENV === "production";
  if (production && typeof x === "undefined") {
    return false;
  }
  return true;
};

export const env = createEnv({
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .optional()
      .refine(onProduction, "DATABASE_URL missing in production."),
    DATABASE_TOKEN: z
      .string()
      .optional()
      .refine(onProduction, "DATABASE_TOKEN missing in production."),
    ABLY_API_KEY: z
      .string()
      .refine(onProduction, "ABLY_API_KEY missing in production"),
    SENDGRID_API_KEY: z
      .string()
      .refine(onProduction, "SENDGRID_API_KEY missing in production."),
    SENDGRID_SENDER_EMAIL: z
      .string()
      .refine(onProduction, "SENDGRID_SENDER_EMAIL missing in production."),
    GITHUB_CLIENT_ID: z
      .string()
      .refine(onProduction, "GITHUB_CLIENT_ID missing in production."),
    GITHUB_CLIENT_SECRET: z
      .string()
      .refine(onProduction, "GITHUB_CLIENT_SECRET missing in production."),
    FRONTEND_AUTH_SUCCESS_REDIRECT: z
      .string()
      .optional()
      .refine(
        onProduction,
        "FRONTEND_AUTH_SUCCESS_REDIRECT missing in production.",
      ),
    FRONTEND_AUTH_FAILURE_REDIRECT: z
      .string()
      .optional()
      .refine(
        onProduction,
        "FRONTEND_AUTH_FAILURE_REDIRECT missing in production.",
      ),
  },
});
