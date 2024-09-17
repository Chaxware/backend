import { LibSQLDatabase } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";

import * as schema from "@/app/(modules)/db/schema";
import { userTable } from "@/app/(modules)/db/schema";

export async function updateUserDetails(
  db: LibSQLDatabase<typeof schema>,
  userId: string,
  newDetails: {
    username?: string;
    displayName?: string;
    avatar?: string;
    about?: string;
  },
) {
  const user = await db.query.userTable.findFirst({
    where: eq(schema.userTable.id, userId),
  });

  if (!user) {
    return {
      error: "User does not exist",
      errorCode: 403,
    };
  }

  const updatedDetails = await db
    .update(userTable)
    .set({
      username: newDetails.username || user.username,
      displayName: newDetails.displayName || user.displayName,
      avatar: newDetails.avatar || user.avatar,
      about: newDetails.about || user.about,
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, userId))
    .returning();

  return {
    message: "User details updated successfully",
    updatedDetails,
  };
}
