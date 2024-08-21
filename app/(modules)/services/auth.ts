import { customRandom, nanoid, random } from "nanoid";

import * as schema from "@/app/(modules)/db/schema";
import { userTable } from "@/app/(modules)/db/schema";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";

export interface User {
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
}

export async function createUser(
  db: LibSQLDatabase<typeof schema>,
  user: User
): Promise<any> {
  const emailExists = await db.query.userTable.findFirst({
    where: eq(userTable.email, user.email),
  });
  if (emailExists) {
    return {
      error: "A user with this email already exists",
      errorCode: 400,
    };
  }

  const usernameExists = await db.query.userTable.findFirst({
    where: eq(userTable.username, user.username),
  });
  if (usernameExists) {
    return {
      error: "A user with this username already exists; Try another username",
      errorCode: 400,
    };
  }

  if (!user.displayName) {
    user.displayName = user.username;
  }

  const id = nanoid();
  await db.insert(userTable).values({
    id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
  });

  // const num = customRandom("0123456789", 6, random)();
  // await db.insert(otpTable).values({
  //   userId: id,
  //   number: Number(num),
  // });
  // TODO: Send user otp via email

  return {
    message: "User has been created",
  };
}
