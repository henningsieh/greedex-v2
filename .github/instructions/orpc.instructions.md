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
  - See: [docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md](../../docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md), [docs/orpc/orpc.tanstack-query.md](../../docs/orpc/orpc.tanstack-query.md), and related TanStack Query docs in `/docs/tanstack-react-query/`
- **Better Auth SSR Pattern**: Patterns for using Better Auth with oRPC in SSR contexts.
  - See: [.github/instructions/better-auth.instructions.md](../../.github/instructions/better-auth.instructions.md)

## Implementation Details (This Repository)
- **oRPC README**: Full implementation documentation for this app's oRPC setup.
  - See: [src/lib/orpc/README.md](../../src/lib/orpc/README.md)

For the latest documentation, have a deep look into the official oRPC docs in `/docs/orpc/`.