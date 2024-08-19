import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import { env } from "@/app/env.mjs";
import * as schema from "./schema";

const client =
  process.env.NODE_ENV === "production"
    ? createClient({
        url: env.DATABASE_URL!,
        authToken: env.DATABASE_TOKEN!,
      })
    : createClient({
        url: "http://127.0.0.1:8080",
      });

export const db = drizzle(client, { schema });
