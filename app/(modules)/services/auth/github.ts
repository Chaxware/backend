import { GitHub, OAuth2RequestError, generateState } from "arctic";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { and, eq } from "drizzle-orm";

import { env } from "@/app/env.mjs";
import * as schema from "@/app/(modules)/db/schema";
import { oauthAccountTable, userTable } from "@/app/(modules)/db/schema";
import { luciaAuth } from "./lucia";

export const githubAuth = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
);

export async function generateGitHubAuthorizationUrl() {
  const state = generateState();
  const url = await githubAuth.createAuthorizationURL(state);

  return {
    status: 302,
    headers: {
      Location: url.toString(),
    },
    cookie: {
      name: "github_oauth_state",
      value: state,
      attributes: {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 600, // 10 min
        path: "/",
      },
    },
  };
}

export async function authenticateGitHub(
  db: LibSQLDatabase<typeof schema>,
  stateCookie: string,
  state: string,
  code: string,
) {
  // Verify state
  if (!stateCookie || !state || !code || stateCookie !== state) {
    return {
      body: {
        error: "Invalid state",
      },
      status: 400,
    };
  }

  try {
    const tokens = await githubAuth.validateAuthorizationCode(code);

    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      credentials: "include",
    });
    const githubUserResult = await githubUserResponse.json();

    // Check if OAuth account already exists
    let githubAccount: any = await db.query.oauthAccountTable.findFirst({
      where: and(
        eq(oauthAccountTable.provider, "github"),
        eq(oauthAccountTable.providerUserId, githubUserResult.id),
      ),
    });

    // Create new user
    if (!githubAccount) {
      // TODO: Check for unique username
      const [user]: any = await db
        .insert(userTable)
        .values({
          username: githubUserResult.login,
          verified: true,
        })
        .returning();

      [githubAccount] = await db
        .insert(oauthAccountTable)
        .values({
          provider: "github",
          providerUserId: githubUserResult.id,
          userId: user.id,
        })
        .returning();
      console.log(githubAccount.userId);
    }

    const session = await luciaAuth.createSession(githubAccount.userId, {});
    const sessionCookie = luciaAuth.createSessionCookie(session.id);
    return {
      body: {
        success: true,
        message: "GitHub OAuth login successful!",
        userId: githubAccount.userId,
      },
      headers: {
        Location: env.FRONTEND_AUTH_SUCCESS_REDIRECT || "/",
      },
      cookie: sessionCookie,
      status: 302,
    };
  } catch (error) {
    console.error(error);

    if (error instanceof OAuth2RequestError) {
      return {
        body: {
          error: "Failed to verify OAuth request",
        },
        status: 400,
      };
    }

    return {
      body: {},
      status: 500,
    };
  }
}
