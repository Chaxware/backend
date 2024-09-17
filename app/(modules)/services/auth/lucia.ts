import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";

import { userTable, sessionTable } from "@/app/(modules)/db/schema";
import { db } from "@/app/(modules)/db/db";

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

export const luciaAuth = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },

  // getUserAttributes: (attributes) => {
  //   return {
  //     email: attributes.email,
  //     username: attributes.username,
  //     displayName: attributes.displayName,
  //     avatar: attributes.avatar,
  //     about: attributes.about,
  //
  //     verified: attributes.verified,
  //
  //     lastSeen: attributes.lastSeen,
  //     createdAt: attributes.createdAt,
  //     updatedAt: attributes.updatedAt,
  //   };
  // },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof Lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  // email: string;
  // username: string;
  // displayName: string;
  // avatar: string;
  // about: string;
  //
  // verified: boolean;
  //
  // lastSeen: Date;
  // createdAt: Date;
  // updatedAt: Date;
}
