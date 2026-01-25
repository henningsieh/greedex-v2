---
name: "oRPC Integration"
description: "API endpoints, procedures, routers, middleware, and SSR optimization"
applyTo: "**/orpc/**/*.ts,src/app/api/rpc/**/*.ts"
---

# oRPC Integration Guide

**Context**: When working with API endpoints, procedures, routers, or SSR optimization.

---

## Comprehensive Documentation

For implementation details, integration patterns, and examples, **always consult** `/docs/orpc/` first:

### Quick Navigation

- **[QUICKSTART.md](../../docs/orpc/QUICKSTART.md)** — 5-minute overview, decision tree, cheat sheet
- **[DUAL-SETUP.md](../../docs/orpc/DUAL-SETUP.md)** — 10-minute architecture deep dive
- **[README.md](../../docs/orpc/README.md)** — File locations, FAQ, learning paths

### Core Concepts

- **Installation and Setup**: [docs/orpc/orpc.init.installation.md](../../docs/orpc/orpc.init.installation.md)
- **Procedures**: [docs/orpc/orpc.procedure.md](../../docs/orpc/orpc.procedure.md)
- **Routers**: [docs/orpc/orpc.router.md](../../docs/orpc/orpc.router.md)
- **Server-Side Clients**: [docs/orpc/orpc.server-side.md](../../docs/orpc/orpc.server-side.md)

### Integrations

- **Next.js Adapter**: [docs/orpc/orpcNextjs.adapter.md](../../docs/orpc/orpcNextjs.adapter.md)
- **Better Auth**: [docs/orpc/orpc.better-auth.md](../../docs/orpc/orpc.better-auth.md)
- **TanStack Query**: [docs/orpc/orpc.tanstack-query.md](../../docs/orpc/orpc.tanstack-query.md)

### Error Handling

- **General Errors**: [docs/orpc/orpc.error-handling.md](../../docs/orpc/orpc.error-handling.md)
- **Client Errors**: [docs/orpc/orpc.client-error-handling.md](../../docs/orpc/orpc.client-error-handling.md)
- **Validation Errors**: [docs/orpc/orpc.validation-errors.md](../../docs/orpc/orpc.validation-errors.md)

### OpenAPI

- **OpenAPI Handler**: [docs/orpc/orpc.openapi-handler.md](../../docs/orpc/orpc.openapi-handler.md)
- **OpenAPI Specification**: [docs/orpc/orpc.openapi-specification.md](../../docs/orpc/orpc.openapi-specification.md)
- **Scalar Integration**: [docs/orpc/orpc.openapi.scalar.md](../../docs/orpc/orpc.openapi.scalar.md)

### Advanced Topics

- **SSR Optimization**: [docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md](../../docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md)
- **Dual Setup**: [docs/orpc/DUAL-SETUP.md](../../docs/orpc/DUAL-SETUP.md)
- **TanStack Query Prefetching**: `/docs/tanstack-react-query/ssr.md`, `advanced-ssr.md`, `hydration.md`

---

## Official Resources

- Official docs: https://orpc.dev/docs

---

## Application-Specific Pattern: Dual Client Setup

This repository uses a **dual client setup** to avoid HTTP self-calls during SSR.

### The Problem

In Next.js App Router, server components run on the server. If they make HTTP calls to the same server (e.g., `fetch("http://localhost:3000/api/rpc")`), this:

- Adds unnecessary network overhead
- Can fail if the server isn't fully started
- Breaks in serverless/edge environments

### The Solution

**Two separate clients**:

| Client             | Environment      | Transport                        | Initialized In           |
| ------------------ | ---------------- | -------------------------------- | ------------------------ |
| **Server client**  | Server (SSR)     | Direct procedure calls (no HTTP) | `src/instrumentation.ts` |
| **Browser client** | Client (browser) | HTTP via `/api/rpc`              | Lazy-loaded on demand    |

### File Responsibilities

```
src/instrumentation.ts          # Initializes server client FIRST
src/lib/orpc/client.server.ts   # Server-side client (direct calls)
src/lib/orpc/client.browser.ts  # Browser client (HTTP transport)
src/lib/orpc/orpc.ts            # Unified export (auto-detects environment)
```

### How It Works

The **unified export** (`src/lib/orpc/orpc.ts`) automatically detects the environment:

```typescript
// src/lib/orpc/orpc.ts
export const orpc =
  typeof window === "undefined"
    ? globalThis.$client // Server: Direct calls
    : browserClient; // Client: HTTP calls
```

