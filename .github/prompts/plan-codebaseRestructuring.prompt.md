# Plan: Restructure Features for Clear Responsibility Boundaries

> **🔧 CORRECTION (Jan 2, 2026):** Initial plan incorrectly proposed `src/lib/orpc/features/` for business logic. This has been corrected to `src/features/`. The `orpc` folder is a tool library (client, router, middleware) and should NOT contain features. Features are domain/business logic and belong in a dedicated folder at the root level (`src/features/`), NOT inside `src/lib/`. All references have been updated for consistency.

**TL;DR:** Your codebase mixes three distinct structural concerns: **database entities** (organization, project, activity, participant) vs **UI areas** (landing page, questionnaire) vs **configuration**. The refactoring consolidates this into a cohesive hierarchy where:

- **`src/features/`** contains all feature-specific business logic (types, validation schemas, procedures)
- **`src/components/features/`** contains feature-specific UI components
- **`src/lib/orpc/`** remains the oRPC tool library (client, router, middleware, adapters)
- **`src/config/`** centralizes domain configuration

---

## Overview of Current Issues

### ❌ **ISSUE #1: Questionnaire Logic Scattered Across Two Locations**

**Problem:** Participant questionnaire appears in TWO places:

- `src/components/participate/` — UI components & form logic
- `src/components/features/participants/` — Database participant entity

**Confusion:**

- `src/components/participate/types.ts` defines computation types (`ParticipantAnswers`, `EmissionCalculation`)
- `src/components/features/participants/validation-schemas.ts` defines database participant schema
- These are **semantically related but structurally separated**
- Emission calculation logic in `questionnaire-utils.ts` is NOT near database procedures

**Current Reality:**

- `participate/` = **UI Area** (public questionnaire, not logged-in, no database mutations)
- `features/participants/` = **Database Entity** (links users to projects)
- These are **fundamentally different responsibilities** but share the word "participant"

---

### ❌ **ISSUE #2: Activity Logic Embedded in Projects**

**Problem:** Project activities have:

- Database schema in `src/lib/drizzle/` (project-schema.ts)
- Types in `src/components/features/projects/types.ts`
- Validation schemas in `src/components/features/projects/validation-schemas.ts`
- Procedures in `src/components/features/projects/procedures.ts` (11 procedures mixed with project ops)
- UI components in `src/components/features/project-activities/` (form, table, dialog)

**Confusion:**

- Are activities a **sub-resource of projects** or a **distinct entity**?
- `src/components/features/project-activities/` folder exists but only has UI components
- No dedicated `types.ts` or `procedures.ts` in project-activities
- Activity procedures bundled with project procedures (1086 lines total)

**Current Reality:**

- Activities are **sub-resources of projects** (deleted when project deleted)
- But they're treated as **secondary concerns** (minimal UI, scattered types)

---

### ❌ **ISSUE #3: Emission Calculations Not Associated with Questionnaire Responses**

**Problem:** Currently:

- Questionnaire form collects 14 answers → calculates emissions **on-client only**
- Calculations live in `questionnaire-utils.ts`
- **No database table to persist** questionnaire responses or calculations
- Emission factors defined in `src/config/activities.ts` (right place)
- But calculation logic isolated in component utils, not in oRPC procedures

**Confusion:**

- Where should questionnaire responses be stored? (Not yet modeled in schema)
- How do participants revisit their responses? (Currently impossible)
- Can organizers see participant emissions in the dashboard? (Not implemented)

**Current Reality:**

- **Phase 1 limitation** — Questionnaire is POC, no persistence
- Waiting for Phase 2 to add database table + persistence

---

### ❌ **ISSUE #4: Configuration Scattered Across `config/` and Component Folders**

**Problem:**

- Emission factors in `src/config/activities.ts` ✅ (correct place)
- Activity types in `src/components/features/projects/types.ts` ✅ (correct place)
- Organization sort fields in `src/components/features/organizations/types.ts` (inline constant)
- Questionnaire steps in `src/components/participate/questionnaire-constants.ts` (in component folder) ❌
- Countries in `src/lib/i18n/` ✅ (correct place)

**Confusion:**

- Where should questionnaire step definitions live?
- Should they be `src/config/questionnaire-flow.ts` for consistency?
- Components importing from both `config/` and their own `constants.ts`

---

### ❌ **ISSUE #5: Duplicate/Overlapping Type Definitions**

**Problem:**

