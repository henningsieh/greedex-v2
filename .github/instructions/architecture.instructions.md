---
name: "Architecture Overview"
description: "System design, critical patterns, and file organization"
applyTo: "src/**/*.{ts,tsx}"
---

# Architecture Overview

This document describes the system architecture, critical patterns, and file organization.

---

## Technology Stack

| Layer          | Technology               | Location               | Notes                                    |
| -------------- | ------------------------ | ---------------------- | ---------------------------------------- |
| Frontend       | Next.js 16 + React 19    | `src/app/`             | App Router with Server/Client Components |
| API            | oRPC                     | `src/lib/orpc/`        | Type-safe RPC with HTTP adapter          |
| Authentication | Better Auth              | `src/lib/better-auth/` | Session-based auth with organizations    |
| Database       | Drizzle ORM + Postgres   | `src/lib/drizzle/`     | Migrations in `migrations/`              |
| Real-time      | Socket.IO                | `src/socket-server.ts` | Separate process (manual start only)     |
| Email          | React Email + Nodemailer | `src/lib/email/`       | Transactional email templates            |
| i18n           | next-intl                | `src/lib/i18n/`        | Multi-language support                   |
| UI Components  | shadcn/ui                | `src/components/ui/`   | Radix + Tailwind CSS                     |
| Formatting     | Oxc                      | `.oxfmtrc.json`        | See `docs/oxc/oxfmt`                     |
| Linting        | Oxc                      | `.oxlintrc.json`       | See `docs/oxc/oxlint`                    |
| Testing        | Vitest                   | `src/__tests__/`       | Unit/integration tests                   |

---

## Critical Pattern: SSR Client Split

**Problem**: In SSR contexts, we can't make HTTP calls back to the same server (self-referential calls).

**Solution**: Dual oRPC client setup:

- **Server-side client**: Direct procedure calls (no HTTP), initialized in `src/instrumentation.ts`
- **Client-side client**: HTTP transport via `/api/rpc`

### File Responsibilities

```
src/instrumentation.ts          # Initializes server client FIRST
src/lib/orpc/client.server.ts   # Server-side client (direct calls)
src/lib/orpc/client.browser.ts  # Browser client (HTTP)
src/lib/orpc/orpc.ts            # Unified export (auto-detects environment)
```

### ⚠️ CRITICAL CONSTRAINT

**Never reorder imports in `src/instrumentation.ts`**

The server-side client must be imported **before** any code that uses it. If the order changes, SSR will attempt HTTP self-calls and fail.

**Key files that depend on this:**

- `src/app/` (Server Components)
- `src/lib/orpc/procedures.ts` (oRPC handlers)
- Any server-side prefetching code

**Verification**: Check that `globalThis.$client` exists before SSR starts.

---

## Common Changes by Task

| What You're Doing       | Where to Edit                | Key Files                                         |
| ----------------------- | ---------------------------- | ------------------------------------------------- |
| Add API endpoint        | `src/lib/orpc/`              | Register in `router.ts`                           |
| Add protected procedure | `src/lib/orpc/middleware.ts` | Use `requireAuth` middleware                      |
| Database schema change  | `src/lib/drizzle/schema/`    | Run `pnpm run db:generate`, `pnpm run db:migrate` |
| Add auth hook           | `src/lib/better-auth/`       | Configure in `auth.ts`                            |
| Add socket event        | `src/socket-server.ts`       | Define handler + emit pattern                     |
| Add UI component        | `src/components/ui/`         | Use `bunx shadcn@latest add <name>`               |
| Add translation         | `messages/<locale>/*.json`   | Follow namespace structure                        |
| Add email template      | `src/lib/email/templates/`   | Use React Email components                        |
| Add questionnaire step  | `src/features/participate/`  | See `docs/participate/flow.md`                    |

---

## Project Structure Deep Dive

```
greedex-calculator/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── [locale]/              # Internationalized routes
│   │   ├── api/
│   │   │   ├── auth/[...all]/     # Better Auth endpoints
│   │   │   └── rpc/[[...rest]]/   # oRPC HTTP adapter
│   │   └── (auth)/                # Route groups
│   │
│   ├── lib/                        # Core libraries
│   │   ├── better-auth/           # Authentication config
│   │   ├── drizzle/               # Database ORM
│   │   ├── email/                 # Email templates
│   │   ├── i18n/                  # Internationalization
│   │   └── orpc/                  # API procedures
│   │       ├── procedures/        # Individual procedures
│   │       ├── router.ts          # Main router
│   │       ├── middleware.ts      # Auth/validation middleware
│   │       ├── client.server.ts   # Server-side client
│   │       ├── client.browser.ts  # Browser client
│   │       └── orpc.ts            # Unified export
│   │
│   ├── components/                 # React components
│   │   ├── ui/                    # shadcn components
│   │   └── ...                    # Feature components
│   │
│   ├── features/                   # Feature modules
│   │   ├── participate/           # Questionnaire feature
│   │   └── projects/              # Project management
│   │
│   ├── hooks/                      # Custom React hooks
│   ├── config/                     # App configuration
│   ├── __tests__/                  # Test files
│   ├── instrumentation.ts          # Next.js instrumentation (SSR client init)
│   └── env.ts                      # Environment validation
│
├── docs/                           # Comprehensive documentation
├── messages/                       # i18n translation files
├── migrations/                     # Database migrations
├── public/                         # Static assets
└── scripts/                        # Utility scripts
```

---

## Data Flow Patterns

### Server Component → Data Fetching

```typescript
// src/app/[locale]/projects/page.tsx
import { orpc } from "@/lib/orpc/orpc"; // Server-side client

export default async function ProjectsPage() {
  const projects = await orpc.projects.list(); // Direct call (no HTTP)
  return <ProjectList projects={projects} />;
}
```

### Client Component → Data Fetching with TanStack Query

```typescript
// src/components/ProjectList.tsx
"use client";
import { orpc } from "@/lib/orpc/orpc"; // Browser client

export function ProjectList() {
  const { data: projects } = orpc.projects.list.useQuery(); // HTTP call
  return <div>{/* ... */}</div>;
}
```

### SSR Prefetch → Hydration

```typescript
// src/app/[locale]/projects/page.tsx
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/tanstack-query/server";
import { orpc } from "@/lib/orpc/orpc";

export default async function ProjectsPage() {
  const queryClient = getQueryClient();

  // Prefetch on server (direct call)
  await queryClient.prefetchQuery({
    queryKey: orpc.projects.list.getQueryKey(),
    queryFn: () => orpc.projects.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectListClient />
    </HydrationBoundary>
  );
}
```

---

## Key Constraints & Gotchas

| Constraint             | Reason                                         | Impact                                     |
| ---------------------- | ---------------------------------------------- | ------------------------------------------ |
| ESM-only               | `package.json` has `"type": "module"`          | No `require()`, use `import`               |
| React Compiler enabled | `next.config.ts` has `reactCompiler: true`     | Don't disable or modify                    |
| Direct socket server   | Socket.IO runs separately                      | Must start manually for WebSocket features |
| Client import order    | `instrumentation.ts` initializes server client | Breaking order breaks SSR                  |
| Barrel file avoidance  | Performance optimization                       | Import specific paths, not `index.ts`      |

---

## For More Details

- **oRPC deep dive**: `docs/orpc/DUAL-SETUP.md`
- **SSR optimization**: `docs/orpc/Optimize-Server-Side-Rendering.SSR.md`
- **Database schema**: `src/lib/drizzle/README.md` (if exists) or `docs/database/`
- **Better Auth config**: `docs/better-auth/better-auth.options.md`
- **File organization**: Project structure is documented via this file
