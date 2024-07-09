import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import { env } from './env.mjs'

const client = process.env.NODE_ENV === "production" ? createClient({
  url: env.DATABASE_TOKEN!,
  authToken: env.DATABASE_URL!,
}) : createClient({
  url: "file:dev.db"
})

export const db = drizzle(client);