- `ActivityValueType` defined in `src/components/features/projects/types.ts`
- `ParticipantActivityType` defined in `src/components/participate/types.ts`
- `ProjectActivitySchema` re-exported from validation-schemas
- `ParticipantActivity` extends activities + adds plane/electricCar in participate/types.ts

**Confusion:**

- Why three similar type names?
- Why does `participate/` re-define participant activity types?
- No clear single source of truth

**Current Reality:**

- Project activities: boat, bus, train, car
- Participant activities: same + plane, electricCar (participant-specific transport modes)
- Types split because they serve different features

---

## Refactoring Steps

### **Step 1: Extract Project Activities as First-Class Feature**

**Goal:** Move activity types, schemas, and procedures from `projects/` to dedicated feature folder with consistent structure.

**New Structure:**

```
src/features/
├── organizations/
│   ├── types.ts
│   ├── validation-schemas.ts
│   ├── procedures.ts
│   └── __tests__/
├── projects/
│   ├── types.ts
│   ├── validation-schemas.ts
│   ├── procedures/
│   └── __tests__/
├── project-activities/              ← NEW
│   ├── types.ts                    (ActivityValueType, ProjectActivityType enums)
│   ├── validation-schemas.ts       (ProjectActivitySchema, form schemas)
│   ├── procedures.ts               (createProjectActivity, updateProjectActivity, deleteProjectActivity)
│   └── __tests__/
├── participants/
│   ├── types.ts
│   ├── validation-schemas.ts
│   ├── procedures.ts
│   └── __tests__/
└── ...

src/components/features/
├── organizations/
│   ├── components/
│   │   └── *.tsx
│   └── __tests__/
├── projects/
│   ├── components/
│   │   └── *.tsx
│   └── __tests__/
├── project-activities/              ← EXISTING (but now depends on src/features/project-activities)
│   ├── components/
│   │   ├── activity-form.tsx
│   │   ├── activity-dialog.tsx
│   │   ├── transport-icon.tsx
│   │   └── ...
│   └── __tests__/
└── ...
```

**Changes:**

1. Create `src/features/project-activities/types.ts` → Extract `ActivityValueType` from `projects/types.ts`
2. Create `src/features/project-activities/validation-schemas.ts` → Extract activity-related schemas from `projects/validation-schemas.ts`
3. Create `src/features/project-activities/procedures.ts` → Extract activity procedures from `projects/procedures.ts` (createProjectActivity, updateProjectActivity, deleteProjectActivity)
4. Update `src/lib/orpc/router.ts` → Import activity procedures from new feature folder (`src/features/project-activities/`)
5. Update `src/components/features/project-activities/` → Import types/schemas from `src/features/project-activities/`
6. Delete activity-related code from `projects/procedures.ts`, `projects/types.ts`, `projects/validation-schemas.ts`

**Benefits:**

- ✅ Activities treated as first-class entities
- ✅ Consistent folder structure with other features
- ✅ Clear separation of DB logic (lib) from UI components
- ✅ Smaller, more focused procedure files

---

### **Step 2: Separate Questionnaire UI from Participant Entity**

**Goal:** Clarify that `participate/` is a public UI area, not a database entity; `participants/` is the DB entity.

**Current Confusion:**

- `src/components/participate/` — public questionnaire form, calculations, no auth
- `src/components/features/participants/` — database entity (user linked to project)
- Both have "participant" in the name but do completely different things

**New Structure:**

```
src/features/
├── organizations/
├── projects/
├── project-activities/
├── participants/                    ← IMPROVED (now has full structure)
│   ├── types.ts                    (ProjectParticipant, ParticipantWithUser, etc.)
│   ├── validation-schemas.ts       (ProjectParticipantSchema, etc.)
│   ├── procedures.ts               (listProjectParticipants, addParticipant, removeParticipant, etc.)
│   └── __tests__/
└── ...

src/components/
├── features/
│   └── participants/               ← IMPROVED (only UI components, import types from lib/features)
│       ├── components/
│       │   ├── participants-table.tsx
│       │   ├── participants-list.tsx
│       │   ├── participants-link-controls.tsx
│       │   └── ...
│       └── __tests__/
│
└── participate/                    ← CLARIFIED (UI Area, NOT entity, public access)
    ├── types.ts                   (ParticipantAnswers, EmissionCalculation, ParticipantActivity, etc.)
    ├── constants.ts               (questionnaire step definitions — moved from questionnaire-constants.ts)
    ├── utils.ts                   (calculateEmissions, getOccupancyFactor, getElectricityFactor — renamed from questionnaire-utils.ts)
    ├── components/
    │   ├── questionnaire-form.tsx
    │   ├── questionnaire-step-demographics.tsx    ← NEW (broken down from monolithic form)
    │   ├── questionnaire-step-accommodation.tsx   ← NEW
    │   ├── questionnaire-step-transport.tsx       ← NEW
    │   ├── questionnaire-step-summary.tsx         ← NEW
    │   ├── stats-overview.tsx
    │   ├── transport-breakdown.tsx
    │   ├── leaderboard.tsx
    │   ├── impact-modal.tsx
    │   ├── participate-header.tsx
    │   ├── live-indicator.tsx
    │   └── ...
    └── __tests__/
```

