import {
	text,
	sqliteTable as st,
	integer as int,
} from "drizzle-orm/sqlite-core";
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

// relations
// ...

export const messages = st("message", {
	id: idPrimary,
	text: text("text", { length: 5000 }).notNull(),
	// for now we goin to have a global chat with no auth
	// userId: idLike('user_id').notNull(),
	// channelId: idLike('channel_id').notNull(),
	createdAt,
	updatedAt,
});
