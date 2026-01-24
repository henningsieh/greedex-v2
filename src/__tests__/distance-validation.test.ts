import { describe, expect, it, vi } from "vitest";

import {
  DISTANCE_KM_STEP,
  MAX_DISTANCE_KM,
  MIN_DISTANCE_KM,
} from "@/config/activities";
import {
  createDistanceSchema,
  isMultipleOfStep,
  validateDistanceStep,
} from "@/features/project-activities/utils";
import {
  CreateActivityInputSchema,
  EditActivityFormItemSchema,
} from "@/features/project-activities/validation-schemas";

// Mock translation function for tests
function createMockTranslations(locale = "en") {
  const translations: Record<string, Record<string, string>> = {
    en: {
      "project.activities.form.validation.distanceKm.min":
        "Distance must be at least {min} km",
      "project.activities.form.validation.distanceKm.max":
        "Distance cannot exceed {max} km",
      "project.activities.form.validation.distanceKm.step":
        "Distance must be in increments of {step} km",
    },
    de: {
      "project.activities.form.validation.distanceKm.min":
        "Die Entfernung muss mindestens {min} km betragen",
      "project.activities.form.validation.distanceKm.max":
        "Die Entfernung darf {max} km nicht überschreiten",
      "project.activities.form.validation.distanceKm.step":
        "Die Entfernung muss in Schritten von {step} km angegeben werden",
    },
  };

  const mockFn = vi.fn((key: string, params?: Record<string, number>) => {
    let message = translations[locale][key] || key;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        message = message.replace(`{${paramKey}}`, String(paramValue));
      }
    }
    return message;
  });

  // Cast to any to bypass TypeScript's strict type checking for the mock
  // This is acceptable in test code where we're simulating the translation function
  return mockFn as any;
}

describe("Distance Constants", () => {
  it("should have correct constant values", () => {
    expect(MIN_DISTANCE_KM).toBe(0.1);
    expect(MAX_DISTANCE_KM).toBe(6000);
    expect(DISTANCE_KM_STEP).toBe(0.1);
  });

  describe("isMultipleOfStep", () => {
    it("should validate correct multiples of 0.1", () => {
      expect(isMultipleOfStep(0.1)).toBe(true);
      expect(isMultipleOfStep(0.2)).toBe(true);
      expect(isMultipleOfStep(0.5)).toBe(true);
      expect(isMultipleOfStep(1.0)).toBe(true);
      expect(isMultipleOfStep(1.5)).toBe(true);
      expect(isMultipleOfStep(10.3)).toBe(true);
      expect(isMultipleOfStep(100.0)).toBe(true);
    });

    it("should reject invalid multiples", () => {
      expect(isMultipleOfStep(0.15)).toBe(false);
      expect(isMultipleOfStep(0.05)).toBe(false);
      expect(isMultipleOfStep(1.25)).toBe(false);
      expect(isMultipleOfStep(10.33)).toBe(false);
      expect(isMultipleOfStep(0.001)).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isMultipleOfStep(0)).toBe(true); // 0 is a multiple of 0.1
      expect(isMultipleOfStep(0.0)).toBe(true);
    });
  });

  describe("validateDistanceStep", () => {
    it("should validate correct step values", () => {
      expect(validateDistanceStep(0.1)).toBe(true);
      expect(validateDistanceStep(1.5)).toBe(true);
      expect(validateDistanceStep(10.0)).toBe(true);
    });

    it("should reject incorrect step values", () => {
      expect(validateDistanceStep(0.15)).toBe(false);
      expect(validateDistanceStep(1.25)).toBe(false);
    });
  });
});