**Changes:**

1. Create `src/features/participants/types.ts` → Define participant entity types
2. Create `src/features/participants/validation-schemas.ts` → Define participant DB schemas (currently empty)
3. Create `src/features/participants/procedures.ts` → Define participant entity procedures (currently borrowed from projects)
4. Update `src/components/features/participants/` → Import types from src/features, keep only UI components
5. Rename/reorganize `src/components/participate/`:
   - Rename `questionnaire-constants.ts` → move to `src/config/questionnaire-flow.ts`
   - Rename `questionnaire-utils.ts` → `src/components/participate/utils.ts`
   - Create subdirectory `src/components/participate/components/` for all .tsx files
   - Break up monolithic `questionnaire-form.tsx` into step-based sub-components

**Benefits:**

- ✅ Clear: `participate/` = public UI area, `participants/` = DB entity
- ✅ Participant entity has dedicated procedures and types
- ✅ Questionnaire form is decomposed into smaller, testable steps
- ✅ Calculation logic no longer tied to form component

---

### **Step 3: Reorganize Features to Follow Consistent Pattern**

**Goal:** Apply the same structural pattern to all database entities and UI areas.

**Pattern for Database Entities:**

```
src/features/ENTITY_NAME/
├── types.ts                        # DB types (InferSelectModel, enums, computed types)
├── validation-schemas.ts           # Drizzle + form schemas
├── procedures.ts                   # CRUD endpoints (organized logically)
├── config.ts                       # Feature-specific constants (if any)
├── index.ts                        # Barrel export (optional)
└── __tests__/

src/components/features/ENTITY_NAME/
├── components/                     # All .tsx files
│   ├── form-create.tsx
│   ├── form-edit.tsx
│   ├── table.tsx
│   ├── card.tsx
│   └── ...
├── index.ts                        # Barrel export (optional)
└── __tests__/
```

**Pattern for UI Areas:**

```
src/components/AREA_NAME/
├── types.ts                        # UI-only types (not DB entities)
├── constants.ts                    # Configuration, step definitions, etc.
├── utils.ts                        # Calculation/helper functions
├── components/                     # All .tsx files
│   ├── main-component.tsx
│   ├── sub-component.tsx
│   └── ...
├── index.ts                        # Barrel export (optional)
└── __tests__/
```

**Current Compliance:**

- ✅ Organizations — follows entity pattern
- ✅ Projects — follows entity pattern (minus activity split)
- ❌ Project Activities — scattered (fix in Step 1)
- ❌ Participants — missing types.ts, procedures.ts (fix in Step 2)
- ⚠️ Participate — uses constants/utils, but names inconsistent and monolithic form (fix in Step 2)
- ❌ Landing Page — all inline, no types/constants/utils separation
- ⚠️ Authentication — delegated to Better Auth, UI-only (acceptable)

**Changes for Landing Page:**

```
src/components/landingpage/
├── types.ts                        (NavItem, HeroProps, etc.)
├── constants.ts                    (navigation items, featured workshops, etc.)
├── components/                     (NEW: organize .tsx files)
│   ├── hero-section.tsx
│   ├── globe-section.tsx
│   ├── landing-header.tsx
│   ├── landing-page-gradients.tsx
│   └── ...
└── about/
    └── components/
        └── ...
```

**Benefits:**

- ✅ Consistent structure across all features
- ✅ Easy to navigate and understand any feature
- ✅ Clear separation of types, validation, logic, and UI
- ✅ Scales well as features grow

---

### **Step 4: Consolidate Activity Types into Single Source**

