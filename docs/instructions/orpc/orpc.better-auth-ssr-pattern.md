---
applyTo: '**'
---

# Better Auth + oRPC SSR Pattern

This document explains how to integrate Better Auth with oRPC to enable both server-side rendering (SSR) and client-side data fetching with a unified API.

## Why This Pattern Exists

Better Auth provides excellent real-time hooks like `authClient.useSession()`, but these hooks:
- ❌ Cannot be prefetched on the server
- ❌ Cause hydration mismatches when used in server-side Suspense
- ❌ Always show loading states on initial mount
- ✅ Are perfect for client-only interactive components (sidebars, dropdowns)

By wrapping Better Auth calls in oRPC procedures, you get:
- ✅ Server-side prefetching with zero loading states
- ✅ Stable hydration (no SSR/client mismatches)
- ✅ Type-safe API across server and client
- ✅ Works with server-side Suspense boundaries

## Implementation

### Step 1: Define oRPC Context with Headers

Headers are required to access Better Auth session data:

```typescript
// src/lib/orpc/context.ts
import { os } from '@orpc/server'

export const base = os.$context<{ headers: Headers }>()
```

### Step 2: Create Better Auth Procedures

Wrap Better Auth API calls in oRPC procedures:

```typescript
// src/lib/orpc/procedures.ts
import { auth } from "@/lib/better-auth";
import { base } from "@/lib/orpc/context";

/**
 * Get current session using Better Auth
 * Wraps Better Auth's getSession for SSR compatibility
 */
export const getSession = base.handler(async ({ context }) => {
  const session = await auth.api.getSession({
    headers: context.headers,
  });
  return session;
});

/**
 * List user's organizations
 * Wraps Better Auth's listOrganizations for SSR compatibility
 */
export const listOrganizations = base.handler(async ({ context }) => {
  const organizations = await auth.api.listOrganizations({
    headers: context.headers,
  });
  return organizations;
});
```

### Step 3: Add to Router

```typescript
// src/lib/orpc/router.ts
import { getSession } from "@/lib/orpc/procedures";
import { listOrganizations } from "@/components/features/organizations/procedures";

export const router = {
  // Auth namespace for Better Auth procedures
  betterauth: {
    getSession,
  },

  // Organization namespace
  organization: {
    list: listOrganizations,
  },
};
```

### Step 4: Set Up Server-Side Client (SSR Optimization)

Create a server-only client that avoids HTTP overhead during SSR:

```typescript
// src/lib/orpc/client.server.ts
import 'server-only'
import { createRouterClient } from '@orpc/server'
import { router } from './router'

/**
 * Server-side client for SSR optimization
 * Stored in globalThis to avoid bundling server code to client
 */
globalThis.$client = createRouterClient(router, {
  context: async () => ({
    headers: await headers(),
  }),
})
```

**Important:** Import this file early in your app lifecycle:

```typescript
// src/instrumentation.ts
export async function register() {
  await import('./lib/orpc/client.server')
}
```

```typescript
// src/app/layout.tsx
import '../lib/orpc/client.server' // for pre-rendering
```

### Step 5: Create Unified Client

```typescript
// src/lib/orpc/orpc.ts
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { Router } from "@/lib/orpc/router";

declare global {
  var $client: RouterClient<Router> | undefined;
}

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      throw new Error("RPCLink is not allowed on the server side.");
    }
    return `${window.location.origin}/api/rpc`;
  },
});

/**
 * Uses server-side client during SSR if available,
 * falls back to browser client for client-side rendering
 */
export const orpc: RouterClient<Router> =
  globalThis.$client ?? createORPCClient(link);

/**
 * TanStack Query utilities for oRPC
 */
export const orpcQuery = createTanstackQueryUtils(orpc);
```

## Usage Patterns

### ✅ Pattern 1: Server-Side Rendering with Prefetch

Use for components that need SSR and stable hydration:

```typescript
// page.tsx (Server Component)
export default async function DashboardPage() {
  const queryClient = getQueryClient();
  
  // Prefetch all data for client components
  void queryClient.prefetchQuery(orpcQuery.betterauth.getSession.queryOptions());
  void queryClient.prefetchQuery(orpcQuery.organization.list.queryOptions());
  
  return (
    <HydrateClient client={queryClient}>
      <Suspense fallback={<Skeleton />}>
        <DashboardHeader />
      </Suspense>
    </HydrateClient>
  );
}

// DashboardHeader.tsx (Client Component)
"use client";

export function DashboardHeader() {
  // Uses prefetched data - no loading state!
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions()
  );
  
  const { data: organizations } = useSuspenseQuery(
    orpcQuery.organization.list.queryOptions()
  );
  
  return <div>{organizations[0].name}</div>;
}
```

### ✅ Pattern 2: Client-Only Real-Time Updates

Use Better Auth hooks directly for interactive, client-only components:

```typescript
// OrganizationSwitcher.tsx (Client Component)
"use client";

export function OrganizationSwitcher() {
  // Real-time hook - updates automatically
  const { data: session } = authClient.useSession();
  const { data: organizations } = authClient.useListOrganizations();
  
  // This component lives in sidebar, never server-rendered
  // So real-time hooks are perfect here
}
```

## Decision Matrix

| Scenario | Use oRPC Query | Use Better Auth Hook |
|----------|----------------|---------------------|
| Page header showing org name | ✅ Yes | ❌ No |
| Project list page | ✅ Yes | ❌ No |
| Dashboard breadcrumbs | ✅ Yes | ❌ No |
| Server-side Suspense boundary | ✅ Yes | ❌ No |
| User avatar dropdown | ❌ No | ✅ Yes |
| Organization switcher (sidebar) | ❌ No | ✅ Yes |
| Real-time session updates | ❌ No | ✅ Yes |

## Migration Example

### Before (Causes Hydration Issues)

```typescript
"use client";

export function DashboardHeader() {
  // ❌ Real-time hook - not prefetchable
  const { data: session } = authClient.useSession();
  const { data: orgs } = authClient.useListOrganizations();
  
  // Causes hydration mismatch with server-side Suspense
}
```

### After (SSR Compatible)

```typescript
"use client";

export function DashboardHeader() {
  // ✅ Prefetchable query
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions()
  );
  
  const { data: orgs } = useSuspenseQuery(
    orpcQuery.organization.list.queryOptions()
  );
  
  // Works perfectly with server-side Suspense
}
```

**Don't forget to prefetch in the parent server component!**

## Benefits

### Performance
- **Zero loading states** on initial page load (data in HTML)
- **Faster Time to Interactive** (no client-side waterfall)
- **Better Core Web Vitals** scores

### Developer Experience
- **Type-safe** API across server and client
- **Single source of truth** for data fetching
- **Works with TanStack Query** for caching and refetching

### SEO
- **Data in initial HTML** for search engines
- **No JavaScript required** for initial render

## Common Pitfalls

### ❌ Forgetting to Prefetch

```typescript
// BAD: Using useSuspenseQuery without prefetch
export default function Page() {
  return (
    <Suspense>
      <Component /> {/* Uses useSuspenseQuery but no prefetch! */}
    </Suspense>
  );
}
// Result: Loading state on client, defeats SSR benefits
```

### ❌ Using Better Auth Hooks in Server-Side Suspense

```typescript
// BAD: Server-side Suspense with client-only hook
export default function Layout() {
  return (
    <Suspense> {/* Server-side boundary */}
      <Component /> {/* Uses authClient.useSession() */}
    </Suspense>
  );
}
// Result: Hydration mismatch errors
```

### ❌ Mixing Patterns Incorrectly

```typescript
// BAD: Mix of stable and unstable data sources
const { data: session } = authClient.useSession(); // Unstable!
const { data: projects } = useSuspenseQuery(...); // Stable!
// Result: Hydration mismatch on session-dependent fields
```

## Related Documentation

- [Better Auth Integration](/docs/instructions/better-auth/better-auth.instructions.md)
- [oRPC Installation](/docs/instructions/orpc/orpc.init.installation.md)
- [TanStack Query Integration](/docs/instructions/orpc/orpc.tanstack-query.md)
- [Hydration & Suspense Analysis](/docs/HYDRATION_SUSPENSE_ANALYSIS.md)
