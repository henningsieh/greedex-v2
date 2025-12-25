# Database SSL Connection with Coolify

This document explains how to configure SSL connections to PostgreSQL databases hosted on Coolify.

## Overview

Coolify supports several SSL modes for PostgreSQL connections. This project uses the **"require (secure)"** mode, which:
- **Encrypts** all data in transit
- **Does NOT perform certificate verification** (no CA cert needed)

## Solution

### DATABASE_URL Format

```
postgres://user:password@host:port/database?sslmode=require&uselibpqcompat=true
```

### Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `sslmode` | `require` | **Mandatory** per Coolify docs. Ensures connection is encrypted. |
| `uselibpqcompat` | `true` | Enables libpq-compatible semantics in `node-postgres`. For `sslmode=require` without `sslrootcert`, this sets `rejectUnauthorized: false`. |

### Why This Works

1. **`sslmode=require`** in the URL tells the PostgreSQL client that SSL is mandatory
2. **`uselibpqcompat=true`** activates the new libpq compatibility mode in `pg-connection-string`
3. When `sslmode=require` is used **without** `sslrootcert`, the libpq compat mode sets `rejectUnauthorized: false`
4. This matches Coolify's "require (secure)" behavior: encrypted connection, no certificate verification

## Coolify SSL Modes Reference

| Mode | Security | Certificate Verification | Use Case |
|------|----------|--------------------------|----------|
| `allow` | Insecure | None | Not recommended |
| `prefer` | Partial | None | Fallback to non-SSL if unavailable |
| `require` | Secure | None | **This project** - Encrypted, no cert check |
| `verify-ca` | Secure | CA only | Verify cert is signed by trusted CA |
| `verify-full` | Most Secure | CA + hostname | Full verification (recommended for production) |

## Code Usage

### Drizzle ORM (db.ts)

The database connection in `src/lib/drizzle/db.ts` reads the `DATABASE_URL` from environment:

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env";

const pool = new Pool({
  connectionString: env.DATABASE_URL, // Includes ?sslmode=require&uselibpqcompat=true
  max: 10,
});

export const db = drizzle(pool, { schema });
```

No additional SSL configuration is needed in code - it's all in the DATABASE_URL.

### Environment Variable

```env
# .env
DATABASE_URL=postgres://user:pass@host:port/db?sslmode=require&uselibpqcompat=true
```

## Testing

Run the SSL connection tests:

```bash
bun run test src/__tests__/db-ssl-connection.test.ts
```

The tests verify:
- SSL connection works with `sslmode=require`
- Drizzle ORM functions over SSL
- DATABASE_URL has correct format

## Troubleshooting

### "unable to verify the first certificate"

This error occurs when:
- `sslmode=require` is in URL but `uselibpqcompat=true` is missing
- The connection tries to verify certificates but no CA cert is provided

**Solution**: Add `&uselibpqcompat=true` to your DATABASE_URL

### "Hostname/IP does not match certificate's altnames"

This error occurs when:
- Certificate verification is enabled (`rejectUnauthorized: true`)
- The certificate's hostname doesn't match the connection hostname

**Solution**: For "require" mode, use `uselibpqcompat=true` which disables cert verification

### Connection works without SSL

If non-SSL connections succeed, verify:
1. Coolify database has SSL enabled in settings
2. You're using the SSL-enabled connection URL from Coolify

## References

- [Coolify Database SSL Documentation](https://coolify.io/docs/databases/ssl)
- [node-postgres SSL Documentation](https://node-postgres.com/features/ssl)
- [pg-connection-string libpq compat PR](https://github.com/brianc/node-postgres/pull/2709)