**Goal:** Remove duplicate type definitions; establish `src/config/activities.ts` as the single source of truth for activity-related configuration.

**Current Duplicates:**

- `ActivityValueType` in `src/components/features/projects/types.ts`
- `ParticipantActivityType` in `src/components/participate/types.ts`
- Activity distance defaults in multiple places
- Emission factors scattered

**New Structure:**

```
src/config/activities.ts
├── export enum ActivityValueType = { Boat, Bus, Train, Car } // project activities
├── export enum ParticipantActivityValueType = { ... Plane, ElectricCar } // extended for participants
├── export const ACTIVITY_DEFAULTS = { ... } // default distances, emissions
├── export const ACTIVITY_ICONS = { ... } // icon mappings
└── export const EMISSION_FACTORS = { ... } // all CO₂ calculation factors

src/features/project-activities/types.ts
├── export type { ActivityValueType } from '@/config/activities' // re-export from config
├── export interface ProjectActivity { ... } // extends ActivityValueType

src/components/participate/types.ts
├── export type { ParticipantActivityValueType } from '@/config/activities' // re-export from config
├── export interface ParticipantActivity { ... } // extends ParticipantActivityValueType
```

**Changes:**

1. Create/expand `src/config/activities.ts` with all activity enums, icons, defaults, emission factors
2. Update `src/features/project-activities/types.ts` → Import ActivityValueType from config
3. Update `src/components/participate/types.ts` → Import ParticipantActivityValueType from config
4. Update all components to import from config instead of redefining
5. Delete duplicate definitions

**Benefits:**

- ✅ Single source of truth for activity types and defaults
- ✅ Easy to update activity configuration globally
- ✅ Reduce import chains and circular dependencies
- ✅ Config folder becomes the hub for domain enums

---

### **Step 5: Move Questionnaire Flow Configuration**

**Goal:** Relocate questionnaire step definitions from component folder to `src/config/` for consistency.

**Current Location:**

```
src/components/participate/questionnaire-constants.ts
├── export const QUESTIONNAIRE_STEP_CONFIG = [...]
├── export const QUESTIONNAIRE_STEPS = { ... }
└── ...
```

**New Location:**

```
src/config/questionnaire-flow.ts
├── export const QUESTIONNAIRE_STEPS = { ... }
├── export const QUESTIONNAIRE_STEP_CONFIG = [...]
├── export const EMISSION_STEP_MARKERS = { ... } // which steps emit CO₂
└── ...
```

**Changes:**

1. Create `src/config/questionnaire-flow.ts`
2. Move `questionnaire-constants.ts` content to `src/config/questionnaire-flow.ts`
3. Update imports in `src/components/participate/` components
4. Delete `src/components/participate/questionnaire-constants.ts`

**Benefits:**

- ✅ Configuration collocated with other domain configs
- ✅ Consistent import pattern: `from '@/config/...'`
- ✅ Clearer that this is not UI code, but domain configuration
- ✅ Makes it easier to pass configuration to backend (if questionnaire persistence is added)

---

### **Step 6: Refactor Monolithic Procedure and Component Files**

**Goal:** Break up large files into logical, digestible modules.

#### **Project Procedures (1086 lines → ~4 modules)**

```
src/features/projects/procedures/
├── index.ts                        # Re-export all procedures
├── project.crud.ts                 # createProject, updateProject, deleteProject, archiveProject
├── project.queries.ts              # listProjects, getProjectById, getProjectForParticipation
├── project.mutations.ts            # batchDeleteProjects, setActiveProject
└── __tests__/
```

#### **Questionnaire Form (1018 lines → ~5 components)**

```
src/components/participate/components/
├── questionnaire-form.tsx           # Main orchestrator (form context, stepper, navigation)
├── questionnaire-step-demographics.tsx  # Steps 0-2, 13-14 (name, country, age, gender)
├── questionnaire-step-accommodation.tsx # Steps 3-5 (type, occupancy, electricity)
├── questionnaire-step-transport.tsx     # Steps 6-12 (plane, boat, train, bus, car + car details)
├── questionnaire-step-summary.tsx       # Final step (show emissions, impact modal)
└── __tests__/
```

**Changes:**

1. Create `src/features/projects/procedures/` subdirectory
2. Split `procedures.ts` into modules: `project.crud.ts`, `project.queries.ts`, `project.mutations.ts`
3. Create `src/features/projects/procedures/index.ts` for barrel export
4. Update `src/lib/orpc/router.ts` to import from new structure
5. Create `src/components/participate/components/` subdirectory
6. Extract questionnaire steps into separate components
7. Update `questionnaire-form.tsx` to compose steps

