import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { handle } from "hono/vercel";

import { createUser } from "@/app/(modules)/services/auth";

export const runtime = "edge";

const auth = new Hono().basePath("/auth");

auth.use("*", cors());

auth.get("/", async (c) => {
  return c.json({
    message: "Send a POST request bruh...",
  });
});

auth.post(
  "/",
  zValidator(
    "json",
    z.object({
      username: z.string(),
      email: z.string().email(),
      displayName: z.string().optional(),
      avatar: z.string().optional(),
    })
  ),
  async (c) => {
    const { username, email, displayName, avatar } = c.req.valid("json");

    const response = await createUser(username, email, displayName, avatar);
    return c.json(response, response.error ? response.errorCode : 200);
  }
);

export const GET = handle(auth);
export const POST = handle(auth);
