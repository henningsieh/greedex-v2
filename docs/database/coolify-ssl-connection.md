---
applyTo: '**'
description: Configure SSL connections to PostgreSQL databases hosted on Coolify
---

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
| `uselibpqcompat` | `true` | Keeps libpq-compatible semantics so the Coolify "require" URL works even though certificates are not verified. Bun's SQL driver simply forwards this flag to the native client. |

### Why This Works

1. **`sslmode=require`** in the URL tells the PostgreSQL client that SSL is mandatory.
2. Coolify's "require (secure)" connection string also includes `uselibpqcompat=true`, which keeps the connection encrypted while skipping certificate verification (matching the default Coolify experience).
3. Bun's native SQL driver forwards the `sslmode` settings from the connection string, so no extra TLS configuration is needed in the code.

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

The database connection in `src/lib/drizzle/db.ts` now uses Bun's native SQL driver while Drizzle still provides the schema-aware helpers:

```typescript
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { env } from "@/env";
import * as schema from "@/lib/drizzle/schema";

const client = new SQL(env.DATABASE_URL);
export const db = drizzle({ client, schema });
```

Bun's `SQL` client handles TLS internally and simply honors the `sslmode=require` connection string, so we do not need to manage `rejectUnauthorized` or any additional `pg` options.

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
1. `sslmode=require` is in the URL but `uselibpqcompat=true` is missing
2. The connection tries to verify certificates but no CA cert is provided

**Solution**: Add `&uselibpqcompat=true` to your DATABASE_URL so Bun SQL can safely skip certificate verification in Coolify's "require" mode.

### "Hostname/IP does not match certificate's altnames"

This error occurs when:
1. Certificate verification is enabled (`rejectUnauthorized: true`)
2. The certificate's hostname doesn't match the connection hostname

**Solution**: Bun SQL follows the same `sslmode` semantics as libpq. For "require", use `uselibpqcompat=true` to keep the connection encrypted while skipping hostname verification.

### Connection works without SSL

If non-SSL connections succeed, verify:
1. Coolify database has SSL enabled in settings
2. You're using the SSL-enabled connection URL from Coolify

## References

- [Coolify Database SSL Documentation](https://coolify.io/docs/databases/ssl)
- [Bun SQL API](https://bun.sh/docs/api/sql)
- [Drizzle <> Bun SQL Guide](https://orm.drizzle.team/docs/connect-bun-sql)
