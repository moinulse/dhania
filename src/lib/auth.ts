import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

export function createAuth(db: D1Database) {
    const drizzleDb = drizzle(db, { schema });

    return betterAuth({
        database: drizzleAdapter(drizzleDb, {
            provider: "sqlite",
            schema: {
                user: schema.user,
                session: schema.session,
                account: schema.account,
                verification: schema.verification,
            },
        }),
        emailAndPassword: {
            enabled: true,
        },
        session: {
            expiresIn: 60 * 60 * 24 * 7, // 7 days
            updateAge: 60 * 60 * 24, // 1 day
            cookieCache: {
                enabled: true,
                maxAge: 5 * 60, // 5 minutes
            },
        },
        user: {
            additionalFields: {
                systemRole: {
                    type: "string",
                    required: false,
                    defaultValue: "user",
                    input: false,
                },
                avatarUrl: {
                    type: "string",
                    required: false,
                    input: true,
                },
            },
        },
    });
}

export type Auth = ReturnType<typeof createAuth>;
