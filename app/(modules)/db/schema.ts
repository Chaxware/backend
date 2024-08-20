import { sqliteTable as table, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// Custom schema types
const timestamp = (name: string) => integer(name, { mode: "timestamp" });

const boolean = (name: string) => integer(name, { mode: "boolean" });

const id = (name: string) => text(name, { length: 21 });

const idPrimary = id("id")
  .notNull()
  .primaryKey()
  .$defaultFn(() => nanoid());

const createdAt = timestamp("created_at")
  .$defaultFn(() => new Date())
  .notNull();

const updatedAt = timestamp("updated_at").$onUpdateFn(() => new Date());

// Tables
export const userTable = table("user", {
  id: idPrimary,
  email: text("email", { length: 200 }).notNull().unique(),
  username: text("username", { length: 30 }).notNull().unique(),

  verified: boolean("verified").default(false).notNull(),
  lastSeen: timestamp("last_seen").$defaultFn(() => new Date()),

  createdAt,
  updatedAt,
});

export const hubTable = table("hub", {
  id: idPrimary,
  name: text("name").notNull(),
  description: text("description").notNull(),

  createdAt,
  updatedAt,
});

export const channelTable = table("channel", {
  id: idPrimary,
  name: text("name").notNull(),
  hubId: id("hub_id").notNull(),

  createdAt,
  updatedAt,
});

export const messageTable = table("message", {
  id: idPrimary,
  text: text("text", { length: 5000 }).notNull(),
  userId: id("user_id").notNull(),
  channelId: id("channel_id").notNull(),

  createdAt,
  updatedAt,
});

export const otpTable = table("otp", {
  id: idPrimary,
  number: integer("number").notNull(),
  userId: id("user_id").notNull(),

  createdAt,
});

// Relations
export const hubRelations = relations(hubTable, ({ many }) => ({
  channels: many(channelTable),
}));

export const channelRelations = relations(channelTable, ({ one, many }) => ({
  hub: one(hubTable, {
    fields: [channelTable.hubId],
    references: [hubTable.id],
  }),
  messages: many(messageTable),
}));

export const messageRelations = relations(messageTable, ({ one }) => ({
  channel: one(channelTable, {
    fields: [messageTable.channelId],
    references: [channelTable.id],
  }),
  user: one(userTable, {
    fields: [messageTable.userId],
    references: [userTable.id],
  }),
}));
