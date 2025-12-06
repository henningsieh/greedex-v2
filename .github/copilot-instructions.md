
# 🚨 CRITICAL: Agent Constitution 🚨

## ⚠️ ABSOLUTE REQUIREMENTS - VIOLATION PROHIBITED ⚠️

**These rules are MANDATORY for ALL automated AI agents (including Copilot-style 
agents) that interact with this repository. They are intentionally STRICT to 
prevent interference with the developer's local workflows and terminal state.**
```instructions
# 🚨 CRITICAL: Agent Constitution (short) 🚨

These rules are MANDATORY for ALL automated AI agents interacting with this repo. They protect the developer's local environment and running processes.

Forbidden (never run):
- `bun run dev`, `npm run dev`, `yarn dev` (do not start dev servers)
- `bun run build`, `bun run start`, `npm run build`, `npm run start` (no build/start)
- Opening new terminal sessions or starting background processes

Allowed (non-destructive):
- `bun run lint`, `bun run format` (biome)
- `bun run test` / `bun run test:run` / `bun run test:coverage` (vitest)
- Read/write file edits, static analysis, and suggested shell commands (do not execute forbidden commands)

Core project snapshot (quick):
- Next.js App Router in `src/app` (Next 16, React 19). Use `page.tsx` / `layout.tsx` patterns.
- Socket.IO runs as a separate process in `src/socket-server.ts` (decoupled from Next.js).
- oRPC layer under `src/lib/orpc` with HTTP adapter at `src/app/api/rpc/[[...rest]]/route.ts`.
- Better Auth integration under `src/lib/better-auth` and mounted at `src/app/api/auth/[...all]/route.ts`.
- Database: Drizzle ORM in `src/lib/drizzle` (Postgres migrations live under `migrations`).

Important conventions and gotchas:
- Keep ESM: `package.json` uses `type: "module"` — do not convert to CommonJS.
- Do not change `reactCompiler: true` in `next.config.ts` without approval.
- SSR optimization: server-side oRPC client is initialized via `src/instrumentation.ts` (look for `client.server` imports and `globalThis.$client`). Ensure imports preserve initialization order.
- Socket handlers belong in `src/socket-server.ts` (modify that file for real-time features). The dev workflow for running both Next + socket is manual—agents must not start it.

Where to make common changes:
- Add oRPC procedures: `src/lib/orpc/procedures.ts` (or split by domain) and register in `src/lib/orpc/router.ts`.
- Auth hooks & email: `src/lib/better-auth/*` (Better Auth + Nodemailer templates in `src/lib/email`).
- DB schema/migrations: `src/lib/drizzle`.

Quick examples (what you might edit):
- To add an RPC: create `src/lib/orpc/yourFeature.ts` exporting handlers, then import in `src/lib/orpc/router.ts`.
- To add a socket event: update `src/socket-server.ts` and export any helper utilities under `src/components/socket` if you need a client abstraction.

Testing & formatting:
- Run `bun run lint` and `bun run format` before opening PRs.
- Run unit tests with `bun run test`. Use `vitest` config in `vitest.config.ts` for details.

Agent behavior checklist (must follow):
1. Do not start dev/build/start processes. Always ask before running any terminal command not listed as allowed.
2. Prefer small, focused edits; update relevant tests.
3. Preserve `src/instrumentation.ts` ordering for SSR init of orpc client.
4. When in doubt, add a clear PR description and testing steps (suggest commands for developer to run locally).

Key files to reference:
- `src/socket-server.ts`
- `src/app/api/rpc/[[...rest]]/route.ts`
- `src/lib/orpc/` (router, client, middleware)
- `src/lib/better-auth/index.ts`
- `src/lib/drizzle/`
- `src/instrumentation.ts`
- `package.json`, `next.config.ts`, `vitest.config.ts`, `biome.json`

Docs Quickmap (high-value docs to read first):
- `docs/README.md`: repository documentation index and TOC.
- `docs/orpc/`: oRPC integration guides — read `orpcNextjs.adapter.md`, `orpc.procedure.md`, and `orpc.router.md` to understand server/client patterns and SSR prefetching.
- `docs/better-auth/`: Better Auth integration notes and examples (`better-auth.options.md`, `better-auth.organizations.md`, `better-auth.credentials.email_password.md`). Use for auth hooks and organization flows.
- `docs/shadcn/`: UI component patterns and accessible field components (`shadcn-ui.new-field.documentation.md`).
- `docs/i18n/`: `next-intl` integration and locale handling (`next-intl.internationalization.md`). Helpful for server vs client locale decisions.
- `docs/react-email/`: email templates and Nodemailer usage for Better Auth flows (`use-Nodemailer.md`, `setup-React_Email.md`).
- `docs/participate/`: domain-specific flows and testing guidelines for questionnaire/flows used in the app.
- `docs/permissions/README.md`: permissions and access control design notes.

If anything here is unclear or you'd like a longer example (socket wiring, client example, or SSR orpc initializer PR), tell me which area to expand and I'll update this file.
```
**Remember: The developer is always in control. Agents are assistants, not controllers.**
