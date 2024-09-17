import { Hono } from "hono";
import { cors } from "hono/cors";
import { setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { handle } from "hono/vercel";

import { db } from "@/app/(modules)/db/db";
import { authenticateOTP, sendOTP } from "@/app/(modules)/services/auth/login";
import { generateAblyTokenRequest } from "@/app/(modules)/services/auth/tokens";
import { updateUserDetails } from "@/app/(modules)/services/auth/user";
import { luciaAuth } from "@/app/(modules)/services/auth/lucia";
import { validateSession } from "@/app/(modules)/middleware/session";

const auth = new Hono().basePath("/auth");

auth.use(async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: c.req.header("Origin")!,
    credentials: true,
  });
  return corsMiddlewareHandler(c, next);
});

auth.get("/", async (c) => {
  return c.json({
    message: "Send a POST request bruh...",
  });
});

auth.post(
  "/email",
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

auth.post(
  "/email/verify",
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
      setCookie(c, sessionCookie.name, sessionCookie.value, {
        ...sessionCookie.attributes,
        sameSite: "None",
        secure: true,
        partitioned: true,
      });
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

auth.put(
  "/update",
  zValidator(
    "json",
    z.object({
      username: z.string().max(32).optional(),
      displayName: z.string().max(32).optional(),
      avatar: z.string().url().optional(),
      about: z.string().max(1000).optional(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const { username, displayName, avatar, about } = c.req.valid("json");

    const response: any = await updateUserDetails(db, user.id, {
      username,
      displayName,
      avatar,
      about,
    });
    return c.json(response, response.error ? response.errorCode : 200);
  },
);

auth.get("/ably", validateSession(), async (c) => {
  const user = c.get("user");

  const response: any = await generateAblyTokenRequest(user.id);
  return c.json(response, response.error ? response.errorCode : 200);
});

export const GET = handle(auth);
export const POST = handle(auth);
export const PUT = handle(auth);
