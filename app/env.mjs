import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

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
    SENDGRID_API_KEY: z
      .string()
      .refine(onProduction, "SENDGRID_API_KEY missing in production."),
    SENDGRID_SENDER_EMAIL: z
      .string()
      .refine(onProduction, "SENDGRID_SENDER_EMAIL missing in production."),
    ACCESS_TOKEN_SECRET: z
      .string()
      .refine(onProduction, "ACCESS_TOKEN_SECRET missing in production."),
  },
});
