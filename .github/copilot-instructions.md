# Copilot instructions for this repository

Concise, actionable guidance to get AI agents productive quickly in this codebase.

Project snapshot

- Framework: Next.js (App Router) under `src/app` (Next 16, React 19).
- Custom server: `src/server.ts` creates a Node `http` server and mounts Next's handler — this is the canonical place to attach server-side services (Socket.IO, custom HTTP handlers, instrumentation).
- WebSockets: `socket.io` + `socket.io-client` are included; a Socket.IO POC lives in `src/server.ts`.
- RPC / API layer: oRPC is used for a type-safe RPC surface. The oRPC route handler is at `src/app/api/rpc/[[...rest]]/route.ts` and the router/client lives under `src/lib/orpc`.
- Auth: Better Auth is configured under `src/lib/better-auth` and exposed via `src/app/api/auth/[...all]/route.ts`.
- Database: Drizzle ORM + PostgreSQL; schema, migrations and DB config are under `src/lib/drizzle`.
- Build flow: server TypeScript is compiled to `out/server.js` via `tsc --project tsconfig.server.json`, then `next build` runs. See `package.json` scripts.
- Tooling: `biome` for lint/format, Tailwind/PostCSS for styling, `vitest` for tests.

Key scripts (execute exactly as listed)

- `bun run dev` — runs `tsx watch src/server.ts` (dev server + Next in same process). Use when working on Socket.IO or server code; this is the canonical local dev command.
- `bun run build` — `tsc --project tsconfig.server.json && next build` (compile server to `out/` then build Next).
- `bun run start` — `cross-env NODE_ENV=production node out/server.js` (expects compiled server in `out/server.js`).
- `bun run lint` / `bun run format` — `biome` commands.
- `bun run test` / `bun run test:run` / `bun run test:coverage` — `vitest` test commands.

Important patterns & conventions

- Source tree: all app code is under `src/` (App Router, components, API routes, server). Favor ESM imports (`package.json` sets `type: "module"`).
- Custom server is authoritative: production runs `out/server.js` produced by `tsc`. Do not rely on `next dev` for local behavior — use `bun run dev` which runs the custom server.
- App Router usage: use `src/app/*` routes and `page.tsx`/`layout.tsx` files. Server-only code and Node APIs belong in `src/server.ts` or files only imported by it.

oRPC / API layer

- Entry: `src/app/api/rpc/[[...rest]]/route.ts` — exposes the oRPC handler for all RPC calls under `/api/rpc/*`.
- Server router & client: `src/lib/orpc/*` — contains `router.ts`, `client.ts` (unified client that uses a server-side client during SSR and an HTTP client in the browser), `middleware.ts` and `context.ts` for Better Auth integration.
- SSR optimization: `client.server.ts` (or `lib/orpc.server.ts`) is imported during server startup (see `src/instrumentation.ts` and `src/app/layout.tsx`) to initialize `globalThis.$client` so server-side code can call procedures without HTTP overhead.

WebSockets / Socket.IO (how to integrate)

- Pattern: create the HTTP server, pass it to Next and then attach Socket.IO. See `src/server.ts` for the reference implementation.
- Dev workflow: modify `src/server.ts` and run `bun run dev` (tsx executes TypeScript directly). Handlers added to `io` are live during development.
- Production: ensure `tsc` emits `out/server.js` (check `tsconfig.server.json` include globs) so `bun run start` can run produced file.

Authentication, DB, and cross-cutting integrations

- Better-Auth integration: configuration and helpers live under `src/lib/better-auth` (see `src/lib/better-auth/index.ts`). The Next.js API route `src/app/api/auth/[...all]/route.ts` mounts the Better Auth handler.
- Drizzle (DB): DB config, schema and migrations live under `src/lib/drizzle` and `src/lib/drizzle/migrations`.
- Email: Nodemailer helpers and templates are under `src/lib/email` and invoked from Better Auth hooks.

Files to reference (quick links)

