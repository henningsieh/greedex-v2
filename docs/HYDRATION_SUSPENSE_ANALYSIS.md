# React Hydration & Suspense Analysis

This document explains the technical principles behind React hydration, why certain data-fetching patterns cause hydration errors, and how to avoid them.

## Understanding Hydration

Hydration is React's process of "attaching" to server-rendered HTML:

1. **Server renders** React components → HTML string
2. **Browser receives** HTML → displays immediately (fast!)
3. **React loads** JavaScript → prepares to hydrate
4. **React hydrates** → attaches event listeners and state
5. **React validates** → expects HTML to match what it would render

### The Hydration Contract

React enforces a strict contract:

```
Server-rendered HTML === Initial client render output
```

**If they don't match → Hydration error**

React discards server HTML and re-renders everything on client (expensive!).

## Why Data Fetching Patterns Matter

### Pattern 1: Prefetched Queries (✅ Stable)

**How it works:**
```typescript
// Server Component
const queryClient = getQueryClient();
await queryClient.prefetchQuery(queryOptions); // 1. Fetch on server
const dehydratedState = dehydrate(queryClient); // 2. Serialize to JSON

// Sent to browser in HTML as:
<script>
  window.__REACT_QUERY_STATE__ = {
    queries: [{ queryKey: ['session'], state: { data: {...} } }]
  };
</script>

// Client Component
const { data } = useSuspenseQuery(queryOptions); // 3. Uses same data from HTML
```

**Why it's stable:**
- Server fetches data → stores in cache
- Data serialized into HTML (dehydrated)
- Client reads same data from HTML (rehydrated)
- **Server HTML matches client render** ✅

### Pattern 2: Real-Time Hooks (❌ Unstable)

**How it works:**
```typescript
// Client Component
const { data: session } = authClient.useSession();
// Reads fresh from cookies/localStorage on every mount
// Subscribes to real-time session changes
```

**Why it's unstable:**
1. Server renders with `session = null` (no cookies during SSR)
2. Browser receives HTML with "no session" content
3. Client mounts → reads cookies → finds session
4. **Server HTML ≠ Client render** ❌
5. Hydration mismatch error!

## The Serialization Flow

### Server Side (Next.js App Router)

```typescript
// 1. Prefetch in Server Component
const queryClient = getQueryClient();
await queryClient.prefetchQuery(queryOptions);

// 2. Dehydrate cache (convert to plain objects)
const dehydratedState = dehydrate(queryClient);
// Output: {
//   queries: [{
//     queryKey: ['auth', 'session'],
//     state: {
//       data: { user: { id: '123', name: 'John' }, session: {...} },
//       status: 'success'
//     }
//   }]
// }

// 3. Serialize (handles Date, Set, Map, etc.)
const [json, meta] = serializer.serialize(dehydratedState);

// 4. Inject into HTML
<script>
  window.__REACT_QUERY_STATE__ = JSON.stringify({ json, meta });
</script>
```

### Client Side

```typescript
// 1. Extract from HTML
const serializedState = window.__REACT_QUERY_STATE__;

// 2. Deserialize (reconstructs Date, Set, Map, etc.)
const dehydratedState = serializer.deserialize(
  serializedState.json,
  serializedState.meta
);

// 3. Hydrate QueryClient
const queryClient = new QueryClient();
hydrate(queryClient, dehydratedState);

// 4. Component uses hydrated data
function MyComponent() {
  const { data } = useSuspenseQuery(queryOptions);
  // Reads from cache - NO fetch needed!
  // Uses SAME data as server rendered with
}
```

## Suspense Behavior Differences

### Server-Side Suspense

```typescript
// Server Component
<Suspense fallback={<Skeleton />}>
  <MyComponent /> {/* Uses useSuspenseQuery */}
</Suspense>
```

**Flow:**
1. Server starts rendering `MyComponent`
2. `useSuspenseQuery` throws promise if data not in cache
3. Suspense catches → renders fallback
4. Server waits for data to resolve
5. Server re-renders with data → sends HTML

