# Implementation Plan: Organization Registration & Dashboard

**Branch**: `001-org-registration` | **Date**: November 7, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-org-registration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable verified users to create their first organization and access a dashboard with three tabs (Dashboard, Team, Projects). The organization creation flow acts as a mandatory onboarding step for users with verified emails but no organizations. The dashboard provides organization context through tab navigation (URL-based state management via nuqs), displays team members in a table (initially showing the owner), and shows an empty state for projects using shadcn Empty component. Technical approach leverages Better Auth organization plugin (already configured), Next.js App Router with Server Components and Server Actions, shadcn/ui components, and nuqs for URL parameter management.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16 (App Router)  
**Primary Dependencies**: Better Auth (organization plugin), React 19, nuqs (URL state), shadcn/ui, Drizzle ORM, Zod  
**Storage**: PostgreSQL via Drizzle ORM (schema already includes organization, member, invitation tables)  
**Testing**: Testing tools (Vitest, Playwright) are referenced for future work; test execution is out-of-scope per product policy.
**Target Platform**: Web application (Next.js App Router with decoupled Socket.IO server at src/socket-server.ts)  
**Project Type**: Web application (frontend + backend in monolithic Next.js structure)  
**Performance Goals**: No formal performance targets in MVP; no performance testing is in scope  
**Constraints**: Client-side validation must match server-side (3-50 char limits for name/slug), URL state must be type-safe  
**Scale/Scope**: MVP supports single organization per user initially, ~50 members displayable without pagination

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Phase 0)

**Principle I: User Privacy & GDPR Compliance**
- ✅ **PASS**: Organization data (name, slug, metadata) is not personally identifiable. Member relationship links user to organization but leverages existing Better Auth user records (already GDPR-compliant). No new personal data collection introduced.
- ✅ **PASS**: Access control handled by Better Auth organization plugin with role-based permissions (owner/admin/member). Consent flows already established through existing auth.

**Principle II: Accuracy & Transparency**
- ✅ **PASS** (N/A): No CO₂ calculations or emission factors in this feature. Data handling is straightforward CRUD for organizations and membership display.

**Principle III: Accessibility & Inclusivity**
- ℹ️ **NOTE**: Rely on shadcn/ui default semantics; no formal accessibility audit in MVP.
- ✅ **PASS**: Responsive design required (US4 acceptance scenario 4). Mobile support inherent in Tailwind/shadcn approach.

**Principle IV: Test-First & Reproducibility**
-- ✅ **PASS**: Test contracts and specifications defined per constitution.
-- 📋 **NOTE**: Test implementation is out-of-scope per product policy. Contracts and test cases remain as specification artifacts only.

**Principle V: Simplicity & Maintainability**
- ✅ **PASS**: Leverages existing Better Auth organization plugin rather than custom implementation. Uses established patterns (Server Components, Server Actions, shadcn/ui). No premature optimization.
- ✅ **PASS**: Single responsibility: organization onboarding and dashboard shell. Clear module boundaries.

**Entity Alignment Check**:
- ✅ Organization entity aligns with constitution's Organization definition (legal/educational institution, project owner)
- ✅ Better Auth organization plugin usage required per constitution
- ✅ Member relationship correctly models organization membership with roles
- ⚠️ Project entity mentioned but implementation deferred to future phase (empty state only)

**Gates Status**: ✅ **APPROVED** - Feature may proceed to Phase 0 with accessibility deferred to Phase 2.

---

### Phase 1 Re-Check (Post-Design)

**Date**: November 7, 2025  
**Artifacts Reviewed**: research.md, data-model.md, contracts/, quickstart.md

**Principle I: User Privacy & GDPR Compliance**
- ✅ **CONFIRMED**: No changes to privacy/GDPR posture. Data model confirms organization and member entities use existing Better Auth user records. No new PII introduced.
- ✅ **CONFIRMED**: Access control patterns documented in data-model.md leverage Better Auth's built-in role-based permissions. API contracts include proper authorization checks (UNAUTHORIZED/FORBIDDEN error codes).

**Principle II: Accuracy & Transparency**
- ✅ **CONFIRMED** (N/A): Still no CO₂ calculations in scope. All data operations are transparent CRUD via Better Auth APIs.

**Principle III: Accessibility & Inclusivity**
- ℹ️ **NOTE**: Rely on shadcn/ui default semantics; no formal accessibility audit in MVP.
- ✅ **PASS**: Responsive design confirmed in quickstart.md implementation examples. All components use Tailwind responsive utilities.

