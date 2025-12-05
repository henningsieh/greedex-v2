
# 🚨 CRITICAL: Agent Constitution 🚨

## ⚠️ ABSOLUTE REQUIREMENTS - VIOLATION PROHIBITED ⚠️

**These rules are MANDATORY for ALL automated AI agents (including Copilot-style 
agents) that interact with this repository. They are intentionally STRICT to 
prevent interference with the developer's local workflows and terminal state.**

### 🚫 FORBIDDEN COMMANDS - NEVER EXECUTE 🚫

**DEVELOPMENT SERVER:**
- ❌ **NEVER** run `bun run dev`
- ❌ **NEVER** run `npm run dev`
- ❌ **NEVER** run `yarn dev`
- ❌ **NEVER** start any development server process

**BUILD & PRODUCTION COMMANDS:**
- ❌ **NEVER** run `bun run build`
- ❌ **NEVER** run `bun run start`
- ❌ **NEVER** run `npm run build`
- ❌ **NEVER** run `npm run start`
- ❌ **NEVER** execute any build or production deployment commands

**TERMINAL SESSION MANAGEMENT:**
- ❌ **NEVER** open multiple terminal windows
- ❌ **NEVER** create new terminal sessions unnecessarily
- ✅ **ALWAYS** reuse existing terminal sessions when available

### 📋 ALLOWED COMMANDS (Limited)

Only these non-destructive commands are permitted:
- ✅ `bun run lint` - Code linting
- ✅ `bun run format` - Code formatting
- ✅ `bun run test` - Testing (if configured)
- ✅ Basic file operations and checks

### 🎯 PURPOSE

These restrictions exist because:
- **The developer maintains exclusive control** over their local development environment
- **Dev server processes** must remain under developer management
- **Build and deployment** are manual developer decisions
- **Terminal state** must remain predictable and stable

### ⚡ WORKFLOW INTEGRATION

Agents may:
- ✅ Make code edits and file changes
- ✅ Run static analysis (lint, format)
- ✅ Suggest commands for the developer to run manually
- ✅ Perform non-destructive checks

Agents must:
- ❌ Never interfere with running processes
- ❌ Never change the developer's environment state unexpectedly
- ❌ Never assume control of development workflow

### 🚨 CONSEQUENCES OF VIOLATION

**Breaking these rules will:**
- Disrupt the developer's active development session
- Create unpredictable terminal state
- Potentially break ongoing work
- Violate the trust relationship with the developer

**Remember: The developer is always in control. Agents are assistants, not controllers.**

---

# Copilot instructions for this repository

Concise, actionable guidance to get AI agents productive quickly in this codebase.

Project snapshot

- Framework: Next.js (App Router) under `src/app` (Next 16, React 19).
- WebSockets: Socket.IO runs as a separate service in `src/socket-server.ts` (decoupled from Next.js to prevent memory leaks during development).
- RPC / API layer: oRPC is used for a type-safe RPC surface. The oRPC route handler is at `src/app/api/rpc/[[...rest]]/route.ts` and the router/client lives under `src/lib/orpc`.
- Auth: Better Auth is configured under `src/lib/better-auth` and exposed via `src/app/api/auth/[...all]/route.ts`.
- Database: Drizzle ORM + PostgreSQL; schema, migrations and DB config are under `src/lib/drizzle`.
- Build flow: Standard Next.js build process (`next build` then `next start`).
- Tooling: `biome` for lint/format, Tailwind/PostCSS for styling, `vitest` for tests.

Key scripts (execute exactly as listed)

- `bun run dev` — runs `concurrently "next dev -p 3000" "tsx watch src/socket-server.ts"` (Next.js + Socket.IO in parallel processes).
- `bun run build` — `next build` (standard Next.js build).
- `bun run start` — `concurrently "next start" "cross-env NODE_ENV=production tsx src/socket-server.ts"` (Next.js + Socket.IO in parallel processes).
- `bun run lint` / `bun run format` — `biome` commands.
- `bun run test` / `bun run test:run` / `bun run test:coverage` — `vitest` test commands.

Important patterns & conventions

- Source tree: all app code is under `src/` (App Router, components, API routes, server). Favor ESM imports (`package.json` sets `type: "module"`).
- App Router usage: use `src/app/*` routes and `page.tsx`/`layout.tsx` files. Server-only code and Node APIs belong in `src/socket-server.ts` or files only imported by it.

oRPC / API layer

- Entry: `src/app/api/rpc/[[...rest]]/route.ts` — exposes the oRPC handler for all RPC calls under `/api/rpc/*`.
- Server router & client: `src/lib/orpc/*` — contains `router.ts`, `client.ts` (unified client that uses a server-side client during SSR and an HTTP client in the browser), `middleware.ts` and `context.ts` for Better Auth integration.
- SSR optimization: `client.server.ts` (or `lib/orpc.server.ts`) is imported during server startup (see `src/instrumentation.ts` and `src/app/layout.tsx`) to initialize `globalThis.$client` so server-side code can call procedures without HTTP overhead.

