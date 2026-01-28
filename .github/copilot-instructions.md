# Agent Instructions

**Greedex Calculator** — A Next.js 16 app for carbon footprint calculations with organization management, questionnaires, and internationalization.

---

## 🚨 Critical Rules

### Forbidden Commands

Never execute commands that start processes or builds:

- `pnpm run dev`, `pnpm run build`, `pnpm run start`
- `npm run dev`, `yarn dev`, or any dev server
- Background processes or new terminal sessions
- `git push --force`, `git reset --hard`, or destructive git operations

### Allowed Commands

- **Linting/Formatting**: `pnpm run lint`, `pnpm run format`
- **Testing**: `pnpm run test`, `pnpm run test:run`, `pnpm run test:coverage`
- **Git (read-only + commits)**: `git status`, `git log`, `git diff`, `git add`, `git commit`, `git checkout -b`
- **Static analysis**: File reads, searches, code inspection

---

## Essential Context

| What                 | Value                 | Notes                              |
| -------------------- | --------------------- | ---------------------------------- |
| **Package Manager**  | `bun`                 | Use bun for all installs/scripts   |
| **Node Modules**     | ESM only              | `"type": "module"` in package.json |
| **Linter/Formatter** | Oxc                   | See `docs/oxc/` for standards      |
| **Test Runner**      | Vitest                | Tests in `src/__tests__/`          |
| **Framework**        | Next.js 16 + React 19 | App Router, React Compiler enabled |

### Architecture Layers

| Layer              | Location               | Entry Point                            |
| ------------------ | ---------------------- | -------------------------------------- |
| Next.js App Router | `src/app/`             | `page.tsx`/`layout.tsx` patterns       |
| oRPC API           | `src/lib/orpc/`        | `src/app/api/rpc/[[...rest]]/route.ts` |
| Better Auth        | `src/lib/better-auth/` | `src/app/api/auth/[...all]/route.ts`   |
| Database           | `src/lib/drizzle/`     | Drizzle ORM, Postgres                  |
| Socket.IO          | `src/socket-server.ts` | Manual start only                      |

**⚠️ Critical**: The server-side oRPC client is initialized in `src/instrumentation.ts` and attached to `globalThis.$client`. **Never reorder imports in this file** — SSR breaks if the client isn't initialized first.

---

## When Working on Features

### Documentation-First Approach

1. **Check** `/docs/README.md` for the topic index
2. **Read** relevant docs in `/docs/<topic>/` before implementing
3. **Reference** detailed agent guidance below only if needed

### Quick Navigation via Instruction Files

VS Code will auto-apply instruction files from `.github/instructions/` based on the file type being edited:

| Instruction File                 | Context                                         | Auto-Applied To               |
| -------------------------------- | ----------------------------------------------- | ----------------------------- |
| `architecture.instructions.md`   | System design, SSR patterns, file locations     | `.ts`, `.tsx` files in `src/` |
| `code-standards.instructions.md` | TypeScript, React, async/await best practices   | All source files              |
| `conventions.instructions.md`    | Project setup, linting, git workflow            | All files                     |
| `quick-start.instructions.md`    | Task-based learning paths                       | All files                     |
| `better-auth.instructions.md`    | Auth patterns, oRPC SSR integration             | Auth-related files            |
| `i18n.instructions.md`           | Locale routing, translations, country selection | i18n and locale files         |
| `orpc.instructions.md`           | API procedures, routers, middleware, SSR        | oRPC and API files            |
| `shadcn.instructions.md`         | UI components, forms, accessibility             | UI component files            |

For primary documentation references, also consult:

| Task                              | Primary Documentation                                 |
| --------------------------------- | ----------------------------------------------------- |
| API endpoints, procedures         | `docs/orpc/QUICKSTART.md` → `docs/orpc/DUAL-SETUP.md` |
| Authentication, organizations     | `docs/better-auth/`                                   |
| UI components, forms              | `docs/shadcn/`                                        |
| Internationalization              | `docs/i18n/`                                          |
| Database schema, migrations       | `docs/database/`                                      |
| Questionnaire flows, calculations | `docs/participate/`                                   |
| Permissions, access control       | `docs/projects/permissions.md`                        |
| Email templates                   | `docs/react-email/`                                   |
| Code standards, linting           | `docs/oxc/`                                           |

---

## Agent Checklist

Before submitting work:

- [ ] No forbidden commands were executed
- [ ] `src/instrumentation.ts` import ordering preserved
- [ ] Tests updated for changed functionality
- [ ] `pnpm run format && pnpm run lint` executed and passing
- [ ] Documentation consulted before integration changes (use `.github/instructions/` files)
- [ ] Git commits are focused and well-described

**The developer is always in control. Agents are assistants, not controllers.**
