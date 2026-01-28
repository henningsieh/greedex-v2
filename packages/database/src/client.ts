/**
 * Database client configuration
 * Handles connection pooling and Drizzle ORM setup
 */
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

// Global variable to store the pool across hot reloads
declare global {
  var __pool: Pool | undefined;
}

// Lazy initialization of the database connection
let _db: NodePgDatabase<typeof schema> | undefined;

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(target, prop) {
    if (!_db) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
      }

      // Reuse existing pool in development to prevent memory leaks
      if (!global.__pool) {
        global.__pool = new Pool({
          connectionString,
          max: 10,
        });
      }

      _db = drizzle(global.__pool, { schema });
    }

    return (_db as any)[prop];
  },
});

/**
 * Create a new database connection with the given connection string
 */
export function createDbConnection(
  connectionString: string,
): NodePgDatabase<typeof schema> {
  const pool = new Pool({
    connectionString,
    max: 10,
  });

  return drizzle(pool, { schema });
}

/**
 * Initialize the database connection (legacy function, kept for compatibility)
 */
export function initializeDb(
  connectionString: string,
): NodePgDatabase<typeof schema> {
  // This function is now a no-op since db is initialized lazily
  return db;
}