### ⚠️ CRITICAL CONSTRAINT

**Never reorder imports in `src/instrumentation.ts`**

The server-side client **must** be imported before any code that uses it. Breaking this order causes SSR to fail.

**Verification**: Check that `globalThis.$client` exists before SSR starts.

---

## Common Patterns

### Creating a New Procedure

```typescript
// src/lib/orpc/procedures/projects.ts
import { z } from "zod";
import { base } from "../context";
import { db } from "@/lib/drizzle";
import { projects } from "@/lib/drizzle/schema";

export const listProjects = base
  .input(
    z.object({
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    }),
  )
  .handler(async ({ input }) => {
    return await db
      .select()
      .from(projects)
      .limit(input.limit)
      .offset(input.offset);
  });
```

### Adding to Router

```typescript
// src/lib/orpc/router.ts
import { os } from "@orpc/server";
import { listProjects } from "./procedures/projects";

export const router = os.router({
  projects: {
    list: listProjects,
    // ... other project procedures
  },
});
```

### Calling from Server Component

```typescript
// src/app/[locale]/projects/page.tsx
import { orpc } from "@/lib/orpc/orpc";

export default async function ProjectsPage() {
  const projects = await orpc.projects.list({ limit: 10 });

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### Calling from Client Component

```typescript
// src/components/ProjectList.tsx
"use client";
import { orpc } from "@/lib/orpc/orpc";

export function ProjectList() {
  const { data: projects, isLoading } = orpc.projects.list.useQuery({
    limit: 10,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### Prefetching for SSR Hydration

```typescript
// src/app/[locale]/projects/page.tsx
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/tanstack-query/server";
import { orpc } from "@/lib/orpc/orpc";

export default async function ProjectsPage() {
  const queryClient = getQueryClient();

  // Prefetch on server (direct call, no HTTP)
  await queryClient.prefetchQuery({
    queryKey: orpc.projects.list.getQueryKey(),
    queryFn: () => orpc.projects.list({ limit: 10 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectListClient />
    </HydrationBoundary>
  );
}
```

---

## Protected Procedures (Authentication)

### Using Middleware

```typescript
// src/lib/orpc/middleware.ts
import { base } from "./context";
import { auth } from "@/lib/better-auth";

export const requireAuth = base.middleware(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return next({ user: session.user });
});
```

### Applying to Procedure

```typescript
// src/lib/orpc/procedures/projects.ts
import { requireAuth } from "../middleware";

export const createProject = requireAuth
  .input(
    z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { user } = context; // Available from middleware

    return await db.insert(projects).values({
      ...input,
      ownerId: user.id,
    });
  });
```

---

## Common Tasks

| Task                           | Implementation                                                |
| ------------------------------ | ------------------------------------------------------------- |
| **Add new procedure**          | Create in `src/lib/orpc/procedures/`, register in `router.ts` |
| **Add protected procedure**    | Use `requireAuth` middleware                                  |
| **Call from server component** | `await orpc.procedure()` (direct call)                        |
| **Call from client component** | `orpc.procedure.useQuery()` (TanStack Query)                  |
| **Prefetch for SSR**           | Use `queryClient.prefetchQuery()` in server component         |
| **Handle validation errors**   | Use Zod schema in `.input()`                                  |
| **Add error handling**         | Throw errors in handler, catch in client                      |

---

## File Locations

| Purpose                 | Location                               |
| ----------------------- | -------------------------------------- |
| **Procedures**          | `src/lib/orpc/procedures/`             |
| **Router**              | `src/lib/orpc/router.ts`               |
| **Middleware**          | `src/lib/orpc/middleware.ts`           |
| **Context**             | `src/lib/orpc/context.ts`              |
| **Server client**       | `src/lib/orpc/client.server.ts`        |
| **Browser client**      | `src/lib/orpc/client.browser.ts`       |
| **Unified export**      | `src/lib/orpc/orpc.ts`                 |
| **HTTP adapter**        | `src/app/api/rpc/[[...rest]]/route.ts` |
| **Implementation docs** | `src/lib/orpc/README.md`               |

---

## For More Details

- **Comprehensive oRPC docs**: `/docs/orpc/`
- **TanStack Query SSR**: `/docs/tanstack-react-query/`
- **Better Auth integration**: `.github/instructions/better-auth.instructions.md`
- **Architecture overview**: `.github/instructions/architecture.instructions.md`
