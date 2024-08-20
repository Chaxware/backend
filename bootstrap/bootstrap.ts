import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { db } from "@/app/(modules)/db/db";
import {
  hubTable,
  channelTable,
  messageTable,
} from "@/app/(modules)/db/schema";

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
  const hubExists = (await db.query.hubTable.findFirst()) !== undefined;
  if (hubExists) {
    console.error("Error: Trying to bootstrap non-empty database");
    return;
  }

  console.log("Filling database with sample data");

  const hubsData: Record<string, HubData> = JSON.parse(
    await fs.readFile(path.join(__dirname, "hubs/hubs.json"), "utf-8"),
  );

  for (const [hubKey, hubData] of Object.entries(hubsData)) {
    const [hub] = await db
      .insert(hubTable)
      .values({
        name: hubData.name,
        description: hubData.description,
      })
      .returning();

    console.log("Pushing hub: ", hub);

    for (const channelName of hubData.channels) {
      const [channel] = await db
        .insert(channelTable)
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
          await db.insert(messageTable).values({
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

seedDatabase().catch(console.error);
