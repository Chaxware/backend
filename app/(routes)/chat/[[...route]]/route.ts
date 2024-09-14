import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
// import { upgradeWebSocket } from "hono/cloudflare-workers";
import { z } from "zod";
import { handle } from "hono/vercel";
import { env } from "@/app/env.mjs";

import {
  getAllHubs,
  getChannelData,
  getHubData,
  sendMessage,
  sendRealtimeMessage,
} from "@/app/(modules)/services/chat";
import { db } from "@/app/(modules)/db/db";

// export const runtime = "edge";

const chat = new Hono().basePath("/chat");

chat.use("*", cors());
chat.use(
  "*",
  jwt({
    secret: env.ACCESS_TOKEN_SECRET!,
  }),
);

// WebSocket!
// chat.get(
//   "/ws",
//   upgradeWebSocket((c) => {
//     return {
//       onMessage(event, ws) {
//         console.log(`Message from client: ${event.data}`);
//         ws.send("Yo, wussup!");
//       },

//       onClose: () => {
//         console.log("Connection closed");
//       },
//     };
//   }),
// );

// Get initial messages
chat.get("/", async (c) => {
  return c.json(await getAllHubs(db));
});

chat.get("/:hubId", async (c) => {
  const hubId = c.req.param("hubId");

  const response = await getHubData(db, hubId);
  return c.json(response, response.error ? response.errorCode : 200);
});

chat.get("/:hubId/:channelId", async (c) => {
  const hubId = c.req.param("hubId");
  const channelId = c.req.param("channelId");

  const response = await getChannelData(db, channelId);
  return c.json(response, response.error ? response.errorCode : 200);
});

chat.post(
  "/:hubId/:channelId",
  zValidator(
    "json",
    z.object({
      text: z.string().min(1).max(5000),
      authorId: z.string(), // Assuming you have user authentication
    }),
  ),
  async (c) => {
    const { text, authorId } = c.req.valid("json");
    const hubId = c.req.param("hubId");
    const channelId = c.req.param("channelId");

    const response = await sendMessage(db, channelId, {
      text,
      authorId,
    });
    return c.json(response, response.error ? response.errorCode : 201);
  },
);

chat.post(
  "/:hubId/:channelId/rt",
  zValidator(
    "json",
    z.object({
      message: z.object({
        text: z.string(),
        authorId: z.string(),
      }),
    }),
  ),
  async (c) => {
    const channelId = c.req.param("channelId");
    const { message } = c.req.valid("json");

    await sendRealtimeMessage(channelId, message);
    return c.json({ message: "Message sent" }, 200);
  },
);

export const GET = handle(chat);
export const POST = handle(chat);
