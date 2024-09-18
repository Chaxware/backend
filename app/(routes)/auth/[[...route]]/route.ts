import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { handle } from "hono/vercel";

import { db } from "@/app/(modules)/db/db";
import { generateAblyTokenRequest } from "@/app/(modules)/services/auth/tokens";
import { updateUserDetails } from "@/app/(modules)/services/auth/user";
import { validateSession } from "@/app/(modules)/middleware/session";

const auth = new Hono().basePath("/auth");

auth.use(async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: c.req.header("Origin")!,
    credentials: true,
  });
  return corsMiddlewareHandler(c, next);
});

auth.get("/ably", validateSession(), async (c) => {
  const user = c.get("user");

  const response: any = await generateAblyTokenRequest(user.id);
  return c.json(response, response.error ? response.errorCode : 200);
});

auth.put(
  "/update",
  validateSession(),
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

export const GET = handle(auth);
export const POST = handle(auth);
export const PUT = handle(auth);
export const OPTIONS = handle(auth);