**Benefits:**

- ✅ Easier to navigate and understand each module
- ✅ Reduced cognitive load (no 1000+ line files)
- ✅ Better testability (test each step independently)
- ✅ Easier to reuse components or add new steps

---

## Updated Directory Structure After All Steps

### Root Level

```
src/
├── app/                             # Next.js App Router
├── components/                      # All frontend components
│   ├── features/
│   │   ├── organizations/           # DB Entity: Multi-tenant organization management
│   │   │   ├── components/
│   │   │   │   ├── create-organization-form.tsx
│   │   │   │   ├── edit-organization-form.tsx
│   │   │   │   ├── invite-employee-dialog.tsx
│   │   │   │   ├── organization-dashboard.tsx
│   │   │   │   ├── users-table.tsx
│   │   │   │   ├── organization-switcher.tsx
│   │   │   │   └── ...
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── projects/                # DB Entity: Mobility event projects
│   │   │   ├── components/
│   │   │   │   ├── create-project-form.tsx
│   │   │   │   ├── edit-project-form.tsx
│   │   │   │   ├── project-card.tsx
│   │   │   │   ├── project-details.tsx
│   │   │   │   ├── projects-list.tsx
│   │   │   │   ├── project-switcher.tsx
│   │   │   │   ├── sortable-header.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── projects-grid.tsx
│   │   │   │   │   ├── projects-table.tsx
│   │   │   │   │   ├── projects-table-columns.tsx
│   │   │   │   │   ├── projects-tab.tsx
│   │   │   │   │   └── archived-projects-tab.tsx
│   │   │   │   └── ...
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── project-activities/      # DB Entity: Travel segments within projects
│   │   │   ├── components/
│   │   │   │   ├── activity-form.tsx
│   │   │   │   ├── activity-dialog.tsx
│   │   │   │   ├── project-activities-table.tsx
│   │   │   │   ├── project-activity-dialog.tsx
│   │   │   │   ├── transport-icon.tsx
│   │   │   │   └── ...
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── participants/            # DB Entity: Users linked to projects
│   │   │   ├── components/
│   │   │   │   ├── participants-table.tsx
│   │   │   │   ├── participants-list.tsx
│   │   │   │   ├── participants-link-controls.tsx
│   │   │   │   └── ...
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   │
│   │   └── authentication/          # UI Area: Auth flows (delegated to Better Auth)
│   │       ├── components/
│   │       │   ├── login-form.tsx
│   │       │   ├── signup-form.tsx
│   │       │   ├── forgot-password-form.tsx
│   │       │   ├── reset-password-form.tsx
│   │       │   ├── oauth-buttons.tsx
│   │       │   ├── user-menu.tsx
│   │       │   └── ...
│   │       ├── index.ts
│   │       └── __tests__/
│   │
│   ├── participate/                 # UI Area: Public questionnaire for participants (NOT auth)
│   │   ├── types.ts                (ParticipantAnswers, EmissionCalculation, ParticipantActivity)
│   │   ├── constants.ts             (questionnaire step definitions)
│   │   ├── utils.ts                 (calculateEmissions, factor functions)
│   │   ├── components/
│   │   │   ├── questionnaire-form.tsx (orchestrator)
│   │   │   ├── questionnaire-step-demographics.tsx
│   │   │   ├── questionnaire-step-accommodation.tsx
│   │   │   ├── questionnaire-step-transport.tsx
│   │   │   ├── questionnaire-step-summary.tsx
│   │   │   ├── stats-overview.tsx
│   │   │   ├── transport-breakdown.tsx
│   │   │   ├── leaderboard.tsx
│   │   │   ├── impact-modal.tsx
│   │   │   ├── participate-header.tsx
│   │   │   ├── live-indicator.tsx
│   │   │   └── ...
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   ├── landingpage/                 # UI Area: Public marketing pages
│   │   ├── types.ts                (NavItem, HeroProps, etc.)
│   │   ├── constants.ts             (navigation, featured workshops)
│   │   ├── components/
│   │   │   ├── hero-section.tsx
│   │   │   ├── globe-section.tsx
│   │   │   ├── landing-header.tsx
│   │   │   ├── landing-page-gradients.tsx
│   │   │   ├── about/
│   │   │   │   └── about-section.tsx
│   │   │   ├── workshops/
│   │   │   │   ├── workshops-hero-section.tsx
│   │   │   │   ├── workshop-details.tsx
│   │   │   │   └── workshop-tab-select.tsx
│   │   │   └── ...
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   ├── ui/                          # shadcn/ui components (reusable across features)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   └── socket/                      # Socket.IO client wrapper (POC)
│       ├── socket-client.tsx
│       └── __tests__/
│
├── features/                        # Feature-specific business logic (types, schemas, procedures)
│   ├── organizations/
│   │   ├── types.ts
│   │   ├── validation-schemas.ts
│   │   ├── procedures.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   ├── projects/
│   │   ├── types.ts
│   │   ├── validation-schemas.ts
│   │   ├── procedures/         # REFACTORED: split into modules
│   │   │   ├── index.ts
│   │   │   ├── project.crud.ts
│   │   │   ├── project.queries.ts
│   │   │   ├── project.mutations.ts
│   │   │   └── __tests__/
│   │   ├── config.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   ├── project-activities/     # EXTRACTED: first-class entity
│   │   ├── types.ts
│   │   ├── validation-schemas.ts
│   │   ├── procedures.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   ├── participants/           # IMPROVED: now has full structure
│   │   ├── types.ts
│   │   ├── validation-schemas.ts
│   │   ├── procedures.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   └── index.ts                # Barrel export for all features
│
├── lib/
│   │
│   ├── orpc/                        # oRPC tool library (client, router, middleware, adapters)
│   │   ├── router.ts                # Main oRPC router (imports procedures from features)
│   │   ├── client.ts                # Client initialization
│   │   ├── client.server.ts         # Server-side client
│   │   ├── middleware.ts            # Auth/org context middleware
│   │   ├── openapi-handler.ts       # OpenAPI integration
│   │   ├── scalar-sri.ts            # Scalar documentation
│   │   ├── README.md
│   │   └── __tests__/
│   │
│   ├── drizzle/                     # Database schema & migrations
│   │   ├── schemas/
│   │   │   ├── auth-schema.ts       (Better Auth — auto-generated)
│   │   │   └── schema.ts            (Custom: projects, activities, participants)
│   │   ├── migrations/
│   │   └── ...
│   │
│   ├── i18n/                        # Internationalization
│   │   ├── translations/
│   │   │   ├── en.json
│   │   │   └── de.json
│   │   └── ...
│   │
│   ├── email/                       # Email templates
│   │   └── ...
│   │
│   ├── better-auth/                 # Authentication config
│   │   └── ...
│   │
│   └── validations/                 # Shared Zod schemas (if any)
│       └── ...
│
├── config/                           # Domain configuration (CENTRALIZED)
│   ├── activities.ts                 # Activity types, icons, defaults, emission factors (NEW)
│   ├── questionnaire-flow.ts         # Questionnaire steps, markers (NEW)
│   ├── languages.ts
│   ├── pagination.ts
│   ├── organizations.ts
│   └── ...
│
├── hooks/                            # React hooks
│   └── ...
│
├── instrumentation.ts                # Next.js instrumentation
├── middleware.ts                     # Auth middleware
└── ...
```

