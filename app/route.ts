import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    message: "Welcome to Chax!",
  });
});

export const GET = handle(app);
export const POST = handle(app);