**Result:** Data is in initial HTML ✅

### Client-Side Suspense

```typescript
// Client Component
"use client";
export function Wrapper() {
  return (
    <Suspense fallback={<Skeleton />}>
      <MyComponent /> {/* Uses authClient.useSession() */}
    </Suspense>
  );
}
```

**Flow:**
1. Client renders `MyComponent`
2. Hook returns `isPending: true` initially
3. Component renders loading state
4. Data loads from cookies/API
5. Component re-renders with data

**Result:** Loading state visible to user ❌

## The Case Study: Why ProjectsGrid Worked but DashboardHeader Didn't

### ProjectsGrid (Always Worked ✅)

```typescript
export function ProjectsGrid() {
  const { data: projects } = useSuspenseQuery(
    orpcQuery.project.list.queryOptions()
  );
  
  // Only uses prefetched query
  // All data stable
  // Perfect hydration
}
```

**Prefetch in server component:**
```typescript
void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());
```

**Why it works:**
- Single data source: prefetched query
- Data dehydrated with HTML
- Client rehydrates with same data
- No hydration mismatch possible

### DashboardHeader (Fixed 🔧)

**Before (Broken):**
```typescript
export function DashboardHeader() {
  // ❌ Real-time hook - not prefetched
  const { data: session } = authClient.useSession();
  
  // ✅ Prefetched query
  const { data: organizations } = useSuspenseQuery(
    orpcQuery.organization.list.queryOptions()
  );
  
  // Derives value from MIXED stable + unstable sources
  const activeOrgId = session?.session?.activeOrganizationId || orgs?.[0]?.id;
}
```

**Why it failed:**
- Mixed data sources: real-time hook + prefetched query
- Session data differs between server/client
- Derived values (activeOrgId) differ
- Hydration mismatch on rendered content

**After (Fixed):**
```typescript
export function DashboardHeader() {
  // ✅ Both prefetched queries
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions()
  );
  
  const { data: organizations } = useSuspenseQuery(
    orpcQuery.organization.list.queryOptions()
  );
  
  // Now derived from stable sources only
  const activeOrgId = session?.session?.activeOrganizationId || orgs?.[0]?.id;
}
```

**Why it works now:**
- All data from prefetched queries
- Everything dehydrated/rehydrated
- Server and client use identical data
- Perfect hydration

## Handling Session Changes

### The Edge Case

Even with prefetched queries, sessions can change between:
- T1: Server render
- T2: Client hydration (milliseconds later)

**Example:** User logs out in another tab between T1 and T2.

### Mitigation: staleTime

```typescript
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Data stays "fresh" for 60s
        // During hydration, uses cached data even if "stale"
      },
    },
  });
}
```

**Why this works:**
- Cache considers data fresh for 60s
- During hydration (milliseconds), data is definitely "fresh"
- Client uses cached data instead of refetching
- Hydration succeeds

**After hydration:**
- If data becomes stale, TanStack Query refetches in background
- UI updates smoothly without hydration errors

## Performance Implications

| Pattern | Initial HTML | Client Hydration | Network Requests |
|---------|-------------|------------------|------------------|
| Prefetched queries | ✅ Data included | Fast (no fetch) | 0 extra requests |
| Real-time hooks | ❌ No data | Slow (fetch + render) | 1+ extra requests |
| Server props | ✅ Data included | Fast (no fetch) | 0 extra requests |

### Core Web Vitals Impact

**Prefetched Queries:**
- **FCP (First Contentful Paint):** Fast - data in HTML
- **LCP (Largest Contentful Paint):** Fast - no layout shift
- **CLS (Cumulative Layout Shift):** Zero - no loading → content shift

**Real-Time Hooks:**
- **FCP:** Fast - HTML renders
- **LCP:** Slow - waits for data fetch
- **CLS:** High - skeleton → content shift