---

## Further Considerations & Clarifications

### **1. Questionnaire Data Persistence (Phase 2 Design)**

Currently questionnaire responses are **never persisted to database**. Before implementing refactoring, clarify:

**Option A: Add to Participants Entity**

```
participants/ (enhanced)
├── types.ts
│   ├── ProjectParticipant (existing)
│   ├── ParticipantQuestionnaire (new: 14 answers + calculated emissions)
├── validation-schemas.ts
├── procedures.ts
│   ├── listProjectParticipants() (existing)
│   ├── submitParticipantQuestionnaire() (new)
│   ├── getParticipantQuestionnaire() (new)
└── ...
```

**Option B: Create Separate questionnaire-responses Entity**

```
questionnaire-responses/
├── types.ts
│   ├── QuestionnaireResponse (14 answers, participant ID, project ID, CO₂ calculation)
├── validation-schemas.ts
├── procedures.ts
│   ├── submitQuestionnaire()
│   ├── getQuestionnaireResponse()
│   ├── listProjectResponses()
└── ...
```

**Recommendation:** Option A is simpler; responses are always linked to a participant. If you need to track multiple responses per participant (revisions), reconsider for Phase 2.

**Decision Needed:** Should you add questionnaire response persistence table now (Part of refactor) or defer to Phase 2?

