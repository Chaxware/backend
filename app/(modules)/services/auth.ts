import { customRandom, nanoid, random } from "nanoid";

import { db } from "@/app/(modules)/db/db";
import { users, otps } from "@/app/(modules)/db/schema";
import { eq } from "drizzle-orm";

export async function createUser(username: string, email: string) : Promise<any> {
  const emailExists = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (emailExists) {
    return {
      error: "A user with this email already exists",
      errorCode: 400,
    }
  }

  const usernameExists = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  if (usernameExists) {
    return {
      error: "A user with this username already exists; Try another username",
      errorCode: 400,
    }
  }

  const id = nanoid();
  await db.insert(users).values({
    id,
    email,
    username,
  });

  const num = customRandom("0123456789", 6, random)();
  await db.insert(otps).values({
    userId: id,
    number: Number(num),
  });
  // TODO: Send user otp via email

  return {
    message: "An OTP has been sent to your email; Check your inbox",
  };
}
