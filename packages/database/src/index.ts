/**
 * @greendex/database
 * Drizzle ORM setup and database client
 */

// Export database client
export { db, createDbConnection } from "./client";

// Export all schemas
export * from "./schema";

// Export types
export type { NodePgDatabase } from "drizzle-orm/node-postgres";
