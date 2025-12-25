/**
 * Database SSL Connection Tests
 *
 * These tests verify that the PostgreSQL connection works correctly with SSL
 * when using Coolify's "require (secure)" mode.
 *
 * Coolify SSL Mode: require (secure)
 * - Connection MUST be encrypted
 * - No certificate verification is performed
 *
 * Solution: Use `?sslmode=require&uselibpqcompat=true` in DATABASE_URL
 * - `sslmode=require` - mandatory per Coolify docs
 * - `uselibpqcompat=true` - enables proper libpq semantics in node-postgres
 *   which sets rejectUnauthorized: false for "require" mode (without sslrootcert)
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// These tests require a real database connection
// Skip if DATABASE_URL is not configured properly
const DATABASE_URL = process.env.DATABASE_URL;
const shouldRunTests =
  DATABASE_URL?.includes("sslmode=require") &&
  DATABASE_URL.includes("uselibpqcompat=true");

describe.skipIf(!shouldRunTests)("Database SSL Connection", () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({
      connectionString: DATABASE_URL,
      max: 2,
    });
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  it("should connect to PostgreSQL with SSL using sslmode=require", async () => {
    const result = await pool.query("SELECT current_user, version()");

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].current_user).toBeDefined();
    expect(result.rows[0].version).toContain("PostgreSQL");
  });

  it("should work with Drizzle ORM over SSL connection", async () => {
    const db = drizzle(pool);

    const result = await db.execute("SELECT 1 as test_value");

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty("test_value");
  });

  it("should have correct DATABASE_URL format for Coolify require mode", () => {
    expect(DATABASE_URL).toContain("sslmode=require");
    expect(DATABASE_URL).toContain("uselibpqcompat=true");
    // Should NOT contain sslrootcert for "require" mode (no cert verification)
    expect(DATABASE_URL).not.toContain("sslrootcert");
  });

  it("should be able to execute multiple queries in sequence", async () => {
    const db = drizzle(pool);

    // First query
    const result1 = await db.execute("SELECT current_database() as db_name");
    expect(result1.rows[0]).toHaveProperty("db_name");

    // Second query
    const result2 = await db.execute("SELECT now() as current_time");
    expect(result2.rows[0]).toHaveProperty("current_time");

    // Third query
    const result3 = await db.execute("SELECT pg_is_in_recovery() as is_replica");
    expect(result3.rows[0]).toHaveProperty("is_replica");
  });
});

describe("DATABASE_URL Configuration", () => {
  it("should have DATABASE_URL environment variable set", () => {
    expect(DATABASE_URL).toBeDefined();
    expect(DATABASE_URL).not.toBe("");
  });

  it("should use postgres protocol", () => {
    expect(DATABASE_URL).toMatch(/^postgres(ql)?:\/\//);
  });

  it("should include sslmode=require parameter", () => {
    expect(DATABASE_URL).toContain("sslmode=require");
  });

  it("should include uselibpqcompat=true parameter", () => {
    expect(DATABASE_URL).toContain("uselibpqcompat=true");
  });
});
