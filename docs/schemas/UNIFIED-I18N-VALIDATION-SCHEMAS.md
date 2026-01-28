# Unified i18n Validation Schemas Pattern

## Overview

This document describes the unified validation schema pattern for handling i18n validation messages across both client and server contexts. This approach eliminates schema duplication, ensures consistent translations, and provides a clean developer experience.

**Branch Goal:** Turn `activityInputSchema` and `activityUpdateSchema` from this branch into a documented pattern that can be applied to ALL other schemas in the project.

---

## Problem Statement

### Before Refactoring

1. **Schema Duplication**
   ```typescript
   // Separate exports for create and update
   export const CreateActivityInputSchema = ...
   export const UpdateActivityInputSchema = ...
   export const ActivityFormItemSchema = ...  // unused
   export const EditActivityFormItemSchema = ...  // unused
   ```
   - Four different schema definitions for essentially the same entity
   - Unclear which schema to use where
   - Hard to maintain consistency

2. **No i18n Validation for Updates**
   - Create operations had translated validation messages
   - Update operations had NO i18n support
   - Edit functionality existed but didn't use proper schemas

3. **Duplicate Translation Strings**
   - Production code: translations in JSON files
   - Test code: hardcoded mock translations (duplicated strings)
   - Translation changes didn't automatically reflect in tests

4. **Client/Server Mismatch**
   - Some schemas worked only client-side
   - Some only server-side
   - Had to maintain parallel implementations

### Consequences

- Maintenance burden: changes in multiple places
- Bug risk: inconsistent validation client vs server
- Developer confusion: which schema to use?
- Test brittleness: mock translations disconnect from reality

---

## Solution Architecture

### 1. Unified Translation Function Type

```typescript
/**
 * Import server- or client-side translations, one or the other
 */
import { getTranslations } from "@greendex/i18n/server";
import { useTranslations } from "@greendex/i18n/client";

/**
 * Unified translation function type that works for both client and server
 * Accepts return types from both useTranslations() and getTranslations()
 */
type TranslateFn =
  | ReturnType<typeof useTranslations>
  | Awaited<ReturnType<typeof getTranslations>>;
```

**Why this works:**
- `useTranslations()` returns a function: `(key: string, params?: object) => string`
- `getTranslations()` also returns the same function type (async)
- Both signatures are compatible at the type level
- Single type definition handles both contexts

### 2. Unified Schema Factories

Instead of static exports, use factory functions that accept the translation function:

```typescript
/**
 * Create schema for creating activities with translated validation messages
 *
 * Works for both client-side (useTranslations) and server-side (getTranslations)
 * Omits auto-generated fields (id, timestamps)
 *
 * @param t - Translation function (from useTranslations() or await getTranslations())
 * @returns Zod schema for creating activities with i18n validation
 *
 * @example Client-side
 * const t = useTranslations("project.activities");
 * const schema = activityInputSchema(t);
 *
 * @example Server-side
 * const t = await getTranslations("project.activities");
 * const schema = activityInputSchema(t);
 */
export function activityInputSchema(t: TranslateFn) {
  return createInsertSchema(projectActivitiesTable)
    .omit({ id: true, createdAt: true, updatedAt: true })
    .extend({
      distanceKm: createDistanceSchema(t),
    });
}

/**
 * Create schema for updating activities with translated validation messages
 *
 * Works for both client-side (useTranslations) and server-side (getTranslations)
 * Requires id and projectId, makes other fields optional for partial updates
 *
 * @param t - Translation function (from useTranslations() or await getTranslations())
 * @returns Zod schema for updating activities with i18n validation
 */
export function activityUpdateSchema(t: TranslateFn) {
  return createUpdateSchema(projectActivitiesTable)
    .omit({ createdAt: true, updatedAt: true })
    .extend({
      id: z.string(),
      projectId: z.string(),
      distanceKm: createDistanceSchema(t),
    });
}
```

### 3. Helper Schema with i18n

