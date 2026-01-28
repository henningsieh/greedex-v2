# Unified i18n Validation Schemas - Quick Reference

## TL;DR: The Pattern

```typescript
// 1. Define translation function type (once per file)
type ResourceFn = ReturnType<typeof useTranslations> | Awaited<ReturnType<typeof getTranslations>>;

// 2. Create factory functions for each operation
export function resourceSchema(t: ResourceFn) {
  return z.object({
    name: z.string(),
    email: z.string().refine(
      (val) => isValid(val),
      { message: t("namespace.field.error") }
    ),
  });
}

// 3. Use in components with memoization
const t = useTranslations("namespace");
const schema = useMemo(() => resourceSchema(t), [t]);

// 4. Use in procedures as-is
const t = await getTranslations("namespace");
const schema = resourceSchema(t);
```

---

## Before & After

### ❌ Old Pattern (Don't Use)

```typescript
// Multiple schema exports
export const CreateActivitySchema = ...;
export const EditActivitySchema = ...;
export const ActivityFormSchema = ...;

// No i18n for updates
// Hardcoded error messages
// Duplication everywhere
```

### ✅ New Pattern (Use This)

```typescript
// One factory per operation
export function activitySchema(t: TranslateFn) { ... }
export function activityUpdateSchema(t: TranslateFn) { ... }

// i18n everywhere
// Single source of truth
// Works client AND server
```

---

## Client Component Usage

```typescript
"use client";
import { useTranslations } from "@greendex/i18n";
import { useMemo } from "react";
import { activitySchema } from "@/features/activities/schemas";

export function ActivityForm() {
  const t = useTranslations("activities");
  
  // Memoize schema
  const schema = useMemo(() => activitySchema(t), [t]);
  
  // Use schema for form validation
  const form = useForm({ resolver: zodResolver(schema) });
  
  return (/* JSX */);
}
```

---

## Server Procedure Usage

```typescript
import { getTranslations } from "@greendex/i18n";
import { activitySchema } from "@/features/activities/schemas";

export const createActivity = protectedProcedure
  .input(async (ctx) => {
    const t = await getTranslations("activities");
    return activitySchema(t);
  })
  .mutation(({ input }) => {
    // input is validated and typed
  });
```

---

## Testing Usage

Use **real** `next-intl` translators with `createTranslator` and actual translation files - no mocks needed:

```typescript
import { createTranslator } from "@greendex/i18n";
import deMessages from "@greendex/i18n/locales/de.json";
import enMessages from "@greendex/i18n/locales/en.json";
import { describe, it, expect } from "vitest";

// Create real translators at module level - reuse in all tests
const tEn = createTranslator({
  locale: "en",
  messages: enMessages,
});

const tDe = createTranslator({
  locale: "de",
  messages: deMessages,
});

describe("Activity Validation", () => {
  it("validates with real i18n messages (English)", () => {
    const schema = activitySchema(tEn);
    const result = schema.safeParse({ /* invalid data */ });
    
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Distance must be at least 0.1 km");
  });

  it("validates with real i18n messages (German)", () => {
    const schema = activitySchema(tDe);
    const result = schema.safeParse({ /* invalid data */ });
    
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Die Entfernung muss mindestens 0.1 km betragen");
  });
});
```

**Key Insights:**
- ✅ Uses **real** `{ createTranslator }` from "@greendex/i18n"
- ✅ Loads **actual** JSON translation files
- ✅ No type casting (`as any`), no mock functions
- ✅ Tests verify schema AND translations simultaneously
- ✅ Translation changes automatically reflected in tests
- ✅ Identical translator behavior to production code

**Critical: No Namespace in Tests**
```typescript
// ✅ Correct - validation uses full paths
const tEn = createTranslator({ locale: "en", messages: enMessages });

// ❌ Wrong - would duplicate namespace in path
const tEn = createTranslator({ 
  locale: "en", 
  messages: enMessages, 
  namespace: "project.activities" // Don't do this!
});
```

---

## Type Definitions

```typescript
// Translation function type (works client + server)
type TranslateFn = 
  | ReturnType<typeof useTranslations>
  | Awaited<ReturnType<typeof getTranslations>>;

// Export types from schemas
type ActivityInput = z.infer<ReturnType<typeof activitySchema>>;
type ActivityUpdate = z.infer<ReturnType<typeof activityUpdateSchema>>;
```

---

## Translation File Organization

```json
{
  "domain": {
    "resource": {
      "form": {
        "validation": {
          "field": {
            "required": "Field is required",
            "invalid": "Field is invalid",
            "min": "Field must be at least {min} characters"
          }
        }
      }
    }
  }
}
```

