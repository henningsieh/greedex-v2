# Documentation Index

## Quick Reference

### Need to Fix Hydration Errors?
→ [Hydration & Suspense Analysis](/docs/HYDRATION_SUSPENSE_ANALYSIS.md)

### Need to Set Up Better Auth with SSR?
→ [Better Auth + oRPC SSR Pattern](/docs/instructions/orpc/orpc.better-auth-ssr-pattern.md)

## Complete Documentation Structure

### Core oRPC Documentation
Located in `docs/instructions/orpc/`:

1. **Installation & Setup**
   - `orpc.init.installation.md` - Basic oRPC setup
   - `orpc.procedure.md` - Creating procedures
   - `orpc.router.md` - Defining routers
   - `orpcNextjs.adapter.md` - Next.js integration

2. **Data Fetching & State Management**
   - `orpc.tanstack-query.md` - TanStack Query integration
   - `orpc.Optimize-Server-Side-Rendering.SSR.md` - General SSR optimization

3. **Authentication**
   - `orpc.better-auth.md` - Basic Better Auth setup
   - `orpc.better-auth-ssr-pattern.md` - **Complete SSR pattern with Better Auth** ⭐

### React Hydration & Suspense
Located in `docs/`:

- `HYDRATION_SUSPENSE_ANALYSIS.md` - **Complete hydration guide** ⭐
  - Technical principles
  - Why hydration fails
  - Pattern comparisons
  - Best practices
  - Testing checklist

### Better Auth Documentation
Located in `docs/instructions/better-auth/`:

- `better-auth.organizations.md` - Organization plugin features
- `better-auth.options.md` - Configuration options

### Implementation Notes
Located in `docs/`:

- `IMPLEMENTATION_SUMMARY.md` - Project-specific implementation notes
- `PERMISSIONS_README.md` - Permissions system documentation

## Common Scenarios

### "I'm getting hydration errors with session data"
1. Read: [Hydration & Suspense Analysis](/docs/HYDRATION_SUSPENSE_ANALYSIS.md)
2. Implement: [Better Auth + oRPC SSR Pattern](/docs/instructions/orpc/orpc.better-auth-ssr-pattern.md)

### "I need to set up authentication"
1. Start: `docs/instructions/orpc/orpc.better-auth.md` - Basic auth middleware
2. For SSR: `docs/instructions/orpc/orpc.better-auth-ssr-pattern.md` - Complete SSR setup

### "I need to optimize SSR performance"
1. General: `docs/instructions/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md`
2. With auth: `docs/instructions/orpc/orpc.better-auth-ssr-pattern.md`

### "I want to understand the technical details"
Read: [Hydration & Suspense Analysis](/docs/HYDRATION_SUSPENSE_ANALYSIS.md)
- Section: "The Serialization Flow"
- Section: "Why Data Fetching Patterns Matter"

## File Organization Summary

```
docs/
├── HYDRATION_SUSPENSE_ANALYSIS.md          ⭐ Hydration principles & best practices
├── IMPLEMENTATION_SUMMARY.md               Project-specific notes
├── PERMISSIONS_README.md                   Permissions documentation
└── instructions/
    ├── better-auth/
    │   ├── better-auth.organizations.md    Organization plugin
    │   └── better-auth.options.md          Configuration options
    ├── orpc/
    │   ├── orpc.better-auth-ssr-pattern.md ⭐ Complete Better Auth SSR guide
    │   ├── orpc.better-auth.md             Basic Better Auth setup
    │   ├── orpc.init.installation.md       Installation
    │   ├── orpc.Optimize-Server-Side-Rendering.SSR.md  General SSR
    │   ├── orpc.procedure.md               Procedures
    │   ├── orpc.router.md                  Routers
    │   ├── orpc.tanstack-query.md          TanStack Query
    │   └── orpcNextjs.adapter.md           Next.js adapter
    └── ...
```

## Changes from Previous Documentation

### Consolidated Files
The following 5 files were merged into 2 focused documents:

**Removed (redundant):**
- `DATA_FETCHING_PATTERNS.md`
- `HYDRATION_FIX_SUMMARY.md`
- `HYDRATION_FIX_CHECKLIST.md`
- `SUSPENSE_HYDRATION_ANALYSIS.md`
- `TECHNICAL_HYDRATION_DEEP_DIVE.md`

**New (consolidated):**
- `HYDRATION_SUSPENSE_ANALYSIS.md` - All hydration/suspense content
- `orpc.better-auth-ssr-pattern.md` - All Better Auth + oRPC SSR content

### Benefits
- ✅ No duplication
- ✅ Single source of truth for each topic
- ✅ Clear navigation
- ✅ Proper categorization (orpc vs general React concepts)

## Maintained Files
These files were updated with cross-references but not consolidated:

- `orpc.better-auth.md` - Basic auth middleware (distinct from SSR pattern)
- `orpc.Optimize-Server-Side-Rendering.SSR.md` - General SSR (not auth-specific)
