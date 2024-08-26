import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import * as jwt from "jose";

import { refreshTokenTable } from "@/app/(modules)/db/schema";
import { env } from "@/app/env.mjs";
import { db } from "@/app/(modules)/db/db";

export enum AccessTokenGenerationType {
  LOGIN = "LOGIN",
  REFRESH = "REFRESH",
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: any;
  try {
    payload = (
      await jwt.jwtVerify(
        refreshToken,
        new TextEncoder().encode(env.REFRESH_TOKEN_SECRET!),
      )
    ).payload;
  } catch (error) {
    return {
      error: "Invalid refresh token",
      errorCode: 403,
    };
  }

  const tokenEntry = await db.query.refreshTokenTable.findFirst({
    where: eq(refreshTokenTable.id, payload.jti!),
  });

  if (!tokenEntry) {
    return {
      error: "Invalid refresh token",
      errorCode: 403,
    };
  }

  return {
    message: "New access token generated",
    accessToken: await generateAccessToken(
      payload.sub!,
      AccessTokenGenerationType.REFRESH,
    ),
  };
}

export async function generateAccessToken(
  userId: string,
  generationType: AccessTokenGenerationType,
) {
  const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET!);
  const token = await new jwt.SignJWT({ gen: generationType })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setExpirationTime("10m")
    .sign(secret);
  return token;
}

export async function generateRefreshToken(userId: string) {
  const tokenId = nanoid();

  const secret = new TextEncoder().encode(env.REFRESH_TOKEN_SECRET!);
  const token = await new jwt.SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setJti(tokenId)
    .setSubject(userId)
    .setExpirationTime("4w")
    .sign(secret);

  await db.insert(refreshTokenTable).values({
    id: tokenId,
  });

  return token;
}
