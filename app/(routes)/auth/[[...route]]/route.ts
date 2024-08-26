import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { handle } from "hono/vercel";

import { db } from "@/app/(modules)/db/db";
import { authenticate, sendOTP } from "@/app/(modules)/services/auth/login";
import { refreshAccessToken } from "@/app/(modules)/services/auth/tokens";

export const runtime = "edge";

const auth = new Hono().basePath("/auth");

auth.use("*", cors());

auth.get("/", async (c) => {
  return c.json({
    message: "Send a POST request bruh...",
  });
});

// auth.post(
//   "/",
//   zValidator(
//     "json",
//     z.object({
//       username: z.string(),
//       email: z.string().email(),
//       displayName: z.string().optional(),
//       avatar: z.string().optional(),
//     })
//   ),
//   async (c) => {
//     const { username, email, displayName, avatar } = c.req.valid("json");

//     const user = {
//       username,
//       email,
//       displayName,
//       avatar,
//     };

//     const response = await createUser(db, user);
//     return c.json(response, response.error ? response.errorCode : 200);
//   }
// );

auth.post(
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

auth.post(
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

    const response: any = await authenticate(db, email, otp);
    return c.json(response, response.error ? response.errorCode : 200);
  },
);

auth.post(
  "/refresh",
  zValidator("json", z.object({ refreshToken: z.string() })),
  async (c) => {
    const { refreshToken } = c.req.valid("json");

    const response: any = await refreshAccessToken(refreshToken);
    return c.json(response, response.error ? response.errorCode : 200);
  },
);

export const GET = handle(auth);
export const POST = handle(auth);