```typescript
/**
 * Create distance validation schema with i18n error messages
 *
 * @param t - Translation function
 * @param optional - If true, field is optional (undefined allowed)
 * @returns Zod schema for distance with translated validation messages
 */
export function createDistanceSchema(
  t: TranslateFn,
  optional?: boolean,
): z.ZodType<number | undefined> {
  const base = z.number()
    .refine(
      (val) => val >= MIN_DISTANCE_KM,
      {
        message: t("project.activities.form.validation.distanceKm.min", {
          min: MIN_DISTANCE_KM,
        }),
      }
    )
    .refine(
      (val) => val <= MAX_DISTANCE_KM,
      {
        message: t("project.activities.form.validation.distanceKm.max", {
          max: MAX_DISTANCE_KM,
        }),
      }
    )
    .refine(validateDistanceStep, {
      message: t("project.activities.form.validation.distanceKm.step", {
        step: DISTANCE_KM_STEP,
      }),
    });

  return optional ? base.optional() : base;
}
```

---

## Usage Patterns

### Client Component (React)

```typescript
"use client";

import { useTranslations } from "@greendex/i18n/client";
import { useMemo } from "react";
import { activityInputSchema, activityUpdateSchema } from "@/features/project-activities/validation-schemas";

export function ProjectActivityForm({ isEditing }: { isEditing: boolean }) {
  const t = useTranslations("project.activities");

  // Memoize schemas to avoid re-creating on every render
  const CreateSchema = useMemo(() => activityInputSchema(t), [t]);
  const UpdateSchema = useMemo(() => activityUpdateSchema(t), [t]);

  const schema = isEditing ? UpdateSchema : CreateSchema;

  // Use schema for form validation
  // ...
}
```

**Key Points:**
- Import translation with specific namespace
- Schemas are created once, memoized for performance
- Safe to call synchronously (no async needed)
- Single call to `activityInputSchema(t)` handles all cases

### Server Component / Procedure

```typescript
import { getTranslations } from "@greendex/i18n/server";
import { activityUpdateSchema } from "@/features/project-activities/validation-schemas";

export const updateActivityProcedure = protectedProcedure
  .input(async (ctx) => {
    const t = await getTranslations("project.activities");
    return activityUpdateSchema(t);
  })
  .mutation(({ input }) => {
    // Validation happens automatically via Zod
    // input is fully typed and validated
  });
```

**Key Points:**
- `await getTranslations()` for async context
- Same factory function works without code duplication
- Validation messages automatically translated server-side

### Type-Only Validation (No i18n Needed)

For internal APIs or places where validation messages don't need translation:

```typescript
// Use base Drizzle schemas directly
const createActivitySchema = createInsertSchema(projectActivitiesTable)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Or inline in procedures
export const internalProcedure = procedure
  .input(
    createInsertSchema(projectActivitiesTable).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    })
  )
  .mutation(({ input }) => {
    // Type validation only, no i18n
  });
```

**When to Use:**
- Internal/system procedures where users don't see errors
- Type inference purposes only
- Performance-critical paths where schema creation overhead matters

---

## Testing Strategy

### Before: Mock Translation Functions (Anti-pattern)

```typescript
// ❌ AVOID: Duplicating translation logic in tests
function createTranslationFunction(locale = "en") {
  const mockFn = vi.fn((key: string, params?: object) => {
    // Manually navigate nested keys, parse parameters, etc.
    // Type casting required: return mockFn as any
  });
  return mockFn as any;
}

// Problems:
// - Reimplements translator behavior
// - Type casting needed (as any)
// - Duplicates logic that could break
// - Hard to maintain as new locales added
```

### After: Real next-intl Translators (✅ Best Practice)

```typescript
// ✅ BEST: Use actual createTranslator from next-intl
import { createTranslator } from "@greendex/i18n";
import deMessages from "@greendex/i18n/locales/de.json";
import enMessages from "@greendex/i18n/locales/en.json";

// Create real translators at module level - reuse in all tests
const tEn = createTranslator({
  locale: "en",
  messages: enMessages,
});

const tDe = createTranslator({
  locale: "de",
  messages: deMessages,
});

// Usage in tests - same as production!
describe("Activity Schema", () => {
  it("should validate with real translated messages (English)", () => {
    const schema = activityInputSchema(tEn);
    const result = schema.safeParse({ distanceKm: 0.05 });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "Distance must be at least 0.1 km"
    );
  });

  it("should validate with real translated messages (German)", () => {
    const schema = activityInputSchema(tDe);
    const result = schema.safeParse({ distanceKm: 0.05 });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "Die Entfernung muss mindestens 0.1 km betragen"
    );
  });
});
```

