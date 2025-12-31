import { drizzle } from 'drizzle-orm/libsql/web';
import { createClient } from "@libsql/client";
import * as schema from "./schema";

export function getDb() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    return drizzle(client, { schema });
}

export type Database = ReturnType<typeof getDb>;
export { schema };