describe("Distance Schema Factory", () => {
  it("should create non-optional schema by default", () => {
    const t = createMockTranslations("en");
    const schema = createDistanceSchema(t);
    expect(schema.safeParse(undefined).success).toBe(false);
  });

  it("should create optional schema when requested", () => {
    const t = createMockTranslations("en");
    const schema = createDistanceSchema(t, true);
    expect(schema.safeParse(undefined).success).toBe(true);
  });

  it("should apply consistent validation rules", () => {
    const t = createMockTranslations("en");
    const schema = createDistanceSchema(t);
    expect(schema.safeParse(0.05).success).toBe(false); // below min
    expect(schema.safeParse(0.1).success).toBe(true); // valid min
    expect(schema.safeParse(0.15).success).toBe(false); // wrong step
    expect(schema.safeParse(0.5).success).toBe(true); // valid mid-range
    expect(schema.safeParse(6000).success).toBe(true); // valid max
    expect(schema.safeParse(6000.1).success).toBe(false); // above max
  });

  it("should return i18n translated error messages", () => {
    const t = createMockTranslations("en");
    const schema = createDistanceSchema(t);
    const resultMin = schema.safeParse(0.05);
    const resultStep = schema.safeParse(0.15);
    const resultMax = schema.safeParse(6000.1);

    expect(resultMin.success).toBe(false);
    if (!resultMin.success) {
      expect(resultMin.error.issues.length).toBeGreaterThan(0);
      expect(resultMin.error.issues[0].message).toContain(
        "Distance must be at least",
      );
    }

    expect(resultStep.success).toBe(false);
    if (!resultStep.success) {
      expect(resultStep.error.issues.length).toBeGreaterThan(0);
      expect(resultStep.error.issues[0].message).toContain("increments");
    }

    expect(resultMax.success).toBe(false);
    if (!resultMax.success) {
      expect(resultMax.error.issues.length).toBeGreaterThan(0);
      expect(resultMax.error.issues[0].message).toContain("cannot exceed");
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
      expect(tEn).toHaveBeenCalledWith(
        "project.activities.form.validation.distanceKm.min",
        { min: MIN_DISTANCE_KM },
      );
    }
  });

  it("should use correct translation keys for German", () => {
    const tDe = createMockTranslations("de");
    const schema = createDistanceSchema(tDe);
    const result = schema.safeParse(0.05);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(tDe).toHaveBeenCalledWith(
        "project.activities.form.validation.distanceKm.min",
        { min: MIN_DISTANCE_KM },
      );
    }
  });

  it("should translate max distance errors for English", () => {
    const tEn = createMockTranslations("en");
    const schema = createDistanceSchema(tEn);
    const result = schema.safeParse(6000.1);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(tEn).toHaveBeenCalledWith(
        "project.activities.form.validation.distanceKm.max",
        { max: MAX_DISTANCE_KM },
      );
    }
  });

  it("should translate step errors for German", () => {
    const tDe = createMockTranslations("de");
    const schema = createDistanceSchema(tDe);
    const result = schema.safeParse(0.15);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(tDe).toHaveBeenCalledWith(
        "project.activities.form.validation.distanceKm.step",
        { step: DISTANCE_KM_STEP },
      );
    }
  });

  it("should properly interpolate parameters in English messages", () => {
    const tEn = createMockTranslations("en");
    const schema = createDistanceSchema(tEn);
    const resultMin = schema.safeParse(0.05);

    expect(resultMin.success).toBe(false);
    if (!resultMin.success) {
      expect(resultMin.error.issues.length).toBeGreaterThan(0);
      expect(resultMin.error.issues[0].message).toBe(
        "Distance must be at least 0.1 km",
      );
    }
  });

  it("should properly interpolate parameters in German messages", () => {
    const tDe = createMockTranslations("de");
    const schema = createDistanceSchema(tDe);
    const resultMin = schema.safeParse(0.05);

    expect(resultMin.success).toBe(false);
    if (!resultMin.success) {
      expect(resultMin.error.issues.length).toBeGreaterThan(0);
      expect(resultMin.error.issues[0].message).toBe(
        "Die Entfernung muss mindestens 0.1 km betragen",
      );
    }
  });
});

describe("Floating-Point Edge Cases", () => {
  it("should handle values close to step boundaries", () => {
    expect(isMultipleOfStep(0.09999999)).toBe(false);
    // Note: 0.10000001 is too close to 0.1 and may pass due to epsilon tolerance
    expect(isMultipleOfStep(0.1)).toBe(true);
    expect(isMultipleOfStep(0.2)).toBe(true);
  });

  it("should validate very large numbers", () => {
    expect(validateDistanceStep(999999999.9)).toBe(true);
    expect(validateDistanceStep(999999999.5)).toBe(true);
  });

  it("should handle min/max boundaries correctly", () => {
    const t = createMockTranslations("en");
    const schema = createDistanceSchema(t);

    // Test exact boundaries
    expect(schema.safeParse(MIN_DISTANCE_KM).success).toBe(true); // 0.1
    expect(schema.safeParse(MAX_DISTANCE_KM).success).toBe(true); // 6000

    // Test values clearly outside boundaries
    expect(schema.safeParse(0.09).success).toBe(false); // below min
    expect(schema.safeParse(6000.2).success).toBe(false); // above max
  });

  it("should handle floating point arithmetic correctly", () => {
    const t = createMockTranslations("en");
    const schema = createDistanceSchema(t);

    // Test common floating point problematic values
    expect(schema.safeParse(0.3).success).toBe(true); // 0.1 + 0.1 + 0.1
    expect(schema.safeParse(1.1).success).toBe(true); // 1.0 + 0.1
    expect(schema.safeParse(2.2).success).toBe(true); // 2.0 + 0.2
  });
});

describe("Distance Validation Schemas", () => {
  describe("CreateActivityInputSchema (Static - Server Side)", () => {
    it("should accept valid distance values", () => {
      const validData = {
        projectId: "test-project",
        activityType: "car" as const,
        distanceKm: 0.1,
        description: null,
        activityDate: null,
      };

      const result = CreateActivityInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept distances that are multiples of 0.1", () => {
      const testCases = [0.1, 0.5, 1.0, 5.5, 10.3, 100.0];

      for (const distance of testCases) {
        const data = {
          projectId: "test-project",
          activityType: "car" as const,
          distanceKm: distance,
          description: null,
          activityDate: null,
        };

        const result = CreateActivityInputSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });

    it("should accept large distances within max", () => {
      const data = {
        projectId: "test-project",
        activityType: "car" as const,
        distanceKm: 5999.9,
        description: null,
        activityDate: null,
      };

      const result = CreateActivityInputSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept number type for distanceKm", () => {
      const data = {
        projectId: "test-project",
        activityType: "car" as const,
        distanceKm: 100,
        description: null,
        activityDate: null,
      };

      const result = CreateActivityInputSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("EditActivityFormItemSchema (Static - Server Side)", () => {
    it("should accept valid distance values with activity ID", () => {
      const validData = {
        id: "test-id",
        projectId: "test-project-id",
        activityType: "bus" as const,
        distanceKm: 5.5,
        description: "Test activity",
        activityDate: new Date(),
        isNew: false,
        isDeleted: false,
      };

      const result = EditActivityFormItemSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept number type for distanceKm", () => {
      const validData = {
        id: "test-id",
        projectId: "test-project-id",
        activityType: "train" as const,
        distanceKm: 100.5,
        description: "Test activity",
        activityDate: new Date(),
        isNew: false,
        isDeleted: false,
      };

      const result = EditActivityFormItemSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
