# Partial Prerendering (PPR) Implementation Guide

## Overview

This document explains the Partial Prerendering (PPR) implementation in this Next.js 16 application using the `cacheComponents: true` flag (also known as Cache Components).

## What is PPR?

Partial Prerendering allows mixing static, cached, and dynamic content in a single route. It gives you:
- The speed of static sites (instant first paint)
- The flexibility of dynamic rendering (personalized content)
- Optimal performance through streaming dynamic content

## Current Implementation Status

### ✅ Completed

1. **PPR Enabled**: Added `cacheComponents: true` to `next.config.ts`
2. **Fixed Date.now() Issue**: Updated `HydrateClient` component to call `connection()` before `dehydrate()` to properly handle non-deterministic operations
3. **Static Routes Working**: Routes like `/about`, `/library`, `/e+forest`, and `/tips-and-tricks` successfully prerender as SSG (●)
4. **Suspense Boundaries**: Added proper Suspense wrapping for client components that use `useSuspenseQuery`

### ⚠️ Known Issues

**Authenticated Routes Fail to Prerender**

All routes under `/[locale]/(app)/` currently fail during build with:
```
Error: Route "/[locale]/org/*": Uncached data was accessed outside of <Suspense>
```

**Root Cause**: The `(app)/layout.tsx` accesses runtime APIs (`headers()`, `cookies()`) for authentication checks. With PPR, layouts cannot be wrapped in Suspense, and runtime API access in layouts makes all child routes dynamic.

## Why This Happens

### The PPR Model

With `cacheComponents` enabled:
- Next.js tries to prerender as much as possible at build time
- Runtime APIs (`headers()`, `cookies()`, `searchParams()`, `connection()`) signal dynamic behavior
- Components accessing runtime APIs MUST be wrapped in `<Suspense>` OR marked with `'use cache'`
- Layouts CANNOT be wrapped in Suspense (they are the wrapping element)

### Our Architecture

```
(app)/layout.tsx
├─ await headers()          ← Runtime API access
├─ auth.api.getSession()    ← Requires runtime data
├─ auth.api.listOrganizations() ← Requires runtime data
└─ Renders child pages
```

The layout requires runtime data for security (authentication/authorization checks), but layouts can't be suspended, creating a conflict with PPR's requirements.

### Why We Can't Use `dynamic = 'force-dynamic'`

The old route segment config `dynamic = 'force-dynamic'` is **incompatible with cacheComponents**:
```
Error: Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`. 
Please remove it.
```

## Solutions & Recommendations

### Option 1: Accept Fully Dynamic Authenticated Routes (Current State)

**Pros:**
- Most secure approach
- Minimal code changes
- Authentication checks happen server-side
- Static routes (landing pages) still benefit from PPR

**Cons:**
- Authenticated pages are fully dynamic (no static shell)
- Slower initial page load for auth pages

**Implementation:**
- Keep current architecture
- Document that auth routes are intentionally dynamic
- Focus PPR benefits on public routes

### Option 2: Move Auth to Middleware (Recommended)

**Pros:**
- Allows layouts to be mostly static
- Better PPR compatibility
- Cleaner separation of concerns

**Cons:**
- Requires refactoring authentication flow
- More complex middleware logic

**Implementation Steps:**
1. Create/enhance `middleware.ts` to handle authentication
2. Check session/cookies in middleware
3. Redirect unauthenticated users before layout renders
4. Simplify layout to remove auth checks
5. Pass auth state through headers or other mechanism

### Option 3: Restructure Layout with Suspense Boundaries

**Pros:**
- Maximum PPR benefits
- Static shell with dynamic auth content

**Cons:**
- Complex refactoring
- Requires rethinking component hierarchy

**Implementation Steps:**
1. Split layout into static shell and dynamic content components
2. Move all runtime API access into suspended components
3. Use client components for dynamic UI based on auth state
4. Ensure security isn't compromised

### Option 4: Use `'use cache'` with Runtime Data Pattern

**Pros:**
- Can cache personalized content
- Works with PPR

**Cons:**
- Complex cache invalidation
- Not suitable for all auth scenarios

**Implementation:**
```tsx
// NOT in same scope as runtime API
async function CachedContent({ sessionId }: { sessionId: string }) {
  'use cache'
  cacheLife('minutes')
  cacheTag('user-session')
  
  const data = await fetchUserData(sessionId)
  return <div>{data}</div>
}

