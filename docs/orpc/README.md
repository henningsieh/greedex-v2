---
title: "oRPC Documentation Index"
description: "Complete guide to Greedex's oRPC dual-endpoint architecture"
---

# oRPC Documentation Index

This index helps you find the right documentation for your task.

## 🎯 Where to Start?

### I'm new to the codebase
👉 **Start with**: [QUICKSTART.md](./QUICKSTART.md)
- 5-minute introduction
- Decision tree for common tasks
- Quick reference guide

### I'm implementing a feature
👉 **Read**: [src/lib/orpc/README.md](../../src/lib/orpc/README.md)
- Creating procedures
- Using the `orpc` client
- Testing & validation

### I need to understand the architecture
👉 **Read**: [DUAL-SETUP.md](./DUAL-SETUP.md)
- Why two endpoints?
- How RPC vs REST differ
- Best practices & patterns

### I want details on a specific topic
👉 **Jump to section below**

---

## 📚 Complete Documentation Map

### Foundation & Architecture

| Document | Purpose | Audience |
|----------|---------|----------|
| [QUICKSTART.md](./QUICKSTART.md) | 5-min intro + decision tree | Everyone (start here) |
| [DUAL-SETUP.md](./DUAL-SETUP.md) | Full architecture details | Developers, architects |
| [src/lib/orpc/README.md](../src/lib/orpc/README.md) | Implementation patterns | Developers |

### Advanced Topics

| Document | Purpose | Audience |
|----------|---------|----------|
| [orpc.openapi-reference.md](./orpc.openapi-reference.md) | Plugin details + SRI security | DevOps, security engineers |
| [orpc.openapi.scalar.md](./orpc.openapi.scalar.md) | Scalar UI alternatives | Developers |
| [orpc.tanstack-query-compatibility.md](./orpc.tanstack-query-compatibility.md) | TanStack Query version compatibility issues | Developers (⚠️ temporary workaround) |

---

## 🎓 Learning Paths