**Principle IV: Test-First & Reproducibility**
-- ✅ **PASS**: Contract files define comprehensive test cases (20+ test scenarios across 3 contracts).
-- ✅ **PASS**: Test contracts specify expected behavior for validation logic, server actions, and full flows.
-- ✅ **NOTE**: Test implementation is out-of-scope per product policy; these contracts exist as documentation for future manual or automated work.
- ✅ **REPRODUCIBILITY**: Quickstart.md provides step-by-step implementation sequence with time estimates (30min to 90min per phase).

**Principle V: Simplicity & Maintainability**
- ✅ **PASS**: Research phase confirmed no premature optimization. Server Components used by default (only client components for forms/tabs).
- ✅ **PASS**: Validation schemas use Zod single source of truth pattern (reusable client + server).
- ✅ **PASS**: Data model confirms no schema migrations needed (tables already exist from Better Auth plugin).
- ✅ **PASS**: API surface area minimized to 3 endpoints leveraging Better Auth APIs (createOrganization, listOrganizations, listMembers).

**Entity Alignment Re-Check**:
- ✅ Organization entity in data-model.md matches constitution's Organization definition
- ✅ Member entity correctly implements organization membership with roles (owner/admin/member)
- ✅ Session entity extended with activeOrganizationId (already exists in schema)
- ✅ Project entity documented with "future phase" marker (empty state only in MVP)

**Design Quality Assessment**:
- ✅ All 19 functional requirements mapped to contracts/data-model
- ✅ No technical debt introduced
- ✅ Error handling patterns comprehensive (validation errors, duplicate slugs, unauthorized access)
 

**Gates Status**: ✅ **RE-APPROVED** - Phase 1 design complete. Feature ready for Phase 2 (task breakdown via `/speckit.tasks` command).

**Accessibility Requirement for Phase 2**: Must include tasks for keyboard navigation testing, ARIA attribute validation, and screen reader compatibility testing before deployment.

## Project Structure

### Documentation (this feature)

```text
specs/001-org-registration/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   ├── organization-create.contract.ts
│   ├── organization-list.contract.ts
│   └── members-list.contract.ts
├── checklists/
│   └── requirements.md  # Spec validation checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (app)/                       # Authenticated app routes
│   │   ├── dashboard/               # NEW: Organization dashboard
│   │   │   ├── page.tsx            # Dashboard shell with tabs
│   │   │   ├── loading.tsx         # Loading state
│   │   │   └── _components/
│   │   │       ├── dashboard-tabs.tsx      # Tab navigation (nuqs)
│   │   │       ├── dashboard-stats.tsx     # Stats placeholder
│   │   │       ├── team-table.tsx          # Members table
│   │   │       └── projects-grid.tsx       # Projects grid + empty state
│   │   ├── org/                     # NEW: Organization management
│   │   │   └── create/
│   │   │       └── page.tsx        # Organization creation form
│   │   └── layout.tsx               # MODIFY: Add org check + redirect logic
│   ├── api/
│   │   └── organizations/           # NEW: Organization API routes
│   │       ├── route.ts            # POST /api/organizations (create)
│   │       └── [orgId]/
│   │           └── members/
│   │               └── route.ts    # GET /api/organizations/:id/members
│   └── layout.tsx                   # Root layout (NuqsAdapter already added)
├── components/
│   └── ui/
│       └── empty.tsx                # Existing shadcn Empty component
├── lib/
│   ├── better-auth/
│   │   ├── index.ts                # VERIFY: Organization plugin configured
│   │   └── auth-client.ts          # VERIFY: organizationClient plugin
│   ├── validations/                 # NEW: Validation schemas
│   │   └── organization.ts         # Zod schemas for org name/slug
│   └── actions/                     # NEW: Server Actions
│       └── organization.ts          # createOrganization, listOrganizations, listMembers
└── hooks/
    └── use-organization.ts          # NEW: Client-side org hooks (nuqs integration)

```

**Structure Decision**: Web application structure (single Next.js App Router project). All organization-related routes under `src/app/(app)/` (authenticated layout). Server Actions in `src/lib/actions/` for Better Auth API calls. Client components for forms and interactive elements. nuqs integrated at root layout level via NuqsAdapter.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification. Feature adheres to Principle V (Simplicity & Maintainability) by:
- Leveraging existing Better Auth organization plugin rather than building custom organization management
- Using established Next.js patterns (Server Components, Server Actions)
- Utilizing shadcn/ui components for consistent UI
- Deferring pagination and advanced features to future iterations
