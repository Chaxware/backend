import { customRandom, nanoid, random } from "nanoid";

import { db } from "@/app/(modules)/db/db";
import { userTable, otpTable } from "@/app/(modules)/db/schema";
import { eq } from "drizzle-orm";

export async function createUser(
  username: string,
  email: string,
  displayName?: string,
  avatar?: string
): Promise<any> {
  const emailExists = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });
  if (emailExists) {
    return {
      error: "A user with this email already exists",
      errorCode: 400,
    };
  }

  const usernameExists = await db.query.userTable.findFirst({
    where: eq(userTable.username, username),
  });
  if (usernameExists) {
    return {
      error: "A user with this username already exists; Try another username",
      errorCode: 400,
    };
  }

  if (!displayName) {
    displayName = username;
  }

  const id = nanoid();
  await db.insert(userTable).values({
    id,
    email,
    username,
    displayName,
    avatar,
  });

  const num = customRandom("0123456789", 6, random)();
  await db.insert(otpTable).values({
    userId: id,
    number: Number(num),
  });
  // TODO: Send user otp via email

  return {
    message: "User has been created",
  };
}
