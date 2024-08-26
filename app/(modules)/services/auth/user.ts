import * as jwt from "jose";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";

import { env } from "@/app/env.mjs";
import { AccessTokenGenerationType } from "./tokens";
import * as schema from "@/app/(modules)/db/schema";
import { userTable } from "@/app/(modules)/db/schema";

export async function updateUserDetails(
  db: LibSQLDatabase<typeof schema>,
  loginToken: string,
  newDetails: {
    username?: string;
    displayName?: string;
    avatar?: string;
    about?: string;
  },
) {
  let payload: any;
  try {
    payload = (
      await jwt.jwtVerify(
        loginToken,
        new TextEncoder().encode(env.ACCESS_TOKEN_SECRET!),
      )
    ).payload;
  } catch (error) {
    return {
      error: "Invalid login token",
      errorCode: 403,
    };
  }

  if (payload.gen! !== AccessTokenGenerationType.LOGIN) {
    return {
      error: "Invalid login token",
      errorCode: 403,
    };
  }

  const user = await db.query.userTable.findFirst({
    where: eq(schema.userTable.id, payload.sub!),
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
    .where(eq(userTable.id, payload.sub!))
    .returning();

  return {
    message: "User details updated successfully",
    updatedDetails,
  };
}
