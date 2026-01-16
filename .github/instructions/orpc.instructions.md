---
applyTo: "src/lib/orpc/**/*.{ts,tsx}|src/app/api/rpc/**/*.{ts,tsx}"
description: oRPC procedures, routers, integrations, and SSR optimization patterns
---

# oRPC Instructions

## Comprehensive Documentation

**⚠️ CRITICAL**: This repository contains comprehensive oRPC documentation in `/docs/orpc/`. **Always consult these comprehensive guides first** for implementation details, integration patterns, and examples. This file provides a quick overview and navigation guide.

## Getting Started

- **Installation and Setup**: Basic oRPC installation, configuration, and initial setup.
  - See: [docs/orpc/orpc.init.installation.md](../../docs/orpc/orpc.init.installation.md)

## Core Concepts

- **Procedures**: Defining and using oRPC procedures, input/output validation, middleware.
  - See: [docs/orpc/orpc.procedure.md](../../docs/orpc/orpc.procedure.md)
- **Routers**: Creating and extending routers, lazy loading, utilities.
  - See: [docs/orpc/orpc.router.md](../../docs/orpc/orpc.router.md)
- **Server-Side Clients**: Using oRPC from server components and avoiding HTTP self-calls.
  - See: [docs/orpc/orpc.server-side.md](../../docs/orpc/orpc.server-side.md)

## Integrations

- **Next.js Adapter**: Setting up oRPC with Next.js, including server-side rendering optimization.
  - See: [docs/orpc/orpcNextjs.adapter.md](../../docs/orpc/orpcNextjs.adapter.md)
- **Better Auth Integration**: Using Better Auth for authentication in oRPC procedures.
  - See: [docs/orpc/orpc.better-auth.md](../../docs/orpc/orpc.better-auth.md)
- **TanStack Query Integration**: Integrating oRPC with TanStack Query for data fetching.
  - See: [docs/orpc/orpc.tanstack-query.md](../../docs/orpc/orpc.tanstack-query.md)

## Error Handling

- **Error Handling**: General error handling patterns in oRPC.
  - See: [docs/orpc/orpc.error-handling.md](../../docs/orpc/orpc.error-handling.md)
- **Client Error Handling**: Client-side error handling with TanStack Query.
  - See: [docs/orpc/orpc.client-error-handling.md](../../docs/orpc/orpc.client-error-handling.md)
- **Validation Errors**: Handling Zod validation errors.
  - See: [docs/orpc/orpc.validation-errors.md](../../docs/orpc/orpc.validation-errors.md)

## OpenAPI

- **OpenAPI Handler**: Setting up OpenAPI documentation for oRPC.
  - See: [docs/orpc/orpc.openapi-handler.md](../../docs/orpc/orpc.openapi-handler.md)
- **OpenAPI Specification**: Understanding the OpenAPI spec generation.
  - See: [docs/orpc/orpc.openapi-specification.md](../../docs/orpc/orpc.openapi-specification.md)
- **OpenAPI Link**: Customizing OpenAPI metadata.
  - See: [docs/orpc/orpc.openapi-link.md](../../docs/orpc/orpc.openapi-link.md)
- **Scalar Integration**: Interactive API documentation with Scalar.
  - See: [docs/orpc/orpc.openapi.scalar.md](../../docs/orpc/orpc.openapi.scalar.md)
- **OpenAPI Reference**: Alternative API documentation UI.
  - See: [docs/orpc/orpc.openapi-reference.md](../../docs/orpc/orpc.openapi-reference.md)
- **Smart Coercion**: Type coercion for OpenAPI.
  - See: [docs/orpc/orpc.smart-coercion.md](../../docs/orpc/orpc.smart-coercion.md)

## Advanced Topics

- **SSR Optimization**: Optimizing SSR performance by avoiding redundant network calls.
  - See: [docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md](../../docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md)
- **Dual Setup**: Understanding the dual client/server setup in this repository.
  - See: [docs/orpc/DUAL-SETUP.md](../../docs/orpc/DUAL-SETUP.md)
- **TanStack Query Prefetching & Hydration**: Combined patterns for SSR prefetching with TanStack Query.
  - See related files in `/docs/tanstack-react-query/`:
    - [ssr.md](../../docs/tanstack-react-query/ssr.md) - Basic SSR patterns
    - [advanced-ssr.md](../../docs/tanstack-react-query/advanced-ssr.md) - Advanced server components patterns
    - [hydration.md](../../docs/tanstack-react-query/hydration.md) - Hydration API reference
    - [prefetching.md](../../docs/tanstack-react-query/prefetching.md) - Prefetching strategies
    - [request-waterfalls.md](../../docs/tanstack-react-query/request-waterfalls.md) - Performance optimization
- **Better Auth SSR Pattern**: Patterns for using Better Auth with oRPC in SSR contexts.
  - See: [.github/instructions/better-auth.instructions.md](../../.github/instructions/better-auth.instructions.md)

## Implementation Details (This Repository)

- **oRPC README**: Full implementation documentation for this app's oRPC setup.
  - See: [src/lib/orpc/README.md](../../src/lib/orpc/README.md)

### Official oRPC Resources

For the latest upstream documentation:

- Official docs: https://orpc.dev/docs

**Remember**: Always consult the comprehensive documentation in `/docs/orpc/` for this repository's specific implementation patterns and integration examples.