**Benefits:**
- ✅ Uses **real** next-intl translator behavior
- ✅ No custom translation logic in tests
- ✅ No type casting or workarounds
- ✅ Tests identical to production translator setup
- ✅ Translation changes automatically tested
- ✅ Easy to add new locales (just create new translator)
- ✅ Single source of truth: JSON files

---

## Testing Implementation Guide

### Key Learning: Namespace Configuration

When using `createTranslator` in tests, **do NOT specify a namespace** if your validation code uses full paths:

```typescript
// ✅ Correct - validation code uses full paths like "project.activities.form.validation.distanceKm.min"
const tEn = createTranslator({
  locale: "en",
  messages: enMessages,
  // ← No namespace specified
});

// ❌ Wrong - would double-namespace: "project.activities.project.activities.form.validation.distanceKm.min"
const tEn = createTranslator({
  locale: "en",
  messages: enMessages,
  namespace: "project.activities", // ← This duplicates namespace in path
});
```

### Test Structure Pattern

```typescript
import { createTranslator } from "@greendex/i18n";
import { describe, expect, it } from "vitest";
import deMessages from "@greendex/i18n/locales/de.json";
import enMessages from "@greendex/i18n/locales/en.json";

// 1. Create translators at module level (top of file)
const tEn = createTranslator({
  locale: "en",
  messages: enMessages,
});

const tDe = createTranslator({
  locale: "de",
  messages: deMessages,
});

// 2. Reuse in all test descriptions
describe("Activity Schema", () => {
  it("English validation messages", () => {
    const schema = activityInputSchema(tEn);
    const result = schema.safeParse({ /* test data */ });
    expect(result.error.issues[0].message).toBe("Distance must be at least 0.1 km");
  });

  it("German validation messages", () => {
    const schema = activityInputSchema(tDe);
    const result = schema.safeParse({ /* test data */ });
    expect(result.error.issues[0].message).toBe("Die Entfernung muss mindestens 0.1 km betragen");
  });
});
```

### Best Practices for Test Translations

1. **Create translators once, at module level**
   - Avoid recreating on each test
   - Expensive operation if done repeatedly
   - Share `tEn` and `tDe` across all test cases

2. **Use real translation JSON files**
   - Import from `@/lib/i18n/translations/en.json`
   - Tests validate actual production translations
   - Changes in JSON automatically tested

3. **Test both languages**
   - English tests catch logic errors
   - German tests catch parameter interpolation issues
   - Both catch translation key mismatches

4. **No type casting needed**
   - `createTranslator` returns correctly typed function
   - No `as any` required
   - TypeScript validates translation keys

### Common Test Patterns

**Test validation messages exist:**
```typescript
it("provides translated error for min distance", () => {
  const schema = activityInputSchema(tEn);
  const result = schema.safeParse({ distanceKm: 0.05 });
  
  expect(result.success).toBe(false);
  expect(result.error.issues[0].message).toBe("Distance must be at least 0.1 km");
});
```

**Test parameter interpolation:**
```typescript
it("interpolates min distance parameter correctly", () => {
  const schema = activityInputSchema(tEn);
  const result = schema.safeParse({ distanceKm: 0.05 });
  
  expect(result.error.issues[0].message).toContain("0.1");
});
```

**Test multiple error conditions:**
```typescript
describe("Distance validation all errors", () => {
  it("min boundary violation", () => {
    const schema = activityInputSchema(tEn);
    expect(schema.safeParse({ distanceKm: 0.05 }).error.issues[0].message)
      .toBe("Distance must be at least 0.1 km");
  });

  it("max boundary violation", () => {
    const schema = activityInputSchema(tEn);
    expect(schema.safeParse({ distanceKm: 6000.1 }).error.issues[0].message)
      .toBe("Distance cannot exceed 6000 km");
  });

  it("step increment violation", () => {
    const schema = activityInputSchema(tEn);
    expect(schema.safeParse({ distanceKm: 0.15 }).error.issues[0].message)
      .toBe("Distance must be in increments of 0.1 km");
  });
});
```