---

### **2. Activities Deletion Cascade**

Current behavior: Project activities cascade-delete when project is deleted.

**Confirm:**

- Is this intentional? ✅ (seems correct — activity is part of project)
- Should activities ever exist without a project? ❌ (no)
- Should organizers be able to bulk delete activities? ✅ (add procedure if not exists)
- Should deletion be soft (archive) or hard (cascade)? ⚠️ (clarify)

**Action:** Document cascade behavior in `src/features/project-activities/README.md` and add deletion tests.

---

### **3. Shared Component Library Scope**

Boundary between feature-specific and shared components:

**Current:**

- `src/components/ui/` — shadcn/ui components (buttons, cards, forms, etc.)
- `src/components/features/*/components/*.tsx` — feature-specific (create-org-form, users-table, etc.)

**Should you add a `src/components/shared/` layer?**

Examples of candidates:

- `participant-card.tsx` — Used in leaderboard + admin dashboard?
- `activity-icon.tsx` — Used in project-activities + participate?
- `emission-badge.tsx` — Used in multiple features?

**Recommendation:** Only create `shared/` if a component is reused in 3+ features. For now, keep feature-specific components in their own folders.

---

### **4. Better Auth Organization Procedures**

Organizations rely on **Better Auth API** (not oRPC). Current structure:

```
src/features/organizations/
├── types.ts (sync with Better Auth schema)
├── validation-schemas.ts (form validation only)
├── procedures.ts (aggregation only: getOrganizationStats, searchMembers)
```

**Clarify:** Should organization CRUD (create, update, delete, invite) use oRPC or Better Auth API directly?

**Current:** Better Auth API is called directly from components.

**Recommendation:** Keep as-is. Better Auth manages auth state; oRPC handles statistics/aggregations.

---

## Implementation Checklist

Once you approve the plan, the refactoring will follow these phases:

### **Phase 1: Foundation (0-dependencies work)**

- [ ] Create `src/config/activities.ts` (new file with all activity config)
- [ ] Create `src/config/questionnaire-flow.ts` (move from component)
- [ ] Create `src/features/` directory structure

### **Phase 2: Extract Project Activities**

- [ ] Create `src/features/project-activities/{types, validation-schemas, procedures}.ts`
- [ ] Extract activity procedures from `projects/procedures.ts`
- [ ] Update imports across `projects/`, `project-activities/` components
- [ ] Update `src/lib/orpc/router.ts`

### **Phase 3: Enhance Participants**

- [ ] Create `src/features/participants/{types, validation-schemas, procedures}.ts`
- [ ] Create dedicated participant procedures (currently borrowed from projects)
- [ ] Update components to import from new location

### **Phase 4: Refactor Questionnaire & Participate**

- [ ] Reorganize `src/components/participate/` with `components/` subdirectory
- [ ] Split `questionnaire-form.tsx` into step components
- [ ] Rename `questionnaire-utils.ts` → `utils.ts`
- [ ] Update all imports in participate folder

### **Phase 5: Refactor Projects Procedures**

- [ ] Create `src/features/projects/procedures/` subdirectory
- [ ] Split procedures into modules: `project.crud.ts`, `project.queries.ts`, `project.mutations.ts`
- [ ] Create barrel export in `procedures/index.ts`
- [ ] Update `src/lib/orpc/router.ts`

### **Phase 6: Improve Landing Page**

- [ ] Create `src/components/landingpage/{types.ts, constants.ts}`
- [ ] Create `src/components/landingpage/components/` subdirectory
- [ ] Move all .tsx files into `components/`

### **Phase 7: Testing & Validation**

- [ ] Run `pnpm run lint && pnpm run format`
- [ ] Run `pnpm run test:run` for all affected files
- [ ] Manual testing of all features
- [ ] Verify no circular imports

---

## Approval Needed On

Before implementing, confirm:

1. **Questionnaire Persistence:** Add now (Phase 2 design) or defer to Phase 2?
2. **Shared Components:** Create `src/components/shared/` layer or keep in features?
3. **File Splitting:** Do you want to split monolithic files (procedures, components) in this refactor or separate PRs?
4. **Better Auth Procedures:** Keep using Better Auth API directly, or wrap in oRPC?
5. **Timeline:** Full refactor in one branch, or phase it in multiple PRs?

Once you approve, I can proceed with implementation!
