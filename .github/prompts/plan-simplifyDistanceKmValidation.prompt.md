# Plan: Simplify distanceKm Validation & Type Handling

## Current State Analysis

The current implementation has **4 type conversion points** (DB→number→form→API→DB) and **3 near-identical Zod schemas** with duplicated validation logic. This creates maintenance burden and potential bug surfaces.

### Key Issues Identified

1. **Schema Redundancy**: Three schemas (`CreateActivityInputSchema`, `UpdateActivityInputSchema`, `EditActivityFormItemSchema`) with nearly identical `distanceKm` validation logic
2. **Type Conversion Complexity**: Manual conversions at every boundary:
   - DB string → `Number.parseFloat()` in forms
   - Form number → `.toString()` in procedures
   - Repeated across multiple components
3. **Maintenance Risk**: Changes to validation rules require updates in 3+ locations
4. **Type Safety Gap**: Drizzle returns `string`, but TypeScript types don't enforce conversion

### Current Data Flow

```
USER INPUT (form)
  ↓ (number, e.g., 150.5)
REACT HOOK FORM
  ↓ (number)
ZOD VALIDATION
  - min(0.1)
  - refine(isMultipleOfStep)
  ↓ (number)
ORPC PROCEDURE
  - input.distanceKm.toString()
  ↓ (string, "150.5")
DATABASE (DECIMAL(10,1))
  - Stored as "150.5"
  ↓ (string)
DRIZZLE ORM
  - Returns as string
  ↓ (string)
DISPLAY/CALCULATIONS
  - Number.parseFloat(distanceKm)
  ↓ (number, 150.5)
CO2 CALCULATION
  - distanceKm * emissionFactor
```

## Proposed Solution

### Step 1: Create Centralized Distance Validation Factory

**File**: `src/features/project-activities/utils.ts`

Add a factory function that generates consistent Zod schemas with i18n support:

```typescript
/**
 * Create a Zod number schema for distance validation with consistent rules
 *
 * @param t - Translation function from useTranslations() hook
 * @param isOptional - If true, makes the schema optional
 * @returns Zod number schema with min/max/step validation
 */
export function createDistanceSchema(
  t: ReturnType<typeof useTranslations>,
  isOptional = false,
) {
  const schema = z
    .number()
    .min(MIN_DISTANCE_KM, {
      message: t("project.activities.form.validation.distanceKm.min", {
        min: MIN_DISTANCE_KM,
      }),
    })
    .max(MAX_DISTANCE_KM, {
      message: t("project.activities.form.validation.distanceKm.max", {
        max: MAX_DISTANCE_KM,
      }),
    })
    .refine(validateDistanceStep, {
      message: t("project.activities.form.validation.distanceKm.step", {
        step: DISTANCE_KM_STEP,
      }),
    });

  return isOptional ? schema.optional() : schema;
}
```

**Decision**: ✅ Using i18n translation keys for multilingual error messages

**Constants Used**: `MIN_DISTANCE_KM` (0.1), `MAX_DISTANCE_KM` (6000), `DISTANCE_KM_STEP` (0.1) from `src/config/activities.ts`

**Impact**: Replace 3 duplicate validation blocks in `validation-schemas.ts` with single factory calls

### Step 2: Add Drizzle Custom Type for Decimal-to-Number Mapping

**File**: `src/lib/drizzle/schemas/project-schema.ts`

Create a custom Drizzle column type that handles conversions transparently:

```typescript
import { customType } from "drizzle-orm/pg-core";

/**
 * Custom Drizzle type for distance values
 * Stores as DECIMAL(10,1) in DB, exposes as number in TypeScript
 * Database handles rounding natively via DECIMAL(10,1)
 */
const distanceKmType = customType<{ data: number; driverData: string }>({
  dataType() {
    return "decimal(10, 1)";
  },
  fromDriver(value: string): number {
    return Number.parseFloat(value);
  },
  toDriver(value: number): string {
    return value.toString();
  },
});

// Then use in schema:
distanceKm: distanceKmType("distance_km").notNull(),
```

**Decisions**: ✅ Custom Drizzle Type approach | ✅ Database-controlled rounding (DECIMAL(10,1))

**Impact**:

- Eliminates manual `Number.parseFloat()` in `project-activity-form.tsx:79-80`
- Eliminates manual `Number.parseFloat()` in `edit-project-form.tsx:114`
- Eliminates manual `.toString()` in `procedures.ts:86` and `procedures.ts:177`
- Type-safe at compile time: TypeScript knows `distanceKm` is `number`

### Step 3: Extend Test Coverage

**File**: `src/__tests__/distance-validation.test.ts`

Add comprehensive edge case tests:

