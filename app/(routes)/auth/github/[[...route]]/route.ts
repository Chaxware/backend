import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { setCookie, getCookie } from "hono/cookie";
import { serializeCookie } from "oslo/cookie";

import { db } from "@/app/(modules)/db/db";
import {
  authenticateGitHub,
  generateGitHubAuthorizationUrl,
} from "@/app/(modules)/services/auth/github";
import { setSessionCookie } from "@/app/(modules)/services/auth/lucia";
import { env } from "@/app/env.mjs";

const github = new Hono().basePath("/auth/github");

github.use(async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: c.req.header("Origin") || c.req.header("Host")!,
    credentials: true,
  });
  return corsMiddlewareHandler(c, next);
});

github.get("/", async (c) => {
  const response: any = await generateGitHubAuthorizationUrl();

  c.header("Location", response.headers.Location);
  setCookie(
    c,
    response.cookie.name,
    response.cookie.value,
    response.cookie.attributes,
  );

  return c.json({}, response.status);
});

github.get("/callback", async (c) => {
  if (c.req.query("error")) {
    c.header("Location", env.FRONTEND_AUTH_FAILURE_REDIRECT || "/");
    return c.json(
      {
        error: c.req.query("error"),
        errorDescription: c.req.query("error_description"),
        errorUri: c.req.query("error_uri"),
      },
      302,
    );
  }

  const stateCookie = getCookie(c, "github_oauth_state")!;
  const { state, code } = c.req.query();

  const response: any = await authenticateGitHub(db, stateCookie, state, code);

  // TODO: Add non-browser auth support (without cookies)
  if (response.cookie) {
    setSessionCookie(c, response.cookie);
  }

  c.header("Location", response.headers.Location);

  return c.json(response.body, response.status);
});

export const GET = handle(github);
export const POST = handle(github);
export const PUT = handle(github);
export const OPTIONS = handle(github);
