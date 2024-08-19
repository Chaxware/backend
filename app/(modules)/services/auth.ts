import { customRandom, nanoid, random } from "nanoid";

import { db } from "@/app/(modules)/db/db";
import { users, otps } from "@/app/(modules)/db/schema";

export async function createUser(email: string): Promise<any> {
  // TODO: implement error handling when unique constraints and return an error.
  const id = nanoid();
  await db.insert(users).values({
    id,
    email,
    username: nanoid(5),
  });

  const num = customRandom("0123456789", 6, random)();
  await db.insert(otps).values({
    userId: id,
    number: Number(num),
  });
  // TODO: Send user otp via email

  return {
    message: "Email sent, check inbox",
  };
}