// Component that accesses runtime data
async function Page() {
  const session = (await cookies()).get('session')?.value
  return <CachedContent sessionId={session} />
}
```

## Current File Structure

### Modified Files

1. **`next.config.ts`**
   - Added `cacheComponents: true`

2. **`src/lib/react-query/hydration.tsx`**
   - Added `await connection()` before `dehydrate()`
   - Fixed Date.now() issue for PPR compatibility

3. **`src/app/[locale]/(app)/layout.tsx`**
   - Added `await connection()` at start (attempts to signal dynamic)
   - Access `headers()` first thing
   - Contains authentication/authorization logic

4. **`src/app/[locale]/(app)/(active project)/org/activeproject/page.tsx`**
   - Refactored to server component wrapper
   - Client logic moved to `active-project-content.tsx`
   - Wrapped in Suspense

5. **`src/app/[locale]/(app)/org/create-project/page.tsx`**
   - Refactored to separate server/client concerns
   - Runtime data access moved to `create-project-content.tsx`
   - Wrapped in Suspense

## Testing PPR

### Verify Static Routes Work

```bash
npm run build
```

Look for these indicators in build output:
- `●  (SSG)` - Successfully prerendered as static HTML
- `○  (Static)` - Prerendered as static content
- `ƒ  (Dynamic)` - Server-rendered on demand

### Expected Results

**Working (Static)**:
```
├ ● /[locale]/about
├ ● /[locale]/e+forest
├ ● /[locale]/library
├ ● /[locale]/tips-and-tricks
```

**Dynamic (By Design)**:
```
├ ƒ /[locale]/org/dashboard
├ ƒ /[locale]/org/projects
├ ƒ /[locale]/org/settings
```

## Best Practices for PPR

### 1. Wrap Dynamic Content in Suspense

```tsx
export default function Page() {
  return (
    <>
      <h1>Static Shell</h1>
      <Suspense fallback={<Loading />}>
        <DynamicContent />
      </Suspense>
    </>
  )
}
```

### 2. Access Runtime APIs Before Other Operations

```tsx
async function Component() {
  // Access runtime API FIRST
  await connection()
  // or
  const headers = await headers()
  
  // Then do other work
  const data = await fetchData()
  // ...
}
```

### 3. Use `'use cache'` for Cacheable Dynamic Content

```tsx
async function BlogPosts() {
  'use cache'
  cacheLife('hours')
  
  const posts = await fetch('https://api.example.com/posts')
  return <PostList posts={posts} />
}
```

### 4. Separate Static and Dynamic Concerns

- Keep static UI in page components
- Move dynamic data fetching to suspended child components
- Use client components for interactive elements

## Additional Resources

- [Next.js PPR Documentation](https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering)
- [Cache Components Guide](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)
- [use cache Directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [connection() API](https://nextjs.org/docs/app/api-reference/functions/connection)

## Next Steps

1. **Short Term**: Document that authenticated routes are fully dynamic (security requirement)
2. **Medium Term**: Consider moving authentication to middleware
3. **Long Term**: Refactor layout architecture to maximize PPR benefits
4. **Ongoing**: Apply PPR patterns to new features as they're developed

## Notes

- The `Date.now()` issue in `HydrateClient` was caused by TanStack Query's `dehydrate()` function using non-deterministic operations without prior runtime API access
- Google Fonts may fail during build in restricted environments - consider using local fonts or font subsetting
- Better Auth integration works well with PPR when properly structured
- oRPC with SSR optimization is compatible with PPR patterns

