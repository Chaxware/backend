import { Hono } from "hono";
import { Bindings } from "../../lib/utils";
import { zValidator } from "@hono/zod-validator";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { z } from "zod";
import { dbInstance } from "../../lib/db";
import { messages } from "../../lib/schema";

const chat = new Hono<{ Bindings: Bindings }>();

// Websocket!
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
  const messages = await db.query.messages.findMany();

  // Using this to avoid accidentally leaking some important data
  const filtered = messages.map((v) => ({
    id: v.id,
    text: v.text,
    createdAt: v.createdAt,
  }));

  return c.json({ messages: filtered });
});

chat.post(
  "/send",
  zValidator(
    "json",
    z.object({
      text: z.string().min(6).max(5000), // Meaningful phrase
    }),
  ),
  async (c) => {
    const { text } = c.req.valid("json");

    const db = dbInstance(c.env);
    await db.insert(messages).values({
      text,
    });

    return c.json({
      success: true,
    });
  },
);

export default chat;

