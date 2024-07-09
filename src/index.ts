import { Hono } from "hono";
import { Bindings } from "../lib/utils";

import auth from "./routers/auth";
import chat from "./routers/chat";

const app = new Hono<{ Bindings: Bindings }>();

app.route("/auth", auth);
app.route("/chat", chat);

app.notFound((c) => {
  return c.json(
    {
      message: "Route not found.",
      error: true,
    },
    404,
  );
});

app.get("/", (c) => {
  return c.json({
    message: "Server is running.",
  });
});

export default app;
