import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { env } from "@/app/env.mjs";

import Ably from "ably";

import {
  hubTable,
  channelTable,
  messageTable,
} from "@/app/(modules)/db/schema";
import * as schema from "@/app/(modules)/db/schema";

export interface Message {
  text: string;
  authorId: string;
}

export async function getAllHubs(db: LibSQLDatabase<typeof schema>) {
  return { hubs: await db.query.hubTable.findMany() };
}

export async function getHubData(
  db: LibSQLDatabase<typeof schema>,
  hubId: string,
): Promise<any> {
  const hub = await db.query.hubTable.findFirst({
    where: eq(hubTable.id, hubId),
    with: {
      channels: true,
    },
  });

  // Check if hub exists
  if (!hub) {
    return {
      error: "Hub not found",
      errorCode: 404,
    };
  }

  return hub;
}

export async function getChannelData(
  db: LibSQLDatabase<typeof schema>,
  channelId: string,
): Promise<any> {
  const channel = await db.query.channelTable.findFirst({
    where: eq(channelTable.id, channelId),
    with: {
      messages: {
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        limit: 50,
      },
    },
  });

  // Check if channel exists
  if (!channel) {
    return { error: "Channel not found", errorCode: 404 };
  }

  return channel;
}

export async function sendMessage(
  db: LibSQLDatabase<typeof schema>,
  channelId: string,
  message: Message,
): Promise<any> {
  // Check if the channel exists
  const channel = await db.query.channelTable.findFirst({
    where: eq(channelTable.id, channelId),
  });
  if (!channel) {
    return { error: "Channel not found", errorCode: 404 };
  }

  const ably = new Ably.Rest({ key: env.ABLY_API_KEY });
  ably.channels.get(channelId).publish("message", message);

  // Insert the message into the database
  const sentMessage = await db
    .insert(messageTable)
    .values({
      text: message.text,
      authorId: message.authorId,
      channelId,
      createdAt: new Date(),
    })
    .returning();

  return { success: true, message: sentMessage[0] };
}
