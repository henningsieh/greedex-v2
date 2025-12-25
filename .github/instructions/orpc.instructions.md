---
applyTo: '**'
---

# oRPC Instructions

This file provides an overview of available oRPC documentation. For detailed instructions, refer to the files in `/docs/orpc/`.

## Getting Started
- **Installation and Setup**: Basic oRPC installation, configuration, and initial setup.
  - See: [docs/orpc/orpc.init.installation.md](../../docs/orpc/orpc.init.installation.md)

## Core Concepts
- **Procedures**: Defining and using oRPC procedures, input/output validation, middleware.
  - See: [docs/orpc/orpc.procedure.md](../../docs/orpc/orpc.procedure.md)
- **Routers**: Creating and extending routers, lazy loading, utilities.
  - See: [docs/orpc/orpc.router.md](../../docs/orpc/orpc.router.md)

## Integrations
- **Next.js Adapter**: Setting up oRPC with Next.js, including server-side rendering optimization.
  - See: [docs/orpc/orpcNextjs.adapter.md](../../docs/orpc/orpcNextjs.adapter.md)
- **Better Auth Integration**: Using Better Auth for authentication in oRPC procedures.
  - See: [docs/orpc/orpc.better-auth.md](../../docs/orpc/orpc.better-auth.md)
- **TanStack Query Integration**: Integrating oRPC with TanStack Query for data fetching.
  - See: [docs/orpc/orpc.tanstack-query.md](../../docs/orpc/orpc.tanstack-query.md)

## Advanced Topics
- **SSR Optimization**: Optimizing SSR performance by avoiding redundant network calls.
  - See: [docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md](../../docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md)
- **oRPC + TanStack Query Prefetching & Hydration**: Combined patterns for SSR prefetching.
  - See: [oRPC + TanStack Query Integration](#orpc--tanstack-query-prefetching--hydration)
- **Better Auth SSR Pattern**: Patterns for using Better Auth with oRPC in SSR contexts.
  - See: [.github/instructions/better-auth.instructions.md](../../.github/instructions/better-auth.instructions.md)

## Implementation Details (This Repository)
- **oRPC README**: Full implementation documentation for this app's oRPC setup.
  - See: [src/lib/orpc/README.md](../../src/lib/orpc/README.md)

For the latest documentation, have a deep look into the official oRPC docs in `/docs/orpc/`.

---

# oRPC + TanStack Query: Prefetching & Hydration

This section explains the combined oRPC + TanStack Query setup for SSR prefetching and hydration in this repository.

## Quick Reference

| Concept | Documentation |
|---------|---------------|
| SSR client split | [docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md](../../docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md) |
| TanStack Query integration | [docs/orpc/orpc.tanstack-query.md](../../docs/orpc/orpc.tanstack-query.md) |
| Advanced SSR patterns | [docs/tanstack-query/advanced-ssr.md](../../docs/tanstack-query/advanced-ssr.md) |
| SSR fundamentals | [docs/tanstack-query/ssr.md](../../docs/tanstack-query/ssr.md) |
| Hydration API reference | [docs/tanstack-query/hydration.md](../../docs/tanstack-query/hydration.md) |
| Request waterfalls | [docs/tanstack-query/request-waterfalls.md](../../docs/tanstack-query/request-waterfalls.md) |
| Prefetching patterns | [docs/tanstack-query/prefetching.md](../../docs/tanstack-query/prefetching.md) |

## Architecture Overview

This repository uses a dual-client setup to optimize SSR performance:

1. **Server-side** (`src/lib/orpc/client.server.ts`): Direct in-process procedure calls via `createRouterClient`
2. **Client-side** (`src/lib/orpc/orpc.ts`): HTTP calls via `RPCLink`

The `globalThis.$client` pattern ensures server-only code never reaches the browser bundle.

## Key Files

```
src/lib/orpc/
├── client.server.ts    # Server-side client (attached to globalThis.$client)
├── orpc.ts             # Unified export (server client during SSR, RPC link in browser)
├── router.ts           # Procedure router definition
└── README.md           # Detailed implementation docs

src/instrumentation.ts  # Imports client.server.ts to initialize before SSR
src/app/layout.tsx      # Also imports client.server.ts for pre-rendering
```

## SSR Prefetching Pattern

### Server Component with Prefetch

```tsx
// app/some-page/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc/orpc'
import { ClientComponent } from './client-component'

export default async function Page() {
  const queryClient = new QueryClient()

  // Prefetch during SSR - uses server-side client (no HTTP call)
  await queryClient.prefetchQuery(
    orpc.someResource.list.queryOptions({ input: { limit: 10 } })
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientComponent />
    </HydrationBoundary>
  )
}
```

### Client Component with useSuspenseQuery

```tsx
// app/some-page/client-component.tsx
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc/orpc'

export function ClientComponent() {
  // Data is already in cache from prefetch - no refetch
  const { data } = useSuspenseQuery(
    orpc.someResource.list.queryOptions({ input: { limit: 10 } })
  )

  return <div>{/* render data */}</div>
}
```

## Critical Points

1. **Import Order**: `src/instrumentation.ts` must import `client.server.ts` before any oRPC usage
2. **staleTime**: Set `staleTime > 0` to prevent immediate refetch after hydration
3. **HydrationBoundary**: Must wrap components that consume prefetched data
4. **Query Keys**: oRPC's `.queryOptions()` automatically generates consistent keys

## Better Auth + Prefetch

For auth-related data that needs prefetching, wrap Better Auth APIs in oRPC procedures:

```ts
// src/lib/orpc/procedures.ts
export const getSession = base.handler(async ({ context }) => {
  return await auth.api.getSession({ headers: context.headers })
})
```

Then prefetch in server components to hydrate auth state. See `./better-auth.instructions.md` for details.