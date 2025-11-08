# Copilot instructions for this repository

Concise, actionable guidance to get AI agents productive quickly in this codebase.

Project snapshot

- Framework: Next.js (App Router) under `src/app`.
- Custom server: `src/server.ts` uses `next()` + Node `createServer` and is the canonical place to attach server-side services (Socket.IO, custom HTTP handlers).
- WebSockets: `socket.io` + `socket.io-client` are dependencies — a POC is intended to run on the custom server.
- Build flow: server TypeScript is compiled to `out/server.js` via `tsc --project tsconfig.server.json`, then `next build` runs. See `package.json` scripts.
- Tooling: `biome` for lint/format, Tailwind/PostCSS for styling, Drizzle for DB tooling.

Key scripts (execute exactly as listed)

- `bun run dev` — runs `tsx watch src/server.ts` (dev server + Next in same process). Use this when working on Socket.IO or server code.
- `bun run build` — `tsc --project tsconfig.server.json && next build` (compile server to `out/` then build Next).
- `bun run start` — `cross-env NODE_ENV=production node out/server.js` (expects compiled server in `out/server.js`).
- `bun run lint` / `bun run format` — `biome` commands.

Important patterns & conventions

- Source tree: all app code is under `src/` (App Router, components, API routes, server). Favor ESM imports (`package.json` sets `type: "module"`).
- Custom server is authoritative: deploy uses compiled `out/server.js`. Do not rely on `next dev` for local behavior — `bun run dev` runs the custom server.
- App Router usage: use `src/app/*` routes and `page.tsx` files. Server-only code and Node APIs belong in `src/server.ts` or in files only imported by it.

WebSockets / Socket.IO (how to integrate)

- Pattern: create the HTTP server, pass it to Next and then attach Socket.IO. Example pattern (in `src/server.ts`):

  const server = createServer((req, res) => nextHandler(req, res));
  const io = new Server(server, options);
  server.listen(PORT);

- Dev workflow: modify `src/server.ts` and run `bun run dev` (tsx executes TypeScript directly). Handlers added to `io` will be live during development.
- Production: ensure `tsc` emits `out/server.js` (check `tsconfig.server.json` include paths) so `bun run start` can run produced file.

Auth, DB, and cross-cutting integrations

- Better-Auth integration: configuration and small helpers live under `src/lib/better-auth` (see `src/lib/better-auth/index.ts`). The API route for auth is `src/app/api/auth/[...all]/route.ts`.
- Drizzle (DB): DB config and schema code live under `src/lib/drizzle` and migrations are under `src/lib/drizzle/migrations`.

Files to reference (quick links)

- `src/server.ts` — custom server wiring (Next + Socket.IO).
- `package.json` — scripts and dependencies (important: `dev`, `build`, `start`, `auth:generate`).
- `tsconfig.server.json` — controls emitted `out/` server build.
- `next.config.ts` — `reactCompiler: true` is enabled; changing it impacts builds.
- `src/lib/better-auth/index.ts` — Better-Auth config referenced by CLI script.

What NOT to change without asking owner

- `reactCompiler: true` in `next.config.ts` and the two-step server build / start pipeline (`tsc` -> `next build` -> `node out/server.js`).
- `type: "module"` in `package.json` — switching to CommonJS breaks `tsx`/`tsc` ESM expectations.

Agent tasks and quick wins

- If adding Socket.IO, edit `src/server.ts` and test with `bun run dev`.
- When adding server TS code, ensure it compiles under `tsc --project tsconfig.server.json`.
- Run `bun run lint` and `bun run format` before PRs.

Troubleshooting tips

- If `out/server.js` is missing after `bun run build`, check `tsconfig.server.json` include globs and confirm `tsc` emitted files (no `noEmit`).
- For Node APIs on server, make sure the TS lib targets in `tsconfig.server.json` are appropriate (the project targets modern ES/Node libs).

Questions for repo owner (if unclear)

- Should WebSocket scale out of process (separate service) or remain on the custom server for this project?
- Preferred Node version / CI image for consistent `tsc`/`node` behavior?

If you'd like, I can:

- add a minimal Socket.IO wiring example to `src/server.ts` (feature-flagged / non-breaking), or
- add a client example `src/app/socket-client.tsx` that connects with `socket.io-client`.

## Active Technologies
- TypeScript 5.x with Next.js 16 (App Router) + Better Auth (organization plugin), React 19, nuqs (URL state), shadcn/ui, Drizzle ORM, Zod (001-org-registration)
- PostgreSQL via Drizzle ORM (schema already includes organization, member, invitation tables) (001-org-registration)

## Recent Changes
- 001-org-registration: Added TypeScript 5.x with Next.js 16 (App Router) + Better Auth (organization plugin), React 19, nuqs (URL state), shadcn/ui, Drizzle ORM, Zod