## Trade-offs

### Prefetched Queries (oRPC + TanStack Query)

**Pros:**
- ✅ Perfect hydration
- ✅ Data in initial HTML (SEO)
- ✅ Zero loading states
- ✅ Optimal performance

**Cons:**
- ⚠️ Not "real-time" (uses refetch intervals)
- ⚠️ Requires prefetching setup
- ⚠️ Slightly more complex

### Real-Time Hooks (Better Auth)

**Pros:**
- ✅ True real-time updates
- ✅ Cross-tab synchronization
- ✅ Simple API
- ✅ Automatic updates

**Cons:**
- ❌ Cannot use with SSR Suspense
- ❌ Always shows loading state
- ❌ No data in initial HTML
- ❌ Hydration issues with SSR

## Best Practices

### ✅ DO: Match Data Sources

```typescript
// All prefetched - stable hydration
const { data: session } = useSuspenseQuery(orpcQuery.betterauth.getSession.queryOptions());
const { data: orgs } = useSuspenseQuery(orpcQuery.organization.list.queryOptions());
const { data: projects } = useSuspenseQuery(orpcQuery.project.list.queryOptions());
```

### ❌ DON'T: Mix Stable and Unstable

```typescript
// BAD: Mixed sources
const { data: session } = authClient.useSession(); // Unstable
const { data: projects } = useSuspenseQuery(...); // Stable
// Result: Hydration mismatch
```

### ✅ DO: Prefetch Everything for Suspended Components

```typescript
// layout.tsx or page.tsx
const queryClient = getQueryClient();

// Prefetch ALL data used in suspended client components
void queryClient.prefetchQuery(orpcQuery.betterauth.getSession.queryOptions());
void queryClient.prefetchQuery(orpcQuery.organization.list.queryOptions());
void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

return (
  <HydrateClient client={queryClient}>
    <Suspense fallback={<Skeleton />}>
      <MyComponent />
    </Suspense>
  </HydrateClient>
);
```

### ✅ DO: Use Real-Time Hooks for Client-Only Components

```typescript
// Sidebar component - never server-rendered
export function OrganizationSwitcher() {
  // Perfect use case for real-time hooks
  const { data: session } = authClient.useSession();
  const { data: orgs } = authClient.useListOrganizations();
  
  // Updates automatically on session changes
}
```

## Decision Framework

```
Is component server-rendered?
├─ Yes → Use prefetched queries (oRPC + TanStack Query)
│   └─ Prefetch in server component
│       └─ Use useSuspenseQuery in client component
│
└─ No (client-only)
    └─ Need real-time updates?
        ├─ Yes → Use Better Auth hooks
        └─ No → Use prefetched queries (better performance)
```

## Key Takeaways

1. **Hydration requires identical data** between server and client renders
2. **Prefetched queries provide stability** through serialization/deserialization
3. **Real-time hooks break SSR** because they read fresh data on mount
4. **Never mix stable and unstable** data sources in the same component
5. **Always prefetch** before using useSuspenseQuery in SSR
6. **staleTime protects hydration** by keeping cached data fresh
7. **Choose the right pattern** based on SSR needs and real-time requirements

## Testing Checklist

- [ ] No hydration errors in browser console
- [ ] Data visible in "View Page Source" (SSR verification)
- [ ] No loading skeletons flash after page load
- [ ] Suspense boundaries work correctly
- [ ] Interactive features (dropdowns, switchers) work
- [ ] Production build (`bun run build && bun run start`) passes all tests

## Related Documentation

- [Better Auth + oRPC SSR Pattern](/docs/instructions/orpc/orpc.better-auth-ssr-pattern.md)
- [oRPC TanStack Query Integration](/docs/instructions/orpc/orpc.tanstack-query.md)
- [React Hydration Docs](https://react.dev/reference/react-dom/client/hydrateRoot)
- [TanStack Query SSR Guide](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
