import { createMiddleware } from "hono/factory";
import { setCookie } from "hono/cookie";
import { verifyRequestOrigin } from "lucia";

import { luciaAuth } from "@/app/(modules)/services/auth/lucia";

export const validateSession = () =>
  createMiddleware<{
    Variables: {
      user: {
        id: string;
      };
    };
  }>(async (c, next) => {
    // Verify Origin Headers
    if (c.req.method !== "GET") {
      const originHeader = c.req.header("Origin");
      const hostHeader = c.req.header("Host");

      if (
        !originHeader ||
        !hostHeader ||
        !verifyRequestOrigin(originHeader, [hostHeader])
      ) {
        return c.json({ error: "Invalid Origin headers" }, 403);
      }
    }

    // Check if cookie is attached
    const cookieHeader = c.req.header("Cookie");
    if (!cookieHeader) {
      return c.json({ error: "No cookie attached" }, 401);
    }

    const sessionId = luciaAuth.readSessionCookie(cookieHeader);
    if (!sessionId) {
      return c.json({ error: "Invalid session cookie" }, 401);
    }

    const { session, user } = await luciaAuth.validateSession(sessionId);
    if (!session) {
      const sessionCookie = luciaAuth.createBlankSessionCookie();
      setCookie(
        c,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    } else if (session.fresh) {
      const sessionCookie = luciaAuth.createSessionCookie(session.id);
      setCookie(
        c,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }

    c.set("user", user!);

    await next();
  });

export declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: string;
    };
  }
}