**Use:** `t("domain.resource.form.validation.field.required")`

---

## Create New Unified Schema

### Step 1: Find the schema file

```
src/features/[domain]/validation-schemas.ts
```

### Step 2: Add TranslateFn type

```typescript
/**
 * Import server- or client-side translations, one or the other
 */
import { getTranslations } from "@greendex/i18n";
import { useTranslations } from "@greendex/i18n";

type TranslateFn = 
  | ReturnType<typeof useTranslations>
  | Awaited<ReturnType<typeof getTranslations>>;
```

### Step 3: Create factory functions

```typescript
export function myResourceSchema(t: TranslateFn) {
  return z.object({
    name: z.string().refine(
      (val) => val.length > 0,
      { message: t("namespace.name.required") }
    ),
  });
}

export function myResourceUpdateSchema(t: TranslateFn) {
  return myResourceSchema(t).partial().extend({
    id: z.string(),
  });
}
```

### Step 4: Add JSDoc with examples

```typescript
/**
 * Validation schema for creating resources with i18n error messages
 * 
 * @param t - Translation function (useTranslations or getTranslations)
 * @returns Zod validation schema
 * 
 * @example Client-side
 * const t = useTranslations("namespace");
 * const schema = myResourceSchema(t);
 * 
 * @example Server-side
 * const t = await getTranslations("namespace");
 * const schema = myResourceSchema(t);
 */
```

### Step 5: Update components

```typescript
// Replace static imports
// const schema = MyResourceSchema; ❌

// With factory calls
const t = useTranslations("namespace");
const schema = useMemo(() => myResourceSchema(t), [t]); ✅
```

### Step 6: Update procedures

```typescript
// Use factory with await
const t = await getTranslations("namespace");
const schema = myResourceSchema(t);
```

### Step 7: Update tests

```typescript
// Load real translations
const t = createT("en");
const schema = myResourceSchema(t);
```

### Step 8: Clean up

- Delete old static schema exports
- Remove unused schema variants
- Update imports in all files

---

## Checklist

- [ ] Define `TranslateFn` type
- [ ] Create factory functions
- [ ] Add JSDoc examples
- [ ] Update all components to use `useMemo()`
- [ ] Update all procedures with `await getTranslations()`
- [ ] Update tests to load real translations
- [ ] Delete old schema exports
- [ ] Run tests: `bun run test`
- [ ] Run format: `bun run format`
- [ ] Run lint: `bun run lint`

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do |
|---------|--------|
| `export const schema = z.object(...)` | `export function schema(t) { return z.object(...) }` |
| `"Error message"` in refine | `t("namespace.field.error")` in refine |
| Create schema every render | `useMemo(() => schema(t), [t])` |
| Mock translations in tests | Load from `en.json` / `de.json` |
| Separate create/edit schemas | Use `.partial()` for updates |
| Hardcode error messages | All messages → translation files |

---

## Implementation Notes from Real Refactoring

This pattern was proven working in [src/__tests__/distance-validation.test.ts](../../src/__tests__/distance-validation.test.ts) with all 26 tests passing:

**What changed:**
- ✅ Switched from custom mock translation functions to `createTranslator`
- ✅ Removed 50+ lines of mock translation logic
- ✅ Removed all `as any` type casting
- ✅ Removed `vi.fn()` mock tracking code
- ✅ Tests now use identical translators as production

**Results:**
- All 26 tests passing with real next-intl behavior
- Translation changes automatically caught by tests
- 100% type-safe, zero workarounds
- Single translator instance reused across all tests

**Key Discovery:**
When validation code uses full paths like `t("project.activities.form.validation.distanceKm.min")`, the test translator should have **no namespace** specified. Otherwise the path gets duplicated.

---

### Activity Schemas
- **File:** `src/features/project-activities/validation-schemas.ts`
- **Components:** `src/features/project-activities/components/project-activity-form.tsx`
- **Procedures:** `src/features/project-activities/procedures.ts`
- **Tests:** `src/__tests__/distance-validation.test.ts`

---

## Common Questions

**Q: Can I still use static schemas?**
A: Only for type-only validation where error messages don't exist.

**Q: Performance impact?**
A: Negligible. Schema creation is fast; translations are bundled. Use memoization in React.

**Q: What about nested objects?**
A: Use composition - create helper functions for nested validations.

**Q: How to share schemas?**
A: Export types with `z.infer<ReturnType<typeof schema>>`, factories are created per-context.

**Q: Legacy code still using old pattern?**
A: Refactor gradually. New schemas use factory pattern. Old schemas can stay until refactored.

