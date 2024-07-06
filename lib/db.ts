import * as schema from "./schema.js";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { Bindings } from "./utils.js";

export const dbInstance = (env: Bindings): LibSQLDatabase<typeof schema> => {
  const url = env.DATABASE_URL?.trim();
  if (url === undefined) {
    throw new Error("DATABASE_URL is not defined");
  }

  const authToken = env.DATABASE_TOKEN?.trim();
  if (authToken === undefined) {
    if (!url.includes("file:")) {
      throw new Error("DATABASE_TOKEN is not defined");
    }
  }

  // Create the connection
  const connection = createClient({
    url,
    authToken,
  });
  return drizzle(connection, { schema });
};
