import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { handle } from "hono/vercel";
import { env } from "@/app/env.mjs";

import {
  getAllHubs,
  getChannelData,
  getHubData,
  sendMessage,
} from "@/app/(modules)/services/chat";
import { db } from "@/app/(modules)/db/db";
import { decodeJwt } from "jose";

// export const runtime = "edge";

const chat = new Hono().basePath("/chat");

chat.use(cors());
chat.use(
  jwt({
    secret: env.ACCESS_TOKEN_SECRET!,
  }),
);

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
    const authorId = decodeJwt(
      c.req.header("Authorization")!.split(" ")[1],
    ).sub!;

    const response = await sendMessage(db, channelId, {
      text,
      authorId,
    });
    return c.json(response, response.error ? response.errorCode : 201);
  },
);

export const GET = handle(chat);
export const POST = handle(chat);
