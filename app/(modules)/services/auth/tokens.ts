import Ably from "ably";

import { env } from "@/app/env.mjs";

export async function generateAblyTokenRequest(userId: string) {
  const ably = new Ably.Rest({ key: env.ABLY_API_KEY });
  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: userId,
  });

  return tokenRequest;
}
