import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { handle } from "hono/vercel";

import {
  getAllHubs,
  getChannelData,
  getHubData,
  sendMessage,
} from "@/app/(modules)/services/chat";
import { db } from "@/app/(modules)/db/db";
import { validateSession } from "@/app/(modules)/middleware/session";

const chat = new Hono().basePath("/chat");

chat.use(async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: c.req.header("Origin")!,
    credentials: true,
  });
  return corsMiddlewareHandler(c, next);
});
chat.use(validateSession());

// List all hubs
chat.get("/", async (c) => {
  return c.json(await getAllHubs(db));
});

// Hub Information (+ channel list)
chat.get("/:hubId", async (c) => {
  const hubId = c.req.param("hubId");

  const response = await getHubData(db, hubId);
  return c.json(response, response.error ? response.errorCode : 200);
});

// Channel messages
chat.get("/:hubId/:channelId", async (c) => {
  const channelId = c.req.param("channelId");

  const response = await getChannelData(db, channelId);
  return c.json(response, response.error ? response.errorCode : 200);
});

// Send message
chat.post(
  "/:hubId/:channelId",
  zValidator(
    "json",
    z.object({
      text: z.string().min(1).max(5000),
    }),
  ),
  async (c) => {
    const { text } = c.req.valid("json");
    const channelId = c.req.param("channelId");

    const user = c.get("user");

    const response = await sendMessage(db, channelId, {
      text,
      authorId: user.id,
    });
    return c.json(response, response.error ? response.errorCode : 201);
  },
);

export const GET = handle(chat);
export const POST = handle(chat);
export const OPTIONS = handle(chat);
