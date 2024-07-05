export type Bindings = {
  DATABASE_URL: string;
  DATABASE_TOKEN: string;
};

// import { rateLimiter } from "hono-rate-limiter";

// export const limiter = rateLimiter({
// 	windowMs: 15 * 60 * 1000, // 15 minutes
// 	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
// 	standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
// 	keyGenerator: (c) => c.req.header('cf-connecting-ip') ?? "<noid>", // Method to generate custom identifiers for clients.
// })
// TODO: implement limiter with @elithrar's package.
