import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
// import { setCookie } from "hono/cookie";

// import { luciaAuth } from "@/app/(modules)/services/auth/lucia";

const app = new Hono();

app.use(async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: c.req.header("Origin")!,
    credentials: true,
  });
  return corsMiddlewareHandler(c, next);
});

app.get("/", (c) => {
  return c.json({
    message: "Welcome to Chax!",
  });
});

// app.get("/session", async (c) => {
//   const sessionId = "jkwknjwlbg4ey4ae2osl6q6kjbqdnsky65azltu2";
//   const { session } = await luciaAuth.validateSession(sessionId);
//   const sessionCookie = luciaAuth.createSessionCookie(session!.id);
//
//   setCookie(c, sessionCookie.name, sessionCookie.value, {
//     ...sessionCookie.attributes,
//     sameSite: "None",
//     secure: true,
//     partitioned: true,
//   });
//
//   return c.json({
//     message: "Cookie set",
//   });
// });

export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);