- `src/server.ts` — custom server wiring (Next + Socket.IO).
- `src/app/api/rpc/[[...rest]]/route.ts` — oRPC route handler (all RPC calls).
- `src/lib/orpc/` — router, client, middleware, and README describing SSR optimization.
- `src/lib/better-auth/index.ts` — Better Auth configuration and plugins (organization plugin, hooks).
- `src/lib/drizzle/` — DB config, schema, migrations.
- `src/instrumentation.ts` — place to import server-only instrumentation (e.g., `lib/orpc.server`).
- `package.json` — scripts and dependencies (important: `dev`, `build`, `start`, `auth:generate`).
- `tsconfig.server.json` — controls emitted `out/` server build.
- `next.config.ts` — `reactCompiler: true` enabled; changing it impacts builds.

Note about client-side animated components and locale switching:

- When using cookie-based locale switching together with `router.refresh()` to re-render server components on the client, some client-side animated components (for example `TextEffect` which uses AnimatePresence / motion) will not re-run their entrance animations unless they are remounted. To ensure smooth language switching without a full page reload, key the parent animated container by the current locale (for example: `key={`hero-content-${locale}`}`). This forces an unmount/remount on locale change so animations and other client-only initialization run again.

What NOT to change without asking owner

- `reactCompiler: true` in `next.config.ts` and the two-step server build / start pipeline (`tsc` -> `next build` -> `node out/server.js`).
- `type: "module"` in `package.json` — switching to CommonJS breaks `tsx`/`tsc` ESM expectations.

Agent tasks and quick wins

- If adding Socket.IO, edit `src/server.ts` and test with `bun run dev`.
- For oRPC changes: add procedures under `src/lib/orpc/procedures.ts` (or split per domain), update `src/lib/orpc/router.ts` and the route handler will pick them up.
- When adding server TS code, ensure it compiles under `tsc --project tsconfig.server.json`.
- Run `bun run lint` and `bun run format` before PRs.

Troubleshooting tips

- If `out/server.js` is missing after `bun run build`, check `tsconfig.server.json` include globs and confirm `tsc` emitted files (no `noEmit`).
- If SSR oRPC calls fail, ensure `src/instrumentation.ts` imports the server client initializer (e.g., `src/lib/orpc/client.server.ts`) before other server code.

Testing & QA

- Unit & integration tests: `vitest` configured — run `bun run test` or `bun run test:run` for CI-friendly runs.
- UI tests: `bun run test:ui` to open the Vitest UI.

Deployment notes

- Recommended: Vercel for frontend; keep an eye on custom server needs (Socket.IO + custom `out/server.js` flow). For full custom server deployments, run the `bun run build` step in CI and `bun run start` on the target host.

Troublesome changes to avoid

- Do not move `src/server.ts` behavior into Next's built-in dev server without updating the build/start pipeline — the repository relies on compiling `src/server.ts` to `out/server.js`.

If you'd like, I can:

- add a minimal Socket.IO wiring example to `src/server.ts` (feature-flagged / non-breaking), or
- add a client example `src/app/socket-client.tsx` that connects with `socket.io-client`, or
- add a short PR that wires `src/instrumentation.ts` to initialize the oRPC server client for SSR.

## Active Technologies
- TypeScript 5.x with Next.js 16 (App Router) + Better Auth (organization plugin), React 19, nuqs (URL state), shadcn/ui, Drizzle ORM, Zod
- oRPC (`@orpc/server`, `@orpc/client`) for a type-safe RPC layer; server-side client is initialized for SSR optimization in `src/lib/orpc`.

## Recent Changes / Notes
- The codebase added an oRPC layer with `src/app/api/rpc/[[...rest]]/route.ts` and `src/lib/orpc` to support server-side RPC during SSR and type-safe client calls.
- `src/server.ts` includes a Socket.IO POC — this is the recommended place for realtime server-side work.

## Agent Constitution

These rules are for automated AI agents (including Copilot-style agents) that interact with this repository during a session. They are intentionally strict to avoid interfering with a developer's existing local workflows or creating confusing terminal state.

- **Never run the dev server.** The developer always runs the dev server (`bun run dev`) locally and expects it to remain under their control; automated agents must not start or stop the dev server process.
- **Reuse a single terminal session.** Do not open several separate shell terminal windows one after another. If a terminal was opened by the agent earlier in the session, reuse that same terminal shell for subsequent commands rather than creating new terminals.

These constraints help keep the developer's environment stable and predictable while allowing the agent to make code edits, run non-destructive checks, and suggest commands for the user to run locally when needed.

