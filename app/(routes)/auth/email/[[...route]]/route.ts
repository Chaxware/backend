import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { handle } from "hono/vercel";

import { sendOTP, authenticateOTP } from "@/app/(modules)/services/auth/login";
import { db } from "@/app/(modules)/db/db";
import {
  luciaAuth,
  setSessionCookie,
} from "@/app/(modules)/services/auth/lucia";

const mail = new Hono().basePath("/auth/email");

mail.use(async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: c.req.header("Origin")!,
    credentials: true,
  });
  return corsMiddlewareHandler(c, next);
});

mail.post(
  "/",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
    }),
  ),
  async (c) => {
    const { email } = c.req.valid("json");

    const response: any = await sendOTP(db, email);
    return c.json(response, response.error ? response.errorCode : 200);
  },
);

mail.post(
  "/verify",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      otp: z.string(),
    }),
  ),
  async (c) => {
    const { email, otp } = c.req.valid("json");

    const loginResponse: any = await authenticateOTP(db, email, otp);

    // TODO: Add non-browser auth support (without cookies)
    if (loginResponse.session) {
      const sessionCookie = luciaAuth.createSessionCookie(
        loginResponse.session.id,
      );
      setSessionCookie(c, sessionCookie);
    }

    return c.json(
      loginResponse.error
        ? loginResponse
        : {
            success: loginResponse.success,
            message: loginResponse.message,
            userId: loginResponse.userId,
          },
      loginResponse.error ? loginResponse.errorCode : 200,
    );
  },
);

export const GET = handle(mail);
export const POST = handle(mail);
export const PUT = handle(mail);
export const OPTIONS = handle(mail);
