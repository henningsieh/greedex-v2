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
 * Get or create the database connection
 * Uses a global pool in development to prevent memory leaks from hot reloads
 *
 * Note: In production builds, this will create a new pool each time
 * unless you pass the same connectionString. The calculator app should
 * use this via its env configuration.
 */
let _db: NodePgDatabase<typeof schema> | undefined;

export function getDb(connectionString: string): NodePgDatabase<typeof schema> {
  if (typeof window !== "undefined") {
    throw new Error("Database client cannot be used in the browser");
  }

  // Reuse existing pool in development to prevent memory leaks
  // SSL Configuration: DATABASE_URL must include ?sslmode=require&uselibpqcompat=true
  // for Coolify's "require (secure)" SSL mode. See docs/database/coolify-ssl-connection.md
  if (!global.__pool) {
    global.__pool = new Pool({
      connectionString,
      max: 10,
    });
  }

  if (!_db) {
    _db = drizzle(global.__pool, { schema });
  }

  return _db;
}

// Export a placeholder db that must be initialized by the consumer
// This will be replaced by the calculator app using its env configuration
export const db = null as unknown as NodePgDatabase<typeof schema>;
