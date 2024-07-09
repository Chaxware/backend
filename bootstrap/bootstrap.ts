import { dbInstance } from "../lib/db.js";
import { hubs, channels, messages } from "../lib/schema.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface HubData {
  name: string;
  description: string;
  channels: string[];
}

interface MessageData {
  author: string;
  message: string;
  time_sent: string;
}

async function seedDatabase() {
  const db = dbInstance({
    DATABASE_URL: process.env.DATABASE_URL!,
    DATABASE_TOKEN: process.env.DATABASE_TOKEN!,
  });

  const hubsData: Record<string, HubData> = JSON.parse(
    await fs.readFile(path.join(__dirname, "hubs/hubs.json"), "utf-8"),
  );

  for (const [hubKey, hubData] of Object.entries(hubsData)) {
    const [hub] = await db
      .insert(hubs)
      .values({
        name: hubData.name,
        description: hubData.description,
      })
      .returning();

    console.log("Pushing hub: ", hub);

    for (const channelName of hubData.channels) {
      const [channel] = await db
        .insert(channels)
        .values({
          name: channelName,
          hubId: hub.id,
        })
        .returning();

      console.log("Pushing channel: ", channel);

      try {
        const messagesData: MessageData[] = JSON.parse(
          await fs.readFile(
            path.join(__dirname, `hubs/${hubKey}/${channelName}.json`),
            "utf-8",
          ),
        );

        for (const messageData of messagesData) {
          await db.insert(messages).values({
            text: messageData.message,
            channelId: channel.id,
            userId: messageData.author,
            createdAt: new Date(messageData.time_sent),
          });
        }
      } catch (error) {
        console.error(
          `Error reading messages for ${hubKey}/${channelName}:`,
          error,
        );
      }
    }
  }

  console.log("Database seeded successfully");
}

await seedDatabase().catch(console.error);
