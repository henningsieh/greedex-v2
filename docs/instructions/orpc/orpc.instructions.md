---
applyTo: '**'
---

# oRPC Instructions

This file provides an overview of available oRPC documentation. For detailed instructions, refer to the files in `docs/instructions/orpc/`.

## Getting Started
- **Installation and Setup**: Basic oRPC installation, configuration, and initial setup.
  - See: `docs/instructions/orpc/orpc.init.installation.md`

## Core Concepts
- **Procedures**: Defining and using oRPC procedures, input/output validation, middleware.
  - See: `docs/instructions/orpc/orpc.procedure.md`
- **Routers**: Creating and extending routers, lazy loading, utilities.
  - See: `docs/instructions/orpc/orpc.router.md`

## Integrations
- **Next.js Adapter**: Setting up oRPC with Next.js, including server-side rendering optimization.
  - See: `docs/instructions/orpc/orpcNextjs.adapter.md`
- **Better Auth Integration**: Using Better Auth for authentication in oRPC procedures.
  - See: `docs/instructions/orpc/orpc.better-auth.md`
- **Better Auth + SSR Pattern**: Complete guide for wrapping Better Auth in oRPC for SSR compatibility.
  - See: `docs/instructions/orpc/orpc.better-auth-ssr-pattern.md`
- **TanStack Query**: Integrating oRPC with TanStack Query for data fetching and caching.
  - See: `docs/instructions/orpc/orpc.tanstack-query.md`

## Advanced Topics
- **Server-Side Rendering (SSR) Optimization**: Optimizing SSR performance by avoiding redundant network calls.
  - See: `docs/instructions/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md`
- **Hydration & Suspense Analysis**: Deep dive into React hydration, why certain patterns cause errors, and best practices.
  - See: `docs/HYDRATION_SUSPENSE_ANALYSIS.md`

For the latest documentation, visit the oRPC official docs or check the detailed files in `docs/instructions/orpc/`.