# Tasks: Organization Registration & Dashboard

Feature: Organization Registration & Dashboard (Branch: 001-org-registration)

This plan follows the tasks template structure. Tasks are ordered, labeled, and immediately actionable. User stories are organized into their own phases with independent test criteria. All tasks include concrete file paths and use the required checklist format.

## Phase 1: Setup

- [x] T001 Verify Better Auth org plugin configuration in src/lib/better-auth/index.ts
- [x] T002 Verify Better Auth client org plugin configuration in src/lib/better-auth/auth-client.ts
- [x] T003 Verify NuqsAdapter wraps the app in src/app/layout.tsx
- [x] T004 Verify shadcn Empty component usage aligns with guidance in src/components/ui/empty.tsx
- [x] T005 Create feature component directory structure at src/app/(app)/dashboard/_components/
- [x] T006 Create organization onboarding route directory at src/app/(app)/org/create/

## Phase 2: Foundational

- [x] T007 Create validation schemas for organization in src/lib/validations/organization.ts
- [x] T008 Scaffold server actions module (export stubs) in src/lib/actions/organization.ts
- [x] T009 Create dashboard route directory at src/app/(app)/dashboard/

## Phase 3: User Story 1 — First Organization Creation (P1)

Goal: Verified users without organizations must create their first organization before accessing features.

Independent Test Criteria:
- Redirect unauthenticated → /login. Verified users with zero orgs → /org/create exclusively.
- Submitting valid name/slug creates org, sets owner, and redirects to /dashboard.
- Duplicate/invalid slug yields clear error message; form remains populated.

Implementation Tasks:
- [x] T010 [US1] Implement createOrganization server action in src/lib/actions/organization.ts
- [x] T011 [P] [US1] Create organization creation form page in src/app/(app)/org/create/page.tsx
- [x] T012 [US1] Add gating redirect logic for no-org users in src/app/(app)/layout.tsx
- [x] T013 [P] [US1] Implement POST /api/organizations route in src/app/api/organizations/route.ts
- [x] T014 [US1] Wire form submit to server action with error handling in src/app/(app)/org/create/page.tsx

## Phase 4: User Story 2 — Dashboard Navigation & Context (P2)

Goal: Provide dashboard with tab navigation (Dashboard, Team, Projects) using URL-based state via nuqs.

Independent Test Criteria:
- Visiting /dashboard shows tab nav; switching tabs updates ?tab and selection persists on refresh.
- Dashboard tab renders stats placeholder; active tab is visually indicated.

Implementation Tasks:
- [x] T015 [US2] Implement dashboard page shell in src/app/(app)/dashboard/page.tsx
- [x] T016 [P] [US2] Create tab navigation with nuqs in src/app/(app)/dashboard/_components/dashboard-tabs.tsx
- [x] T017 [P] [US2] Add stats placeholder component in src/app/(app)/dashboard/_components/dashboard-stats.tsx

## Phase 5: User Story 3 — Team Members Overview (P2)

Goal: Show all organization members (at least owner) in a table with name, email, role, join date.

Independent Test Criteria:
- Newly created org shows exactly one member (owner) with accurate join date.
- Team tab displays table with required columns and data.

Implementation Tasks:
- [x] T018 [US3] Implement listMembers server action in src/lib/actions/organization.ts
- [x] T019 [P] [US3] Create team table component in src/app/(app)/dashboard/_components/team-table.tsx
- [x] T020 [US3] Integrate members fetch and pass to tabs in src/app/(app)/dashboard/page.tsx
- [x] T021 [P] [US3] Implement GET /api/organizations/[orgId]/members route in src/app/api/organizations/[orgId]/members/route.ts

## Phase 6: User Story 4 — Projects Grid View (P3)

Goal: Display projects grid with empty state (no project creation in MVP).

Independent Test Criteria:
- Projects tab shows shadcn Empty state when there are no projects; layout is responsive.

Implementation Tasks:
- [x] T022 [US4] Create projects grid empty state in src/app/(app)/dashboard/_components/projects-grid.tsx
- [x] T023 [US4] Integrate projects grid into tabs in src/app/(app)/dashboard/_components/dashboard-tabs.tsx

## Final Phase: Polish & Cross-Cutting

- [x] T025 Review and refine user-facing error copy in src/app/(app)/org/create/page.tsx
- [x] T026 Ensure lint/format pass per Biome config in biome.json
- [x] T027 Verify dashboard data-fetch boundaries and render correctness in src/app/(app)/dashboard/page.tsx

## Dependencies

- Story Order: US1 → (US2 and US3 in parallel) → US4
- File-Level: T011/T013 can proceed in parallel to T010; T014 depends on T010+T011. T016/T017 parallel; T019/T021 parallel with T018; T020 depends on T018+T019.

## Parallel Execution Examples

- US1: Implement page form (T011) and API route (T013) in parallel; wire-up (T014) after.
- US2: Build tabs (T016) and stats placeholder (T017) in parallel; page shell (T015) integrates them.
- US3: Build team table (T019) and members API route (T021) in parallel; integrate with data load (T020).
- US4: Projects empty component (T022) can be built while US2/US3 complete; integrate (T023) afterward.

## Implementation Strategy

- MVP first: Complete US1 end-to-end to unblock access to the app, then US2/US3 for dashboard structure and visibility, finally US4 for projects empty state. Prefer Server Components for data loading, Client Components only for forms and tabs (nuqs). Reuse Zod schemas on both client and server.

## Format Validation

- All tasks use the required checklist format: `- [ ] T### [P?] [US?] Description with file path`.
- Story labels appear only in story phases (US1–US4). Setup/Foundational/Polish tasks have no story label.
