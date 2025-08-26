import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as authSchema from "@/db/schema/auth";
import * as categorySchema from "@/db/schema/category";
import * as questionSchema from "@/db/schema/questions";
import * as roomSchema from "@/db/schema/room";

/**
 * Cache the database connection in development
 */
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

const schema = {
  ...authSchema,
  ...categorySchema,
  ...questionSchema,
  ...roomSchema,
};

export const db = drizzle(pool, { schema });
