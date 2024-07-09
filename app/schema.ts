

import {
  text,
  sqliteTable as st,
  integer as int,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// some helpers
const timestamp = (n: string) => int(n, { mode: "timestamp" });
const bool = (n: string) => int(n, { mode: "boolean" });

const idLike = (s: string) => text(s, { length: 21 });

const idPrimary = idLike("id")
  .notNull()
  .primaryKey()
  .$defaultFn(() => nanoid());
  
const createdAt = timestamp("created_at")
  .$defaultFn(() => new Date())
  .notNull();

const updatedAt = timestamp("updated_at").$onUpdateFn(() => new Date());

// tables
export const users = st("user", {
  id: idPrimary,
  email: text("email", { length: 200 }).notNull().unique(),
  username: text("username", { length: 30 }).notNull().unique(),
  verified: bool("verified").default(false).notNull(),
  lastSeen: timestamp("last_seen").$defaultFn(() => new Date()),

  createdAt,
  updatedAt,
});

export const otps = st("otp", {
  id: idPrimary,
  number: int("number").notNull(),
  userId: idLike("user_id").notNull(),
  createdAt,
});

export const hubs = st("hub", {
  id: idPrimary,
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt,
  updatedAt,
});

export const channels = st("channel", {
  id: idPrimary,
  name: text("name").notNull(),
  hubId: idLike("hub_id").notNull(),
  createdAt,
  updatedAt,
});

export const messages = st("message", {
  id: idPrimary,
  text: text("text", { length: 5000 }).notNull(),
  channelId: idLike("channel_id").notNull(),
  userId: idLike("user_id").notNull(),
  createdAt,
  updatedAt,
});

export const hubRelations = relations(hubs, ({ many }) => ({
  channels: many(channels),
}));

export const channelRelations = relations(channels, ({ one, many }) => ({
  hub: one(hubs, {
    fields: [channels.hubId],
    references: [hubs.id],
  }),
  messages: many(messages),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));
