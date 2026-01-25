---
name: "Better Auth Integration"
description: "Authentication patterns, organizations, and oRPC integration"
applyTo: "**/auth/**/*.ts,**/better-auth/**/*.ts,**/middleware.ts"
---

# Better Auth Integration Guide

**Context**: When working with authentication, organizations, or user management features.

---

## Comprehensive Documentation

For detailed configuration options, integration patterns, and examples, **always consult** `/docs/better-auth/` first:

- **Options & Configuration**: [docs/better-auth/better-auth.options.md](../../docs/better-auth/better-auth.options.md) — Complete reference for all Better Auth configuration options
- **Organizations**: [docs/better-auth/better-auth.organizations.md](../../docs/better-auth/better-auth.organizations.md) — Organization features and permissions
- **Credentials (Email/Password)**: [docs/better-auth/better-auth.credentials.email_password.md](../../docs/better-auth/better-auth.credentials.email_password.md) — Email/password authentication setup
- **LastLoginMethod Utility**: [docs/better-auth/better-auth.utility.LastLoginMethod.md](../../docs/better-auth/better-auth.utility.LastLoginMethod.md) — Track user login methods

For oRPC integration patterns, see [docs/orpc/orpc.better-auth.md](../../docs/orpc/orpc.better-auth.md).

---

## Official Resources

- Official docs: https://www.better-auth.com/llms.txt
- Google OAuth and other providers setup instructions available there

---

## Application-Specific Pattern: Better Auth + oRPC SSR

This section contains **repository-specific** instructions for using Better Auth with oRPC in SSR contexts.

### Why This Pattern Exists

The Better Auth client provides client-side hooks (e.g., `authClient.useSession()`), which **cannot** be used in:

- Server components
- Prefetchable Suspense boundaries

**Solution**: This repository wraps Better Auth APIs in oRPC procedures and passes request headers through the oRPC context. This allows:

- Auth data to be **prefetched on the server** (no HTTP calls)
- Client components to consume via **TanStack Query** (hydrated)

### Implementation Example

#### 1. Define oRPC Context with Headers

```typescript
// src/lib/orpc/context.ts
import { os } from "@orpc/server";

export const base = os.$context<{ headers: Headers }>();
```

#### 2. Create Auth Procedures

```typescript
// src/lib/orpc/procedures/auth.ts
import { auth } from "@/lib/better-auth";
import { base } from "../context";

export const getSession = base.handler(async ({ context }) => {
  return await auth.api.getSession({ headers: context.headers });
});

export const listOrganizations = base.handler(async ({ context }) => {
  return await auth.api.listOrganizations({ headers: context.headers });
});
```

#### 3. Register in Router

```typescript
// src/lib/orpc/router.ts
import { os } from "@orpc/server";
import { getSession, listOrganizations } from "./procedures/auth";

export const router = os.router({
  auth: {
    getSession,
    listOrganizations,
  },
  // ... other procedures
});
```

#### 4. Prefetch in Server Component

```typescript
// src/app/[locale]/dashboard/page.tsx
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/tanstack-query/server";
import { orpc } from "@/lib/orpc/orpc";

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  // Prefetch session on server (direct call, no HTTP)
  await queryClient.prefetchQuery({
    queryKey: orpc.auth.getSession.getQueryKey(),
    queryFn: () => orpc.auth.getSession(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  );
}
```

#### 5. Consume in Client Component

```typescript
// src/components/DashboardClient.tsx
"use client";
import { orpc } from "@/lib/orpc/orpc";

export function DashboardClient() {
  const { data: session } = orpc.auth.getSession.useQuery();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

---

## Usage & Decision Guidance

| Scenario                               | Use                                                           |
| -------------------------------------- | ------------------------------------------------------------- |
| **Server-rendered page**               | oRPC + prefetch (see example above)                           |
| **Component inside Suspense**          | oRPC + prefetch                                               |
| **Interactive, client-only component** | Better Auth hooks (`authClient.useSession()`)                 |
| **Middleware (Next.js)**               | Better Auth API directly (`auth.api.getSession({ headers })`) |

---

## Common Tasks

| Task                               | Implementation                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Check if user is authenticated** | Use `orpc.auth.getSession()` in server components or `authClient.useSession()` in client components |
| **Protect a route**                | Add middleware or check session in layout/page                                                      |
| **List user's organizations**      | Use `orpc.auth.listOrganizations()`                                                                 |
| **Track last login method**        | Use `LastLoginMethod` utility (see docs)                                                            |
| **Add OAuth provider**             | Configure in `src/lib/better-auth/auth.ts` (see official docs)                                      |

---

## File Locations

| Purpose                    | Location                             |
| -------------------------- | ------------------------------------ |
| **Better Auth config**     | `src/lib/better-auth/auth.ts`        |
| **Auth procedures (oRPC)** | `src/lib/orpc/procedures/auth.ts`    |
| **HTTP endpoint**          | `src/app/api/auth/[...all]/route.ts` |
| **Middleware**             | `src/middleware.ts`                  |

---

## For More Details

- **Comprehensive Better Auth docs**: `/docs/better-auth/`
- **oRPC integration**: `/docs/orpc/orpc.better-auth.md`
- **TanStack Query SSR**: `/docs/tanstack-react-query/ssr.md`
- **oRPC patterns**: `.github/instructions/orpc.instructions.md`
