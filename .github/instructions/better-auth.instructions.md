---
applyTo: "**"
---

# Better-Auth documentation

fetch the latest documentation from this URL: https://www.better-auth.com/llms.txt

You will find further instructions there on how to set up Better-Auth with Google OAuth and other providers.

Some additional instructions for integrating Better Auth with oRPC can be found in `/docs/orpc/orpc.better-auth.md`.

---

## App-specific: Better Auth + oRPC SSR Pattern (Repository-specific guidance)

This section contains application-specific instructions for using Better Auth together with oRPC in this repository. These are not part of upstream oRPC docs but are important for contributors working on this app to avoid hydration mismatches and to prefetch auth-related data for SSR.

### Why this is repo-specific

The Better Auth client provides client-side hooks (like `authClient.useSession()`), which cannot be used in server components or prefetchable Suspense boundaries. This repo uses oRPC to wrap Better Auth APIs and pass request headers through the oRPC context so these procedures can be pre-fetched on the server and used in client components via TanStack Query.

### Implementation example

```ts
// src/lib/orpc/context.ts
import { os } from '@orpc/server'
export const base = os.$context<{ headers: Headers }>()
```

```ts
// src/lib/orpc/procedures.ts
import { auth } from '@/lib/better-auth'
import { base } from './context'

export const getSession = base.handler(async ({ context }) => {
	return await auth.api.getSession({ headers: context.headers })
})

export const listOrganizations = base.handler(async ({ context }) => {
	return await auth.api.listOrganizations({ headers: context.headers })
})
```

Add these procedures to your router and prefetch them inside server components to hydrate the client-side TanStack Query cache.

### Usage & Decision Guidance

Use oRPC + prefetch for server-rendered pages or for components inside Suspense boundaries. Use Better Auth hooks for interactive, client-only components.

For more information and full examples, consult the repository's oRPC and TanStack Query integrations.
