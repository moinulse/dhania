import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const timestamps = {
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}

export const id = text("id").primaryKey().$defaultFn(() => createId());