WebSockets / Socket.IO (how to integrate)

- Pattern: Socket.IO runs as a separate service in `src/socket-server.ts` (decoupled from Next.js to prevent memory leaks during development).
- Dev workflow: modify `src/socket-server.ts` and run `bun run dev` (tsx executes TypeScript directly). Handlers added to `io` are live during development.
- Production: Socket.IO runs in parallel with Next.js using `concurrently`.

Authentication, DB, and cross-cutting integrations

- Better-Auth integration: configuration and helpers live under `src/lib/better-auth` (see `src/lib/better-auth/index.ts`). The Next.js API route `src/app/api/auth/[...all]/route.ts` mounts the Better Auth handler.
- Drizzle (DB): DB config, schema and migrations live under `src/lib/drizzle` and `src/lib/drizzle/migrations`.
- Email: Nodemailer helpers and templates are under `src/lib/email` and invoked from Better Auth hooks.

Files to reference (quick links)

- `src/socket-server.ts` — Socket.IO server (runs separately from Next.js).
- `src/app/api/rpc/[[...rest]]/route.ts` — oRPC route handler (all RPC calls).
- `src/lib/orpc/` — router, client, middleware, and README describing SSR optimization.
- `src/lib/better-auth/index.ts` — Better Auth configuration and plugins (organization plugin, hooks).
- `src/lib/drizzle/` — DB config, schema, migrations.
- `src/instrumentation.ts` — place to import server-only instrumentation (e.g., `lib/orpc.server`).
- `package.json` — scripts and dependencies (important: `dev`, `build`, `start`, `auth:generate`).
- `next.config.ts` — `reactCompiler: true` enabled; changing it impacts builds.

Note about client-side animated components and locale switching:

- When using cookie-based locale switching together with `router.refresh()` to re-render server components on the client, some client-side animated components (for example `TextEffect` which uses AnimatePresence / motion) will not re-run their entrance animations unless they are remounted. To ensure smooth language switching without a full page reload, key the parent animated container by the current locale (for example: `key={`hero-content-${locale}`}`). This forces an unmount/remount on locale change so animations and other client-only initialization run again.

What NOT to change without asking owner

- `reactCompiler: true` in `next.config.ts`.
- `type: "module"` in `package.json` — switching to CommonJS breaks `tsx`/`tsc` ESM expectations.

Agent tasks and quick wins

- If adding Socket.IO, edit `src/socket-server.ts` and test with `bun run dev`.
- For oRPC changes: add procedures under `src/lib/orpc/procedures.ts` (or split per domain), update `src/lib/orpc/router.ts` and the route handler will pick them up.
- Run `bun run lint` and `bun run format` before PRs.

Troubleshooting tips

- If SSR oRPC calls fail, ensure `src/instrumentation.ts` imports the server client initializer (e.g., `src/lib/orpc/client.server.ts`) before other server code.

Testing & QA

- Unit & integration tests: `vitest` configured — run `bun run test` or `bun run test:run` for CI-friendly runs.
- UI tests: `bun run test:ui` to open the Vitest UI.

Deployment notes

- Recommended: Vercel for frontend; keep an eye on custom server needs (Socket.IO runs as separate service). For full custom server deployments, run the `bun run build` step in CI and `bun run start` on the target host.

Troublesome changes to avoid

- Do not integrate Socket.IO back into a custom Next.js server without updating the build/start pipeline — the repository relies on decoupled services to prevent memory leaks.

If you'd like, I can:

- add a minimal Socket.IO wiring example to `src/server.ts` (feature-flagged / non-breaking), or
- add a client example `src/app/socket-client.tsx` that connects with `socket.io-client`, or
- add a short PR that wires `src/instrumentation.ts` to initialize the oRPC server client for SSR.

# Active Technologies
- TypeScript 5.x with Next.js 16 (App Router) + Better Auth (organization plugin), React 19, nuqs (URL state), shadcn/ui, Drizzle ORM, Zod
- oRPC (`@orpc/server`, `@orpc/client`) for a type-safe RPC layer; server-side client is initialized for SSR optimization in `src/lib/orpc`.

## Recent Changes / Notes
- The codebase added an oRPC layer with `src/app/api/rpc/[[...rest]]/route.ts` and `src/lib/orpc` to support server-side RPC during SSR and type-safe client calls.
- Socket.IO has been decoupled from Next.js and runs as a separate service in `src/socket-server.ts` to prevent memory leaks during development.