### Path 1: "I just want to call an API"
1. Read: [QUICKSTART.md](./QUICKSTART.md) (5 min)
2. Try: Call `await orpc.procedure()` in your code
3. Test: Visit `/api/docs` in browser
4. Reference: Use [DUAL-SETUP.md troubleshooting](./DUAL-SETUP.md#troubleshooting) if stuck

### Path 2: "I need to create a new endpoint"
1. Read: [src/lib/orpc/README.md](../src/lib/orpc/README.md) (10 min)
2. Copy: Existing procedure in `src/lib/orpc/procedures.ts`
3. Edit: Customize for your needs
4. Register: Add to `src/lib/orpc/router.ts`
5. Test: Via `/api/docs` or `orpc.your.procedure()`

### Path 3: "I need to understand security"
1. Read: [DUAL-SETUP.md - Best Practices](./DUAL-SETUP.md#best-practices) (5 min)
2. Study: How `authorized` base works in [src/lib/orpc/README.md](../src/lib/orpc/README.md)
3. Reference: Protected procedure examples
4. Advanced: [orpc.openapi-reference.md - SRI Security](./orpc.openapi-reference.md#sri-security-for-scalar-bundle)

### Path 4: "I need to integrate external tools"
1. Read: [DUAL-SETUP.md - Using Endpoints](./DUAL-SETUP.md#using-the-endpoints) (5 min)
2. Learn: `/api/openapi` is the REST endpoint
3. Test: Use curl or Postman
4. Deploy: Standard HTTP clients work automatically

---

## 🔑 Key Concepts Quick Reference

### The Two Endpoints
```text
┌─ From Next.js app? → Use /api/rpc (orpc client)
│  Faster, type-safe, no HTTP overhead
│
└─ From external tool? → Use /api/openapi (REST)
   Standard HTTP, OpenAPI compatible
```

### Procedure Structure
```typescript
base|authorized                          // Choose base
  .route({ method, path, summary })     // Optional but recommended
  .input(ZodSchema)                     // Optional input validation
  .output(ZodSchema)                    // Optional output validation
  .handler(async ({ input, context, errors }) => {
    // Your logic here
    return result;
  })
```

### The Magic of `orpc`
```typescript
// ONE import, TWO execution paths
import { orpc } from "@/lib/orpc/orpc";

// In Server Component → Direct call (no HTTP)
await orpc.procedure();

// In Client Component → HTTP to /api/rpc
await orpc.procedure();

// Same code, different execution!
```

---

## 📍 File Reference

### Core Implementation
- [`src/lib/orpc/router.ts`](../src/lib/orpc/router.ts) — Procedure registry
- [`src/lib/orpc/procedures.ts`](../src/lib/orpc/procedures.ts) — Procedure definitions
- [`src/lib/orpc/context.ts`](../src/lib/orpc/context.ts) — Context type
- [`src/lib/orpc/middleware.ts`](../src/lib/orpc/middleware.ts) — Auth middleware
- [`src/lib/orpc/orpc.ts`](../src/lib/orpc/orpc.ts) — Unified client (use this!)
- [`src/lib/orpc/client.server.ts`](../src/lib/orpc/client.server.ts) — Server client

### Endpoints & Handlers
- [`src/app/api/rpc/[[...rest]]/route.ts`](../src/app/api/rpc/[[...rest]]/route.ts) — RPC endpoint
- [`src/app/api/openapi/[[...rest]]/route.ts`](../src/app/api/openapi/[[...rest]]/route.ts) — REST endpoint
- [`src/app/api/docs/route.ts`](../src/app/api/docs/route.ts) — Scalar UI
- [`src/lib/orpc/openapi-handler.ts`](../src/lib/orpc/openapi-handler.ts) — Handler config

### Build & Deployment
- [`scripts/generate-sri.js`](../scripts/generate-sri.js) — SRI hash generator
- [`package.json`](../package.json) → `config.scalarVersion` — Version source

### Documentation
- [`docs/orpc/QUICKSTART.md`](./QUICKSTART.md) — This directory
- [`docs/orpc/DUAL-SETUP.md`](./DUAL-SETUP.md)
- [`docs/orpc/orpc.openapi-reference.md`](./orpc.openapi-reference.md)
- [`docs/orpc/orpc.openapi.scalar.md`](./orpc.openapi.scalar.md)
- [`src/lib/orpc/README.md`](../src/lib/orpc/README.md)

---

## ❓ Common Questions

**Q: Where do I call `orpc.procedure()`?**  
A: Anywhere in Next.js — client components, server components, API routes. All use the same import.

**Q: How do I test an endpoint?**  
A: Two ways:
- Browser: Visit `http://localhost:3000/api/docs` (interactive)
- Terminal: `curl http://localhost:3000/api/openapi/endpoint`

**Q: Why do I get type errors?**  
A: You're importing from the wrong place. Always use: `import { orpc } from "@/lib/orpc/orpc"`

**Q: How do I protect a procedure?**  
A: Use `authorized` base instead of `base`:
```typescript
export const myProcedure = authorized.route(...).handler(...)
```

**Q: Can I use RPC from Postman?**  
A: No, that's the REST endpoint (`/api/openapi`). RPC uses binary protocol.

**Q: What's `.route()` for?**  
A: Makes your procedure visible in OpenAPI spec and documentation. Always add it to public procedures.

**Q: How does SSR work?**  
A: During server-side rendering, `orpc` calls procedures directly (no HTTP). In the browser, it makes HTTP requests to `/api/rpc`.

---

## 🚀 Next Steps

1. **Understand the basics**: Read [QUICKSTART.md](./QUICKSTART.md) (5 min)
2. **Try it out**: Call a procedure from a component
3. **Explore**: Check `/api/docs` in your browser
4. **Learn patterns**: See examples in [src/lib/orpc/README.md](../src/lib/orpc/README.md)
5. **Ask questions**: Reference [DUAL-SETUP.md troubleshooting](./DUAL-SETUP.md#troubleshooting)

---

## 📞 Quick Support

| Issue | Resource |
|-------|----------|
| "Type not found" | [QUICKSTART.md decision tree](./QUICKSTART.md#quick-decision-tree) |
| "404 on endpoint" | [DUAL-SETUP.md troubleshooting](./DUAL-SETUP.md#troubleshooting) |
| "How to create procedure" | [src/lib/orpc/README.md - Usage](../src/lib/orpc/README.md#usage-pattern-unified-client) |
| "SSR not working" | [DUAL-SETUP.md - SSR Optimization](./DUAL-SETUP.md#ssr-optimization) |
| "How to protect endpoint" | [src/lib/orpc/README.md - Protected Procedures](../src/lib/orpc/README.md#creating-protected-procedures) |
| "Scalar UI blank" | [orpc.openapi-reference.md - SRI](./orpc.openapi-reference.md#sri-security-for-scalar-bundle) |

---

## 🔗 External Resources

- [oRPC Official Docs](https://orpc.dev)
- [Scalar UI Docs](https://github.com/scalar/scalar)
- [Better Auth Docs](https://better-auth.com)
- [Zod Validation Docs](https://zod.dev)
