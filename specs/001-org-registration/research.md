# Research: Organization Registration & Dashboard

**Phase**: 0 (Outline & Research)  
**Date**: November 7, 2025  
**Purpose**: Resolve technical unknowns and establish implementation patterns

## Research Tasks Completed

### 1. Better Auth Organization Plugin Integration

**Decision**: Use Better Auth `organization()` plugin with existing configuration

**Rationale**:
- Plugin already configured in `src/lib/better-auth/index.ts` and `src/lib/better-auth/auth-client.ts`
- Database schema already includes `organization`, `member`, and `invitation` tables via completed migrations
- Provides battle-tested APIs: `createOrganization`, `listOrganizations`, `setActiveOrganization`, `listMembers`
- Aligns with constitution requirement to use Better Auth for entity management

**Implementation Details**:
- Server: `auth.api.createOrganization()`, `auth.api.listOrganizations()`, `auth.api.listMembers()`
- Client: `authClient.organization.create()`, `authClient.organization.list()`, `authClient.organization.getFullOrganization()`
- Session includes `activeOrganizationId` field (already in schema)
- Plugin handles role assignment automatically (creator becomes "owner")

**Alternatives Considered**:
- Custom organization management: Rejected due to increased complexity and constitution principle (use Better Auth)
- Direct Drizzle queries: Rejected to maintain abstraction and leverage plugin's validation/security

**References**:
- Better Auth Org Plugin Docs: `.github/instructions/better-auth.organizations.md.instructions.md`
- Current config: `src/lib/better-auth/index.ts` line 14: `organization()` plugin
- Client config: `src/lib/better-auth/auth-client.ts` line 6: `organizationClient()` plugin

---

### 2. nuqs Library for URL State Management

**Decision**: Use `nuqs` library with `useQueryState` hook for tab persistence via URL parameters

**Rationale**:
- Type-safe URL state management with Next.js App Router support
- Built-in Next.js App Router adapter (`NuqsAdapter`) wraps application
- Declarative API: `const [tab, setTab] = useQueryState('tab', { defaultValue: 'dashboard' })`
- Automatic URL synchronization without manual router manipulation
- Shallow routing by default (no full page reload)

**Implementation Pattern**:
```typescript
// In dashboard-tabs.tsx (client component)
'use client'
import { useQueryState } from 'nuqs'

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'dashboard',
    parse: (value) => ['dashboard', 'team', 'projects'].includes(value) ? value : 'dashboard'
  })
  
  return <Tabs value={activeTab} onValueChange={setActiveTab}>...</Tabs>
}
```

**Setup Required**:
- ✅ Install: `bun add nuqs` (user confirmed this is done)
- ✅ Wrap app in `NuqsAdapter` at `src/app/layout.tsx` (user confirmed already added)

**Alternatives Considered**:
- `useSearchParams` + `useRouter`: Rejected due to more verbose API and manual URL construction
- React state only: Rejected as it doesn't persist tab selection in URL (breaks shareable links)
- Local storage: Rejected as requirement specifies URL-based state (FR-017)

**References**:
- nuqs Documentation: https://nuqs.dev/docs/basic-usage
- User instructions provided in clarification session

---

### 3. Form Validation Strategy

**Decision**: Zod schemas with shared validation between client and server

**Rationale**:
- Type-safe validation with TypeScript inference
- Single source of truth for validation rules (3-50 char limits, URL-safe slug regex)
- Reusable across Server Actions and client-side forms
- Integrates with React Hook Form for user-friendly error display

**Implementation Pattern**:
```typescript
// src/lib/validations/organization.ts
import { z } from 'zod'

export const organizationNameSchema = z
  .string()
  .min(3, 'Name must be at least 3 characters')
  .max(50, 'Name must not exceed 50 characters')
  .trim()

export const organizationSlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must not exceed 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .trim()

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
```

**Server Action Pattern**:
```typescript
// src/lib/actions/organization.ts
'use server'
import { createOrganizationSchema } from '@/lib/validations/organization'

export async function createOrganization(input: unknown) {
  const validated = createOrganizationSchema.parse(input) // Throws on validation error
  // Better Auth API call...
}
```

**Alternatives Considered**:
- Manual validation: Rejected due to code duplication and potential client/server mismatch
- Yup: Rejected as Zod provides better TypeScript integration
- HTML5 validation only: Rejected as insufficient for complex rules and missing server-side validation

---

### 4. Redirect Logic for Organization Gating

**Decision**: Layout-level middleware check with redirect to `/org/create` for users without organizations

**Rationale**:
- Centralized check in `(app)/layout.tsx` applies to all authenticated routes
- Prevents code duplication across individual pages
- Early return ensures no flash of unauthorized content
- Leverages Better Auth's `listOrganizations` API

**Implementation Pattern**:
```typescript
// src/app/(app)/layout.tsx
import { auth } from '@/lib/better-auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session) {
    redirect('/login')
  }
  
  const organizations = await auth.api.listOrganizations({ headers: await headers() })
  
  // Allow org creation page itself
  const currentPath = headers().get('x-pathname')
  if (organizations.length === 0 && currentPath !== '/org/create') {
    redirect('/org/create')
  }
  
  return <>{children}</>
}
```

