---
name: "Conventions & Setup"
description: "Project-specific conventions, configurations, and developer workflows"
applyTo: "**/*"
---

# Project Conventions

This file documents project-specific conventions, configurations, and developer workflows.

---

## Module System

**ESM Only** — This project uses ECMAScript Modules exclusively.

- `package.json` declares `"type": "module"`
- Use `import`/`export`, never `require()`/`module.exports`
- All file extensions must be `.ts`, `.tsx`, `.js`, `.jsx` (no `.mjs`/`.cjs`)

### Import Best Practices

```typescript
// ✅ Good: Specific imports
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ❌ Avoid: Namespace imports (slower)
import * as React from "react";

// ❌ Avoid: Barrel files (re-exports from index.ts)
import { Button, Card, Dialog } from "@/components/ui"; // Don't do this
```

---

## Build & Bundler Configuration

### Next.js Configuration

**React Compiler**: Enabled in `next.config.ts`

```typescript
reactCompiler: true; // ⚠️ Do NOT disable or modify
```

**Why it matters**: The React Compiler optimizes component re-renders. Disabling it would regress performance and potentially introduce bugs.

### Package Optimization

Check `next.config.ts` for `optimizePackageImports` — this pre-bundles heavy packages to improve cold start time.

See `docs/next/optimizePackageImports.md` for the list.

---

## Linting & Formatting

### Oxc (Rust-based linter)

This project uses **Oxc** for extremely fast linting and formatting.

**Commands**:

```bash
bun run lint      # Check for issues
bun run format    # Auto-fix formatting
```

**Configuration**: See `docs/oxc/` for:

- `docs/oxc/oxlint/` — Linting rules
- `docs/oxc/oxfmt/` — Formatting rules

**Migration note**: This project previously used Ultracite/Biome. All references have been migrated to Oxc.

---

## Testing

**Framework**: Vitest

**Location**: `src/__tests__/`

**Commands**:

```bash
bun run test              # Interactive mode (watch)
bun run test:run          # Run once
bun run test:coverage     # Coverage report
```

**Conventions**:

- Test files: `*.test.ts` or `*.test.tsx`
- Use `describe()` for grouping, `it()` or `test()` for cases
- Avoid `.only()` and `.skip()` in committed code
- Prefer `async/await` over `done()` callbacks

**Example**:

```typescript
import { describe, it, expect } from "vitest";

describe("myFunction", () => {
  it("should return correct value", () => {
    expect(myFunction(5)).toBe(10);
  });
});
```

---

## Git Workflow

### Branch Naming

- Feature branches: `feature/short-description`
- Bug fixes: `fix/short-description`
- Cleanup/refactor: `cleanup-unused-code` (example from current branch)

### Commit Messages

- Use conventional commits (optional but preferred):
  - `feat: add user profile endpoint`
  - `fix: resolve SSR hydration mismatch`
  - `docs: update oRPC integration guide`
  - `refactor: centralize sorting logic`
  - `test: add coverage for auth middleware`

### Pre-Commit Checklist

1. `bun run format` — Auto-fix formatting
2. `bun run lint` — Check for errors
3. `bun run test:run` — Ensure tests pass
4. Review changes with `git diff`

---

## Database Migrations

**ORM**: Drizzle

**Schema location**: `src/lib/drizzle/schema/`

**Migration workflow**:

```bash
# 1. Edit schema in src/lib/drizzle/schema/
# 2. Generate migration
bun run db:generate

# 3. Apply migration
bun run db:migrate
```

**Connection**: See `docs/database/coolify-ssl-connection.md` for SSL setup.

---

## Environment Variables

**Validation**: `src/env.ts` uses `@t3-oss/env-nextjs` for type-safe environment validation.

**Setup**:

1. Copy `.env.example` to `.env.local`
2. Fill in required values
3. TypeScript will validate at build time

**Common variables**:

- `DATABASE_URL` — Postgres connection string
- `BETTER_AUTH_SECRET` — Auth session secret
- `BETTER_AUTH_URL` — Base URL for auth callbacks
- Email provider credentials (Nodemailer)

---

## Package Manager

**Use `bun` exclusively** — Do not use `npm`, `yarn`, or `pnpm`.

```bash
# Install dependencies
bun install

# Add package
bun add <package>

# Add dev dependency
bun add -d <package>

# Remove package
bun remove <package>

# Run scripts
bun run <script>
```

**Lockfile**: `bun.lockb` (binary format) — commit this to version control.

---

## Component Organization

### shadcn/ui Components

**Installation**:

```bash
bunx shadcn@latest add <component-name>
```

**Location**: `src/components/ui/`

**Customization**: Components are copied into the project, so you can modify them directly. See `docs/shadcn/` for usage patterns.

### Feature Components

**Location**: `src/components/` (top-level) or `src/features/<feature-name>/components/`

**Naming**:

- PascalCase for components: `ProjectCard.tsx`
- Avoid `index.tsx` barrel files (import specific files)

---

## Internationalization (i18n)

**Library**: next-intl

**Supported locales**: Configured in `src/lib/i18n/config.ts`

**Translation files**: `messages/<locale>/*.json`

**Structure**:

```
messages/
├── en/
│   ├── common.json
│   ├── auth.json
│   └── projects.json
└── de/
    ├── common.json
    ├── auth.json
    └── projects.json
```

**Usage**:

- Server Components: `await getTranslations("namespace")`
- Client Components: `useTranslations("namespace")`

See `docs/i18n/` for detailed patterns.

---

## API Design (oRPC)

### Procedure Naming

**Conventions**:

- Use verb-noun pattern: `createProject`, `listUsers`, `deleteOrganization`
- Avoid abbreviations: `getProjectById` not `getProjById`
- Be specific: `archiveProject` not `updateProject({ archived: true })`

### Input Validation

**Use Zod schemas** for all procedure inputs:

```typescript
import { z } from "zod";
import { base } from "./context";

export const createProject = base
  .input(
    z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    // Implementation
  });
```

**See**: `docs/schemas/` for validation patterns.

---

## Accessibility Standards

**Requirements**:

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Provide alt text for images
- Use proper heading hierarchy (`h1` → `h2` → `h3`)

**shadcn components** are pre-configured for accessibility. Leverage them.

---

## Performance Considerations

### Avoid barrel files

Barrel files (`index.ts` that re-export everything) slow down cold starts. Import directly:

```typescript
// ✅ Good
import { Button } from "@/components/ui/button";

// ❌ Avoid
import { Button } from "@/components/ui";
```

### Use Server Components by default

Client Components (`"use client"`) should be the exception, not the rule. Only use when:

- You need browser APIs (localStorage, window, etc.)
- You need React hooks (useState, useEffect)
- You need interactivity (onClick, onChange)

### Lazy load heavy components

```typescript
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <p>Loading chart...</p>,
});
```

---

## For More Details

- **Code standards**: `.github/instructions/code-standards.instructions.md`
- **Architecture**: `.github/instructions/architecture.instructions.md`
- **Quick Start**: `.github/instructions/quick-start.instructions.md`
