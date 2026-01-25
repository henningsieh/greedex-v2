// src/lib/drizzle/db.ts
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/env";
import * as schema from "@/lib/drizzle/schema";

// Global variable to store the pool across hot reloads
declare global {
  var __pool: Pool | undefined;
}

// Reuse existing pool in development to prevent memory leaks
// SSL Configuration: DATABASE_URL must include ?sslmode=require&uselibpqcompat=true
// for Coolify's "require (secure)" SSL mode. See docs/database/coolify-ssl-connection.md
if (!global.__pool) {
  global.__pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
  });
}

const pool = global.__pool;

export const db: NodePgDatabase<typeof schema> = drizzle(pool, {
  schema,
});