**Edge Cases Handled**:
- User deletes their only organization: Next page load redirects to create
- User creates org in another tab: Browser refresh exits redirect loop
- Direct URL access to dashboard: Redirects to creation if no org exists

**Alternatives Considered**:
- Page-level checks: Rejected due to duplication
- Middleware in `middleware.ts`: Rejected as it runs on every request (less efficient for this check)
- Client-side redirect: Rejected as it causes flash of content and isn't SEO-friendly

---

### 5. Server Components vs Client Components Strategy

**Decision**: Maximize Server Components, use Client Components only for interactivity

**Server Components** (default):
- Dashboard page shell (`dashboard/page.tsx`)
- Team table data fetching (`team-table.tsx` wrapper)
- Stats placeholder (`dashboard-stats.tsx`)

**Client Components** (`'use client'`):
- Organization creation form (`org/create/page.tsx` or form component)
- Tab navigation (`dashboard-tabs.tsx` - needs `useQueryState`)
- Any component using React hooks (useState, useEffect, etc.)

**Rationale**:
- Server Components reduce client bundle size
- Data fetching in Server Components provides better initial load performance
- Better SEO and faster time-to-interactive
- Client Components only where necessary (forms, URL state, interactivity)

**Data Flow Pattern**:
```typescript
// Server Component fetches data
// dashboard/page.tsx
import { auth } from '@/lib/better-auth'

export default async function DashboardPage() {
  const members = await auth.api.listMembers({ headers: await headers() })
  
  return (
    <div>
      <DashboardTabs /> {/* Client Component for URL state */}
      <TeamTable members={members} /> {/* Server Component receives data */}
    </div>
  )
}
```

**References**:
- Next.js Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- React Server Components RFC: https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md

---

### 6. Error Handling & User Feedback

**Decision**: Server Action error boundaries with toast notifications for user-facing errors

**Implementation Pattern**:
```typescript
// Client-side form handler
'use client'
import { toast } from 'sonner' // Assuming sonner for toasts
import { createOrganization } from '@/lib/actions/organization'

async function handleSubmit(data: CreateOrganizationInput) {
  try {
    await createOrganization(data)
    toast.success('Organization created successfully')
    router.push('/dashboard')
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Display validation errors in form
      setFormErrors(error.flatten().fieldErrors)
    } else {
      toast.error(error.message || 'Failed to create organization')
    }
  }
}
```

**Server Action Error Pattern**:
```typescript
'use server'
export async function createOrganization(input: unknown) {
  try {
    const validated = createOrganizationSchema.parse(input)
    const result = await auth.api.createOrganization({ body: validated })
    revalidatePath('/dashboard')
    return { success: true, data: result }
  } catch (error) {
    if (error.code === 'UNIQUE_CONSTRAINT') {
      throw new Error('Organization slug already exists')
    }
    throw new Error('Failed to create organization')
  }
}
```

**Rationale**:
- Clear user feedback for all error states
- Graceful degradation (form stays populated on error)
- Specific error messages guide user correction
- Validation errors displayed inline, system errors as toasts

---

### 7. Testing Strategy (documentation only)

Testing approaches are documented for future contributors. Per product policy, automated test implementation and audit execution are out-of-scope for this feature's MVP — the materials below are specifications and references only.

- Overview: A three-tier approach (unit, integration, E2E) is described so future contributors can adopt it.
- Tooling: Vitest and Playwright are referenced as sensible choices; no test harnesses, CI jobs, or runnable test code are included in this repository for the MVP.
- Accessibility audits (pa11y/axe): Options are documented for future work; automated accessibility audits are out-of-scope for MVP.

References:

- Vitest: https://vitest.dev/ (reference)
- Playwright: https://playwright.dev/ (reference)

---

## Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 15+ | App Router, Server Components, API Routes |
| Language | TypeScript | 5.x | Type safety across stack |
| Auth | Better Auth | latest | Organization plugin, session management |
| Database | PostgreSQL | 14+ | Data persistence |
| ORM | Drizzle | latest | Type-safe database queries |
| Validation | Zod | 3.x | Schema validation (client + server) |
| UI Components | shadcn/ui | latest | Table, Card, Tabs, Empty components |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| URL State | nuqs | latest | Type-safe URL parameter management |
| Forms | React Hook Form | 7.x | Form state management |
| Testing (Unit) | Vitest | latest | Reference only — test execution out-of-scope |
| Testing (E2E) | Playwright | latest | Reference only — test execution out-of-scope |
| Toast Notifications | Sonner | latest | User feedback |

---

## Implementation Sequence


Based on research findings, recommended implementation order (testing references are documentation-only):

1. **Validation Layer**
  - Create Zod schemas
  - Document fixtures and edge cases for reference

2. **Server Actions**
  - Implement Better Auth API wrappers
  - Add error handling and type safety

3. **Organization Creation Flow**
  - Build form with validation
  - Implement redirect logic in layout

4. **Dashboard Shell**
  - Create tab navigation with nuqs
  - Implement layout and routing

5. **Team Table**
  - Fetch and display members
  - Handle empty state (single owner)

6. **Projects Empty State**
  - Implement shadcn Empty component
  - Add instructional messaging


---

## Open Questions / Risks

**None identified** - All technical unknowns from spec have been resolved through research. Constitution gates passed. Ready to proceed to Phase 1 (Design & Contracts).
