
# 🚨 CRITICAL: Agent Constitution 🚨

## ⚠️ ABSOLUTE REQUIREMENTS - VIOLATION PROHIBITED ⚠️

These rules are MANDATORY for ALL automated AI agents interacting with this repository. They protect the developer's local environment and running processes.

### Forbidden Commands (never execute)
- `bun run dev`, `npm run dev`, `yarn dev` — do not start dev servers
- `bun run build`, `bun run start`, `npm run build`, `npm run start` — no build/start
- Opening new terminal sessions or starting background processes

### Allowed Commands (non-destructive)
- `bun run lint`, `bun run format` — Biome linting/formatting
- `bun run test` / `bun run test:run` / `bun run test:coverage` — Vitest
- Read/write file edits, static analysis

---

## Architecture Overview

| Layer | Location | Notes |
|-------|----------|-------|
| Next.js App Router | `src/app/` | Next 16, React 19, `page.tsx`/`layout.tsx` patterns |
| oRPC API | `src/lib/orpc/` | HTTP adapter at `src/app/api/rpc/[[...rest]]/route.ts` |
| Better Auth | `src/lib/better-auth/` | Mounted at `src/app/api/auth/[...all]/route.ts` |
| Database | `src/lib/drizzle/` | Drizzle ORM, Postgres, migrations in `migrations/` |
| Socket.IO | `src/socket-server.ts` | Separate process, manual start only |

### SSR Client Split (Critical)
The server-side oRPC client is initialized in `src/instrumentation.ts` and attached to `globalThis.$client`. This avoids HTTP self-calls during SSR.

**Key files:**
- `src/lib/orpc/client.server.ts` — server-side client
- `src/lib/orpc/orpc.ts` — unified export (auto-switches between server/client)
- `src/instrumentation.ts` — must import `client.server.ts` first

⚠️ **Never reorder imports in `instrumentation.ts`** — SSR breaks if client isn't initialized.

---

## Common Changes

| Task | Where to edit |
|------|---------------|
| Add oRPC procedure | Create in `src/lib/orpc/`, register in `router.ts` |
| Add socket event | `src/socket-server.ts` |
| DB schema/migration | `src/lib/drizzle/` |
| Auth hooks/email | `src/lib/better-auth/`, `src/lib/email/` |
| UI components | `src/components/ui/` (shadcn) |

---

## Conventions

- **ESM only**: `package.json` has `"type": "module"` — no CommonJS
- **React Compiler**: `reactCompiler: true` in `next.config.ts` — don't change
- **Biome**: Run `bun run lint && bun run format` before PRs
- **Vitest**: Tests in `src/__tests__/`, run with `bun run test`

---

## Documentation Index

All docs are in `docs/` — the README at `docs/README.md` has the full TOC.

### Integration Instructions (`.github/instructions/`)
| File | Purpose |
|------|---------|
| `orpc.instructions.md` | oRPC procedures, routers, adapters, and TanStack Query integration |
| `better-auth.instructions.md` | Auth + oRPC SSR pattern |
| `i18n.instructions.md` | next-intl setup |
| `shadcn.instructions.md` | UI component patterns |

### Key Documentation Files
| Topic | File |
|-------|------|
| oRPC SSR optimization | `docs/orpc/orpc.Optimize-Server-Side-Rendering.SSR.md` |
| oRPC + TanStack Query | `docs/orpc/orpc.tanstack-query.md` |
| TanStack Query SSR | `docs/tanstack-query/ssr.md` |
| Advanced SSR (Server Components) | `docs/tanstack-query/advanced-ssr.md` |
| Hydration API | `docs/tanstack-query/hydration.md` |
| Better Auth options | `docs/better-auth/better-auth.options.md` |
| Organizations | `docs/better-auth/better-auth.organizations.md` |
| Permissions design | `docs/permissions/README.md` |
| Questionnaire flows | `docs/participate/` |

---

## Agent Checklist

1. ✅ Do not run dev/build/start commands
2. ✅ Ask before any terminal command not listed as allowed
3. ✅ Preserve `src/instrumentation.ts` import ordering
4. ✅ Small, focused edits with relevant test updates
5. ✅ Run `bun run lint && bun run format` on changes
6. ✅ Reference docs before making integration changes

**The developer is always in control. Agents are assistants, not controllers.**
