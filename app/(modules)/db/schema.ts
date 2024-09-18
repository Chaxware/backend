import {
  sqliteTable as table,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
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
  email: text("email", { length: 254 }).unique(),
  username: text("username", { length: 32 }).notNull().unique(),
  displayName: text("display_name", { length: 32 }),
  avatar: text("avatar"),
  about: text("about", { length: 1000 }),

  verified: boolean("verified").default(false).notNull(),
  lastSeen: timestamp("last_seen").$defaultFn(() => new Date()),

  createdAt,
  updatedAt,
});

// Handled by Lucia
export const sessionTable = table("session", {
  id: text("id").primaryKey(),
  userId: id("user_id")
    .notNull()
    .references(() => userTable.id),

  expiresAt: integer("expires_at").notNull(),
});

export const oauthAccountTable = table(
  "oauth_account",
  {
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    userId: text("user_id").references(() => userTable.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.provider, table.providerUserId] }),
    };
  },
);

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
  authorId: id("author_id").notNull(),
  channelId: id("channel_id").notNull(),

  createdAt,
  updatedAt,
});

export const otpTable = table("otp", {
  id: idPrimary,
  number: integer("number").notNull(),
  email: text("email", { length: 254 }),

  createdAt,
});

export const refreshTokenTable = table("refresh_token", {
  id: idPrimary,
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
    fields: [messageTable.authorId],
    references: [userTable.id],
  }),
}));
