import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { otps, users } from "../schema";
import { nanoid, customRandom, random } from "nanoid";
import { handle } from "hono/vercel";

export const runtime = "edge";

const auth = new Hono().basePath("/auth");

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
    }),
  ),
  async (c) => {
    // TODO: implement error handling when unique constraints and return an error.
    const { email } = c.req.valid("json");

    const id = nanoid();
    await db.insert(users).values({
      id,
      email,
      username: nanoid(5),
    });

    const num = customRandom("0123456789", 6, random)();

    await db.insert(otps).values({
      userId: id,
      number: Number(num),
    });

    // TODO: Send user otp via email

    return c.json({
      message: "Email sent, check inbox",
    });
  },
);

export const GET = handle(auth);
export const POST = handle(auth);
