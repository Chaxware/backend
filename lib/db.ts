import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from './schema'
import { Bindings } from "./utils";


export const dbInstance = (env: Bindings) => {
    // Create the connection
    const connection = createClient({
        url: env.DATABASE_URL,
        authToken: env.DATABASE_TOKEN,
    });
    return drizzle(connection, { schema });
}