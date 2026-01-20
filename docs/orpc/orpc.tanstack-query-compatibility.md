---
title: "oRPC + TanStack Query Compatibility Notes"
description: "Known compatibility issues and workarounds between oRPC and TanStack Query versions"
---

# oRPC + TanStack Query Compatibility

## Current Issue: Duplicate Query Core (Temporary Workaround)

### Problem

When upgrading `@tanstack/react-query` to version `5.90.19` or later with `@orpc/tanstack-query@1.13.4`, TypeScript throws compatibility errors:

```typescript
Types of property 'queryFn' are incompatible.
Type 'import(".../node_modules/@tanstack/react-query/node_modules/@tanstack/query-core/...").g' 
is not assignable to type 'import(".../node_modules/@tanstack/query-core/...").g'
```

**Root Cause**: Duplicate instances of `@tanstack/query-core` with different versions:
- `@tanstack/react-query@5.90.19` requires `@tanstack/query-core@5.90.19`
- `@orpc/tanstack-query@1.13.4` allows `@tanstack/query-core@>=5.80.2` (resolves to 5.90.17)

This creates two incompatible `QueryClient` classes with different private field implementations.

### Solution (Temporary)

Add `resolutions` field to `package.json` to force all packages to use the same version:

```json
{
  "resolutions": {
    "@tanstack/query-core": "5.90.19"
  }
}
```

Then reinstall dependencies:

```bash
rm -rf node_modules bun.lockb
bun install
```

**Verification**:
```bash
bun why @tanstack/query-core
# Should show only one version of @tanstack/query-core@5.90.19
```

### Status

**⏳ TEMPORARY WORKAROUND** — This is not a permanent solution.

**Expected Resolution**:
- ✅ When `@orpc/tanstack-query` releases a new version with updated `@tanstack/query-core` peer dependency
- 🔗 Tracking: [oRPC GitHub](https://github.com/orpc/orpc/issues)

**Can be removed when**:
- `@orpc/tanstack-query` explicitly supports `@tanstack/query-core` version 5.90.19 or later
- Remove the `resolutions` field and verify `bun why @tanstack/query-core` reports a single version
- Run `bun run lint` to confirm no TypeScript errors

### Notes for Developers

- **Don't update** `@tanstack/query-core` manually in `resolutions` without checking upstream
- **Always verify** with `bun run lint` after package updates
- **Keep monitoring** the [oRPC releases page](https://github.com/orpc/orpc/releases)
- **Document** any new version compatibility issues in this file

## Related Documentation

- [oRPC + TanStack Query Integration](./orpc.tanstack-query.md)
- [TanStack Query SSR Guide](../tanstack-react-query/ssr.md)
- [TanStack React Query Hydration](../tanstack-react-query/hydration.md)

## Upstream Issues

- oRPC: Track version updates at [orpc/orpc releases](https://github.com/orpc/orpc/releases)
- TanStack Query: [Query Core changelog](https://github.com/TanStack/query/blob/main/packages/query-core/package.json)