```typescript
describe("Distance Schema Factory", () => {
  it("should create non-optional schema by default", () => {
    const schema = createDistanceSchema(t);
    expect(schema.safeParse(undefined).success).toBe(false);
  });

  it("should create optional schema when requested", () => {
    const schema = createDistanceSchema(t, true);
    expect(schema.safeParse(undefined).success).toBe(true);
  });

  it("should apply consistent validation rules", () => {
    const schema = createDistanceSchema(t);
    expect(schema.safeParse(0.05).success).toBe(false); // below min
    expect(schema.safeParse(0.1).success).toBe(true); // valid min
    expect(schema.safeParse(0.15).success).toBe(false); // wrong step
    expect(schema.safeParse(0.5).success).toBe(true); // valid mid-range
    expect(schema.safeParse(6000).success).toBe(true); // valid max
    expect(schema.safeParse(6000.1).success).toBe(false); // above max
  });

  it("should return i18n translated error messages", () => {
    const schema = createDistanceSchema(t);
    const resultMin = schema.safeParse(0.05);
    const resultStep = schema.safeParse(0.15);

    expect(resultMin.success).toBe(false);
    if (!resultMin.success) {
      expect(resultMin.error.errors[0].message).toContain("Distance must be at least");
    }

    expect(resultStep.success).toBe(false);
    if (!resultStep.success) {
      expect(resultStep.error.errors[0].message).toContain("increments");
    }
  });
});

describe("i18n Translation Integration", () => {
  it("should use correct translation keys for English", () => {
    const tEn = createMockTranslations("en");
    const schema = createDistanceSchema(tEn);
    const result = schema.safeParse(0.05);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(tEn).toHaveBeenCalledWith("project.activities.form.validation.distanceKm.min", { min: MIN_DISTANCE_KM });
    }
  });

  it("should use correct translation keys for German", () => {
    const tDe = createMockTranslations("de");
    const schema = createDistanceSchema(tDe);
    const result = schema.safeParse(0.05);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(tDe).toHaveBeenCalledWith("project.activities.form.validation.distanceKm.min", { min: MIN_DISTANCE_KM });
    }
  });

  it("should translate max distance errors for English", () => {
    const tEn = createMockTranslations("en");
    const schema = createDistanceSchema(tEn);
    const result = schema.safeParse(6000.1);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(tEn).toHaveBeenCalledWith("project.activities.form.validation.distanceKm.max", { max: MAX_DISTANCE_KM });
    }
  });

  it("should translate step errors for German", () => {
    const tDe = createMockTranslations("de");
    const schema = createDistanceSchema(tDe);
    const result = schema.safeParse(0.15);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(tDe).toHaveBeenCalledWith("project.activities.form.validation.distanceKm.step", { step: DISTANCE_KM_STEP });
    }
  });
});

describe("Floating-Point Edge Cases", () => {
  it("should handle values just below threshold", () => {
    expect(isMultipleOfStep(0.09999999)).toBe(false);
    expect(isMultipleOfStep(0.10000001)).toBe(true); // within epsilon
  });

  it("should validate very large numbers", () => {
    expect(validateDistanceStep(999999999.9)).toBe(true);
    expect(validateDistanceStep(999999999.5)).toBe(true);
  });

  it("should handle precision boundaries", () => {
    const almostMin = MIN_DISTANCE_KM - 0.00001;
    const justOverMin = MIN_DISTANCE_KM + 0.00001;
    const almostMax = MAX_DISTANCE_KM - 0.00001;
    const justOverMax = MAX_DISTANCE_KM + 0.00001;

    expect(createDistanceSchema(t).safeParse(almostMin).success).toBe(false);
    expect(createDistanceSchema(t).safeParse(justOverMin).success).toBe(true);
    expect(createDistanceSchema(t).safeParse(almostMax).success).toBe(true);
    expect(createDistanceSchema(t).safeParse(justOverMax).success).toBe(false);
  });
});

});
```

### Step 4: Run Unit Tests

Execute:

```bash
pnpm run test src/__tests__/distance-validation.test.ts
```

Verify:

- All new edge case tests pass
- Existing tests continue to work
- No regressions in form validation or calculations

## Decisions Made

### ✅ 1. Drizzle Custom Type Approach

**Selected**: Custom Type for transparent number conversion

- Type-safe at compile time
- Eliminates manual conversions throughout codebase
- Single source of truth in `distanceKmType`
- Requires Drizzle v0.28+ (already in use)

### ✅ 2. i18n Translation Keys for Error Messages

**Selected**: Use translation function `t()` in factory with reusable pattern

- Factory function signature: `createDistanceSchema(t, isOptional)`
- Error messages extracted to feature-specific translation keys:
  - `project.activities.form.validation.distanceKm.min`
  - `project.activities.form.validation.distanceKm.step`
- **Reusability**: This pattern establishes a consistent, context-aware approach for future validations
  - Validations are namespaced by feature/context: `<feature>.<subfeature>.<component>.validation.<fieldName>.<validationType>`
  - Avoids top-level namespace pollution
  - Easy to extend for other features (e.g., `user.profile.form.validation.email.format`)
- Translation files location: `src/lib/i18n/translations/`
  - `src/lib/i18n/translations/en.json` - English translations
  - `src/lib/i18n/translations/de.json` - German translations
  - Other supported locales follow same pattern
- Enables multilingual support across all locales
- **Testing requirement**: Unit tests must verify translations are working correctly

### ✅ 3. Database-Controlled Rounding