### Real Example from Codebase

See [src/__tests__/distance-validation.test.ts](../../src/__tests__/distance-validation.test.ts) for the complete working implementation using `createTranslator`. This file demonstrates:
- Creating module-level translators
- Reusing across all test suites
- Testing both English and German translations
- Full test suite passing with real next-intl behavior

---

### Step 1: Identify Schema Candidates

Look for patterns:
- Static schema exports (const MySchema = ...)
- Multiple variant schemas (Create/Update/Form/etc.)
- Hardcoded validation messages
- Separate server/client implementations

Example schemas to refactor:
- `ProjectFormSchema` / `EditProjectSchema`
- `ParticipantSchema` / `ParticipantFormSchema`
- Any schema with hardcoded error messages

### Step 2: Create Unified Type

```typescript
type MyResourceFn =
  | ReturnType<typeof useTranslations>
  | Awaited<ReturnType<typeof getTranslations>>;
```

### Step 3: Extract i18n Validations

Identify all custom validations that have user-facing messages:

```typescript
// Before: Inline refine with hardcoded message
email: z.string().email("Invalid email address")

// After: Extract to helper with i18n
function createEmailSchema(t: MyResourceFn) {
  return z.string().refine(
    (val) => isValidEmail(val),
    {
      message: t("form.validation.email.invalid"),
    }
  );
}
```

### Step 4: Create Factory Functions

```typescript
export function myResourceSchema(t: MyResourceFn) {
  return z.object({
    id: z.string(),
    name: z.string(),
    email: createEmailSchema(t),
    // ... other fields
  });
}

export function myResourceUpdateSchema(t: MyResourceFn) {
  return myResourceSchema(t).partial().extend({
    id: z.string(), // id is required for updates
  });
}
```

### Step 5: Update Components

```typescript
// Before: Static import
import { MyResourceSchema } from "@/schemas";

// After: Factory pattern
import { myResourceSchema } from "@/schemas";

export function MyComponent() {
  const t = useTranslations("namespace");
  const schema = useMemo(() => myResourceSchema(t), [t]);
  // ...
}
```

### Step 6: Update Tests

```typescript
// Load real translations instead of mocks
import enMessages from "@greendex/i18n/locales/en.json";

function createT(locale = "en") {
  // Use same createTranslationFunction helper from distance-validation.test.ts
}
```

### Step 7: Remove Unused Schemas

After updating all usages:
- Delete old static schema exports
- Remove unused variants
- Clean up test mocks

---

## Key Principles

### 1. **Single Source of Truth**
- One factory function per operation type (create, update, etc.)
- No static schema exports
- Translations live in JSON files, not code

### 2. **Client/Server Agnostic**
- `TranslateFn` type works in both contexts
- Same factory code, different translation context
- No parallel implementations needed

### 3. **Type Safety**
- Zod provides runtime validation
- TypeScript infers correct types
- `z.infer<typeof schema>` for type exports

### 4. **Developer Experience**
- Clear naming: `activityInputSchema(t)` vs `activityUpdateSchema(t)`
- Comprehensive JSDoc with examples
- Memoization in components prevents re-renders

### 5. **Testability**
- Real translations in tests
- Mock translation function loads from JSON
- Validates schema AND translations simultaneously

---

## Translation File Structure

Organize translations with clear namespaces:

```json
{
  "project.activities": {
    "form": {
      "validation": {
        "distanceKm": {
          "min": "Distance must be at least {min} km",
          "max": "Distance cannot exceed {max} km",
          "step": "Distance must be in increments of {step} km"
        }
      }
    }
  }
}
```

**Naming Convention:**
- `domain.resource.form.validation.field.rule`
- Makes translations easy to locate
- Groups related messages together
- Scales to large translation files

