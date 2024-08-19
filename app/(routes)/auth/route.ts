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
      email: z.string().email(),
    })
  ),
  async (c) => {
    const { email } = c.req.valid("json");

    const response = await createUser(email);
    return c.json(response, response.error ? response.errorCode : 200);
  }
);

export const GET = handle(auth);
export const POST = handle(auth);
