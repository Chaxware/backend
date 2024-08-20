import { eq } from "drizzle-orm";

import { db } from "@/app/(modules)/db/db";
import {
  hubTable,
  channelTable,
  messageTable,
} from "@/app/(modules)/db/schema";

export async function getAllHubs() {
  return { hubs: await db.query.hubTable.findMany() };
}

export async function getHubData(hubId: string): Promise<any> {
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
  hubId: string,
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

  // Check if channel exists AND if the channel belongs to the given hub
  if (!channel || channel.hubId !== hubId) {
    return { error: "Channel not found", errorCode: 404 };
  }

  return channel;
}

export async function sendMessage(
  text: string,
  userId: string,
  channelId: string,
  hubId: string,
): Promise<any> {
  // Check if the hub exists
  const hubExists = await db.query.hubTable.findFirst({
    where: eq(hubTable.id, hubId),
  });
  if (!hubExists) {
    return { error: "Hub not found", errorCode: 404 };
  }

  // Check if the channel exists
  const channelExists = await db.query.channelTable.findFirst({
    where: eq(channelTable.id, channelId),
  });
  if (!channelExists) {
    return { error: "Channel not found", errorCode: 404 };
  }

  // Insert the message into the database
  const message = await db
    .insert(messageTable)
    .values({
      text,
      channelId,
      userId,
      createdAt: new Date(),
    })
    .returning();
  // TODO: Decide whether to add hubId above

  return { success: true, message: message[0] };
  // TODO: Do we need the success property there?
}