**Selected**: Let PostgreSQL DECIMAL(10,1) handle rounding

- Custom type `toDriver()` uses simple `.toString()` conversion
- PostgreSQL DECIMAL(10,1) rounds automatically (banker's rounding)
- Behavior is predictable for standard decimal operations
- Keeps custom type logic minimal and maintainable

## i18n Translation Structure

### Reusable Pattern for Future Zod Schema Validations

This refactoring establishes a **consistent, context-aware pattern** for all Zod schema validation error messages:

**Key Structure**: `<feature>.<subfeature>.<component>.validation.<fieldName>.<validationType>`

**Example for distanceKm in project activities**:

```json
{
  "project": {
    "activities": {
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
}
```

**Future Extensions** (follow same pattern in different features):

```json
{
  "project": {
    "activities": {
      "form": {
        "validation": {
          "distanceKm": { ... },
          "weight": {
            "min": "Weight must be at least {min} kg",
            "max": "Weight cannot exceed {max} kg"
          }
        }
      }
    }
  },
  "user": {
    "profile": {
      "form": {
        "validation": {
          "email": {
            "format": "Please enter a valid email address",
            "domain": "Email domain {domain} is not allowed"
          }
        }
      }
    }
  }
}
```

**Benefits of this structure**:

- ✅ No top-level namespace pollution
- ✅ Clear feature/context ownership
- ✅ Easy to locate related translations
- ✅ Scalable for future features
- ✅ Consistent pattern across codebase

### Translation File Locations

All translation files are in `src/lib/i18n/translations/`:

- **English**: `src/lib/i18n/translations/en.json`
- **German**: `src/lib/i18n/translations/de.json`
- **Other locales**: `src/lib/i18n/translations/<locale>.json`

### Required Translations for This Refactoring

**English** (`en.json`):

```json
{
  "project": {
    "activities": {
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
}
```

**German** (`de.json`):

```json
{
  "project": {
    "activities": {
      "form": {
        "validation": {
          "distanceKm": {
            "min": "Die Entfernung muss mindestens {min} km betragen",
            "max": "Die Entfernung darf {max} km nicht überschreiten",
            "step": "Die Entfernung muss in Schritten von {step} km angegeben werden"
          }
        }
      }
    }
  }
}
```

### Testing Requirements

1. **Unit tests must verify translation keys are called correctly** for all three validations (min, max, step)
2. **Test both EN and DE locales** to ensure translations work for all error types
3. **Verify parameter interpolation** (`{min}`, `{max}`, `{step}` values)
4. **Mock translation function to track calls** and verify key usage
5. **Test boundary conditions**:
   - Values below minimum (0.05)
   - Values at minimum (0.1)
   - Values above maximum (6000.1)
   - Values at maximum (6000)
   - Values that violate step increment (0.15)
   - Values that pass all validations (0.5, 3000, 6000)

## Implementation Checklist

- [ ] Add `createDistanceSchema()` factory to `utils.ts` (with i18n support, using `MIN_DISTANCE_KM`, `MAX_DISTANCE_KM`, `DISTANCE_KM_STEP` from `src/config/activities.ts`)
- [ ] Create custom Drizzle type `distanceKmType` in `project-schema.ts`
- [ ] Add i18n translation keys to translation files in `src/lib/i18n/translations/`:
  - `src/lib/i18n/translations/en.json` - Add `project.activities.form.validation.distanceKm.min`, `.max`, and `.step` keys
  - `src/lib/i18n/translations/de.json` - Add German translations for same three keys
  - Other supported locales (`src/lib/i18n/translations/<locale>.json`) - Add translations as needed
  - Use nested structure: `"project": { "activities": { "form": { "validation": { "distanceKm": { "min": "...", "max": "...", "step": "..." } } } } }`
- [ ] Replace `CreateActivityInputSchema.distanceKm` with factory call
- [ ] Replace `UpdateActivityInputSchema.distanceKm` with factory call (optional)
- [ ] Replace `EditActivityFormItemSchema.distanceKm` with factory call
- [ ] Update `projectActivitiesTable.distanceKm` to use custom type
- [ ] Remove manual `Number.parseFloat()` from `project-activity-form.tsx`
- [ ] Remove manual `Number.parseFloat()` from `edit-project-form.tsx`
- [ ] Remove manual `.toString()` from `procedures.ts` (create)
- [ ] Remove manual `.toString()` from `procedures.ts` (update)
- [ ] Add schema factory tests (including `t` parameter in all test calls)
- [ ] Add i18n translation integration tests (verify EN and DE translations work)
- [ ] Add floating-point edge case tests
- [ ] Run unit tests
- [ ] Run `pnpm run format && pnpm run lint`

## Expected Benefits

1. **Reduced Code**: ~30 lines of duplicate validation logic → 1 factory function
2. **Better Type Safety**: Compile-time enforcement of number type
3. **Fewer Bugs**: Single conversion logic eliminates inconsistencies
4. **Easier Maintenance**: Change validation rules in one place
5. **More Testable**: Factory function easy to test in isolation
6. **Better DX**: IntelliSense knows `distanceKm` is `number`, not `string | number`
