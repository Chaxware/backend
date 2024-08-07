import { Hono } from "hono";
import { Bindings } from "../../lib/utils";
import { zValidator } from "@hono/zod-validator";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { z } from "zod";
import { dbInstance } from "../../lib/db";
import { eq } from "drizzle-orm";
import { hubs, channels, messages } from "../../lib/schema";

const chat = new Hono<{ Bindings: Bindings }>();

// WebSocket!
chat.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`);
        ws.send("Yo, wussup!");
      },

      onClose: () => {
        console.log("Connection closed");
      },
    };
  }),
);

// Get initial messages
chat.get("/", async (c) => {
  const db = dbInstance(c.env);
  const allHubs = await db.query.hubs.findMany({
    with: {
      channels: true,
    },
  });
  return c.json({ hubs: allHubs });
});

chat.get("/:hubId", async (c) => {
  const db = dbInstance(c.env);
  const hubId = c.req.param("hubId");
  const hub = await db.query.hubs.findFirst({
    where: eq(hubs.id, hubId),
    with: {
      channels: true,
    },
  });
  if (!hub) {
    return c.json({ error: "Hub not found" }, 404);
  }
  return c.json(hub);
});

chat.get("/:hubId/:channelId", async (c) => {
  const db = dbInstance(c.env);
  const hubId = c.req.param("hubId");
  const channelId = c.req.param("channelId");

  const channel = await db.query.channels.findFirst({
    where: eq(channels.id, channelId),
    with: {
      messages: {
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        limit: 50,
      },
    },
  });

  if (!channel || channel.hubId !== hubId) {
    return c.json({ error: "Channel not found" }, 404);
  }

  return c.json(channel);
});

chat.post(
  "/:hubId/:channelId",
  zValidator(
    "json",
    z.object({
      text: z.string().min(1).max(5000),
      userId: z.string(), // Assuming you have user authentication
    }),
  ),
  async (c) => {
    const { text, userId } = c.req.valid("json");

    const hubId = c.req.param("hubId");
    const channelId = c.req.param("channelId");

    const db = dbInstance(c.env);

    // Check if the hub exists
    const hubExists = await db.query.hubs.findFirst({
      where: eq(hubs.id, hubId),
    });
    if (!hubExists) {
      return c.json({ error: "Hub not found" }, 404);
    }

    // Check if the channel exists
    const channelExists = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
    });
    if (!channelExists) {
      return c.json({ error: "Channel not found" }, 404);
    }

    // Insert the message into the database
    const message = await db
      .insert(messages)
      .values({
        text,
        channelId,
        userId,
        createdAt: new Date(),
      })
      .returning();

    return c.json({
      success: true,
      message: message[0], // Returning the inserted message data
    });
  },
);

export default chat;
