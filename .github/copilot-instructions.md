# Copilot instructions for this repository

This file gives AI coding agents focused, actionable knowledge to be productive in this repo.

Project snapshot

- Framework: Next.js (App Router) under `src/app`.
- Entry server: custom Next server at `src/server.ts` (uses `next()` + `node:http` createServer).
- WebSocket POC: `socket.io` and `socket.io-client` are present in `package.json` — a proof-of-concept for Socket.IO on the custom server is intended.
- Build flow: TypeScript server is compiled to `out/server.js` (see `tsconfig.server.json`), then `next build`.
- Tooling: `biome` for lint/format; Tailwind/PostCSS for styling.

Key scripts (use these exactly)

- `npm run dev` -> `tsx src/server.ts` — runs the custom server live from source (use this to test Socket.IO locally).
- `npm run build` -> `tsc --project tsconfig.server.json && next build` — compile server then build Next for production.
- `npm run start` -> `cross-env NODE_ENV=production node out/server.js` — run compiled server in production.
- `npm run lint` -> `biome check`.
- `npm run format` -> `biome format --write`.

Important patterns & conventions

- Source location: all app code lives in `src/` (e.g. `src/app`, `src/server.ts`).
- App Router: use the App Router conventions under `src/app` (update `page.tsx` or add route files under `src/app/*/route.ts`).
- Custom server: the project uses a custom server (`src/server.ts`) instead of `next dev`. The development script runs that server directly — this is where Socket.IO should be wired.
- ESM modules: `package.json` has `"type": "module"` — use ESM-style imports/exports everywhere for server code.

WebSockets / Socket.IO (POC)

- Dependencies: `socket.io` and `socket.io-client` are added to `package.json` — look for POC code in `src/server.ts` or a newly added module.
- How it's wired (pattern): attach Socket.IO to the same HTTP server returned by `createServer`:

  - create the server: `const server = createServer((req, res) => ...)`
  - attach Socket.IO: `const io = new Server(server, { /* options */ })`
  - then `server.listen(port)` so both Next and Socket.IO share the same port.

- Dev note: `npm run dev` runs `tsx src/server.ts` which executes TypeScript directly. If you add Socket.IO handlers in `src/server.ts`, they'll be active immediately under `dev`.

- Production build: when building for production `tsc --project tsconfig.server.json` must emit `out/server.js`. Ensure your Socket.IO imports are supported by the TypeScript target and ESM build.

Build & deploy notes for agents

- Respect the two-step production build: compile server (tsc with `tsconfig.server.json`) then `next build`. `npm run build` is the canonical flow.
- `npm run start` expects `out/server.js` to exist. If you rename or move the server file, update `tsconfig.server.json` `include` and `package.json` scripts.

Styling & frontend tools

- Tailwind CSS is configured (see `postcss.config.mjs` and `tailwindcss` deps). Keep Tailwind utility usage (see `src/app/page.tsx`).

Linting / formatting

- Use `biome` for linting and formatting. Run `npm run lint` and `npm run.format` before opening a PR.

Files to reference for examples

- `package.json` — scripts and deps (Socket.IO present).
- `src/server.ts` — custom server and the place to wire Socket.IO to the HTTP server.
- `tsconfig.server.json` — controls `out` and server build options.
- `next.config.ts` — `reactCompiler: true` is enabled; be cautious when modifying.
- `src/app/page.tsx` — App Router page example and styling usage.

What NOT to change without checking owner intent

- `reactCompiler: true` in `next.config.ts` and the custom server pipeline (build -> out/server.js -> start). Changing these affects the build pipeline.
- Module type: switching from ESM to CommonJS requires updates to `package.json` and may break the current server tooling (`tsx`, `tsc` config).

Troubleshooting & tips

- To test Socket.IO locally: run

```
npm run dev
```

and open the client that uses `socket.io-client` (it should connect to the same host/port as Next).

- If `out/server.js` doesn't exist after `npm run build`, re-check `tsconfig.server.json` `include` paths and ensure `tsc` emitted files (no `noEmit` override).
- When adding server-side TypeScript code that uses Node APIs, prefer Node lib targets in `tsconfig.server.json` (it currently targets `es2019`).

Questions for the repo owner (if unclear)

- Is the custom server intended to be the permanent host for WebSockets, or should Socket.IO be moved to a dedicated service/process for scaling?
- Preferred Node version / CI runner image? This helps pin `tsc` / `node` behavior for builds.

If you want I can:

- add a short Socket.IO wiring example directly to `src/server.ts` (non-breaking, behind a small feature flag), or
- add a sample `src/app/socket-client.tsx` demonstrating client usage of `socket.io-client`.