---

## Implementation Checklist

When refactoring a new schema family:

- [ ] Define `TranslateFn` type (can reuse existing)
- [ ] Extract all i18n validation into helper functions
- [ ] Create factory functions for each operation (create, update, etc.)
- [ ] Add comprehensive JSDoc with client/server examples
- [ ] Update all components to use `useMemo(() => schema(t), [t])`
- [ ] Update all server procedures to use factory with `await getTranslations()`
- [ ] Replace mock translations with real translation loading in tests
- [ ] Delete old static schema exports
- [ ] Run full test suite (all 147+ tests must pass)
- [ ] Run `pnpm run format && pnpm run lint`
- [ ] Update related documentation

---

## Performance Considerations

### Schema Memoization

Always memoize factory-created schemas in components:

```typescript
// ✅ Good: Prevents re-creating on every render
const CreateSchema = useMemo(() => activityInputSchema(t), [t]);

// ❌ Bad: Creates new schema on every render
const schema = activityInputSchema(t);
```

### Translation Lookup

The factory approach is efficient:
- Schema created once, reused for multiple validations
- Translation function called during validation, not during schema creation
- No network requests (translations are bundled)

### Type Inference

Use `z.infer<>` for type exports:

```typescript
type ActivityInput = z.infer<ReturnType<typeof activityInputSchema>>;
type ActivityUpdate = z.infer<ReturnType<typeof activityUpdateSchema>>;
```

---

## Common Patterns & Anti-patterns

### ✅ DO

```typescript
// Create schemas with factory when handling user input
const t = useTranslations("namespace");
const schema = useMemo(() => createSchema(t), [t]);

// Use inline Drizzle schemas for type-only validation
const typeSchema = createInsertSchema(table);

// Test with real translations
const t = createTranslationFunction("en");
const schema = activityInputSchema(t);
expect(schema.safeParse(...)).toBe(expected);
```

### ❌ DON'T

```typescript
// Don't hardcode error messages
const schema = z.string().min(1, "This field is required");

// Don't create different schemas for every use case
export const FormSchema = ...;
export const APISchema = ...;
export const InternalSchema = ...;

// Don't duplicate translations in tests
const translations = {
  "key": "hardcoded message"
};

// Don't recreate schemas on every render
export function Component() {
  const schema = activityInputSchema(t); // Creates new on each render
}
```

---

## Next Steps for This Project

1. **Apply to Project Schemas**
   - Refactor `CreateProjectWithActivitiesSchema` / `EditProjectWithActivitiesSchema`
   - Extract nested activity validation

2. **Apply to User/Auth Schemas**
   - Refactor password/email validation schemas
   - Add i18n to auth error messages

3. **Apply to Dynamic Forms**
   - Refactor questionnaire/participation schemas
   - Add i18n support for all form validations

4. **Documentation**
   - Add schema patterns to project architecture docs
   - Create quick reference for schema factory pattern
   - Add linting rules to enforce pattern

---

## References

- **File:** `src/features/project-activities/validation-schemas.ts` - Reference implementation
- **Test:** `src/__tests__/distance-validation.test.ts` - Testing pattern
- **Components:** `src/features/project-activities/components/project-activity-form.tsx` - Usage example
- **Procedures:** `src/features/project-activities/procedures.ts` - Server-side usage

---

## FAQ

**Q: Why not just use `getTranslations()` everywhere?**
A: `getTranslations()` is async and only works in Server Components. Client Components need `useTranslations()`. The `TranslateFn` type bridges both worlds.

**Q: Can I use static schema exports?**
A: Only for type-validation-only cases where i18n isn't needed. For any schema with custom messages, use the factory pattern.

**Q: What about complex nested validations?**
A: Create helper functions for complex validations, then extend the base schema. See `createDistanceSchema()` pattern.

**Q: How do I test server procedures?**
A: Same as components - use the `createTranslationFunction()` helper from tests to create mock translation functions that load real translations.

**Q: Should I memoize server-side schemas?**
A: No - server procedures run once per request. Memoization is only needed in React components.

