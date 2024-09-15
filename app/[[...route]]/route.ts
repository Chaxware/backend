import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

// import {
//   AccessTokenGenerationType,
//   generateAccessToken,
// } from "@/app/(modules)/services/auth/tokens";
// import { zValidator } from "@hono/zod-validator";
// import { z } from "zod";

// export const runtime = "edge";

const app = new Hono();

app.use(cors());

app.get("/", (c) => {
  return c.json({
    message: "Welcome to Chax!",
  });
});

// app.post(
//   "/token",
//   zValidator(
//     "json",
//     z.object({
//       user: z.string(),
//     }),
//   ),
//   async (c) => {
//     const { user } = c.req.valid("json");
//     return c.json({
//       token: await generateAccessToken(user, AccessTokenGenerationType.LOGIN),
//     });
//   },
// );

export const GET = handle(app);
export const POST = handle(app);
