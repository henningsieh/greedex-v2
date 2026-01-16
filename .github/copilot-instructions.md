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

| Layer              | Location               | Notes                                                  |
| ------------------ | ---------------------- | ------------------------------------------------------ |
| Next.js App Router | `src/app/`             | Next 16, React 19, `page.tsx`/`layout.tsx` patterns    |
| oRPC API           | `src/lib/orpc/`        | HTTP adapter at `src/app/api/rpc/[[...rest]]/route.ts` |
| Better Auth        | `src/lib/better-auth/` | Mounted at `src/app/api/auth/[...all]/route.ts`        |
| Database           | `src/lib/drizzle/`     | Drizzle ORM, Postgres, migrations in `migrations/`     |
| Socket.IO          | `src/socket-server.ts` | Separate process, manual start only                    |

### SSR Client Split (Critical)

The server-side oRPC client is initialized in `src/instrumentation.ts` and attached to `globalThis.$client`. This avoids HTTP self-calls during SSR.

**Key files:**

- `src/lib/orpc/client.server.ts` — server-side client
- `src/lib/orpc/orpc.ts` — unified export (auto-switches between server/client)
- `src/instrumentation.ts` — must import `client.server.ts` first

⚠️ **Never reorder imports in `instrumentation.ts`** — SSR breaks if client isn't initialized.

---

## Common Changes

| Task                | Where to edit                                      |
| ------------------- | -------------------------------------------------- |
| Add oRPC procedure  | Create in `src/lib/orpc/`, register in `router.ts` |
| Add socket event    | `src/socket-server.ts`                             |
| DB schema/migration | `src/lib/drizzle/`                                 |
| Auth hooks/email    | `src/lib/better-auth/`, `src/lib/email/`           |
| UI components       | `src/components/ui/` (shadcn)                      |

---

## Conventions

- **ESM only**: `package.json` has `"type": "module"` — no CommonJS
- **React Compiler**: `reactCompiler: true` in `next.config.ts` — don't change
- **Biome**: Run `bun run format && bun run lint` before PRs
- **Vitest**: Tests in `src/__tests__/`, run with `bun run test`

---

## Documentation

**⚠️ CRITICAL**: This repository has **comprehensive documentation** for all libraries. When working on a feature:

1. **Check** `/docs/README.md` for the full documentation index
2. **Read** relevant docs in `/docs/<topic>/` before implementing
3. **Consult** `.github/instructions/<topic>.instructions.md` for quick patterns

### Documentation Structure

- `docs/orpc/` — oRPC procedures, routers, SSR optimization, TanStack Query
- `docs/better-auth/` — Authentication, organizations, SSR patterns
- `docs/i18n/` — next-intl, country selection, localization
- `docs/shadcn/` — UI components, forms, tables, empty states
- `docs/tanstack-react-query/` — SSR, hydration, prefetching patterns
- `docs/react-email/` — Email templates, Nodemailer, Tailwind
- `docs/permissions/` — Authorization and permission patterns
- `docs/participate/` — Questionnaire flows, calculations, testing
- `docs/ultracite/` — Biome linting configuration and standards

Use `read_file` or `semantic_search` tools to access specific documentation when needed.

---

## 🚀 Learning Paths for AI Agents

### Quick Onboarding (5-15 minutes)

When joining the project, follow this sequence based on your task:

**For oRPC/API features:**

1. Read `docs/orpc/QUICKSTART.md` (5 min) — quick overview & decision tree
2. Read `docs/orpc/DUAL-SETUP.md` (10 min) — full architecture & patterns
3. Reference `src/lib/orpc/README.md` — implementation patterns & code examples
4. Navigate with `docs/orpc/README.md` — file locations & FAQ

**For authentication/organizations:**

1. Check `.github/instructions/better-auth.instructions.md` — canonical entry point
2. Read `docs/better-auth/` for detailed patterns
3. Reference `src/lib/better-auth/` for implementation

**For UI components:**

1. Check `.github/instructions/shadcn.instructions.md` — quick reference
2. Read `docs/shadcn/` for component-specific guidance
3. Use `src/components/ui/` as code examples

**For internationalization:**

1. Check `.github/instructions/i18n.instructions.md` — i18n patterns
2. Read `docs/i18n/` for detailed configuration
3. Reference `src/lib/i18n/` for implementation

### Documentation Map by Task Type

| Task                    | Entry Point                                 | Deep Dive                                         | Implementation               |
| ----------------------- | ------------------------------------------- | ------------------------------------------------- | ---------------------------- |
| Create API endpoint     | `docs/orpc/QUICKSTART.md`                   | `docs/orpc/DUAL-SETUP.md`                         | `src/lib/orpc/README.md`     |
| Add protected procedure | `docs/orpc/QUICKSTART.md` (cheat sheet)     | `docs/orpc/DUAL-SETUP.md`                         | `src/lib/orpc/middleware.ts` |
| SSR optimization        | `docs/orpc/DUAL-SETUP.md`                   | `docs/orpc/Optimize-Server-Side-Rendering.SSR.md` | `src/instrumentation.ts`     |
| Auth/user setup         | `docs/better-auth/`                         | Better Auth docs                                  | `src/lib/better-auth/`       |
| UI feature              | `docs/shadcn/`                              | shadcn-ui docs                                    | `src/components/ui/`         |
| i18n support            | `.github/instructions/i18n.instructions.md` | `docs/i18n/`                                      | `src/lib/i18n/`              |
| Email template          | `docs/react-email/`                         | React Email docs                                  | `src/lib/email/`             |

### Key Navigation Cross-References

**Architecture & File Locations:**

- `docs/orpc/README.md` — Complete file reference, FAQ, learning paths
- `src/lib/orpc/README.md` — Implementation patterns with code examples
- `.github/copilot-instructions.md` — This file (mandatory requirements)

**Common Questions:**

- "Which endpoint should I use?" → `docs/orpc/QUICKSTART.md` (decision tree)
- "How do I add a protected procedure?" → `docs/orpc/DUAL-SETUP.md` (best practices)
- "Where are the files located?" → `docs/orpc/README.md` (file reference)
- "How do I test this?" → `docs/participate/testing.md`

**Always consult these first:**

1. **Quick answer** → Relevant `.github/instructions/<topic>.instructions.md`
2. **Need context** → Specific `docs/<topic>/README.md` or QUICKSTART.md
3. **Implementing code** → `src/lib/<topic>/README.md` or relevant source files

---

## Agent Checklist

1. ✅ Do not run dev/build/start commands
2. ✅ Ask before any terminal command not listed as allowed
3. ✅ Preserve `src/instrumentation.ts` import ordering
4. ✅ Small, focused edits with relevant test updates
5. ✅ Run `bun run format && bun run lint` on changes
6. ✅ Reference docs before making integration changes

**The developer is always in control. Agents are assistants, not controllers.**

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config Biome preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun run format`
- **Check for issues**: `bun run lint`
- **Diagnose setup**: `bunx ultracite doctor`

Biome (the underlying engine) provides extremely fast Rust-based linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically resolved by Biome. Run `bun run format` before committing to ensure compliance.
