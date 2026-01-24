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

// Mock translation function for testing
function createMockTranslations(locale: string) {
  return vi.fn((key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        "project.activities.form.validation.distanceKm.min": `Distance must be at least ${params?.min} km`,
        "project.activities.form.validation.distanceKm.max": `Distance cannot exceed ${params?.max} km`,
        "project.activities.form.validation.distanceKm.step": `Distance must be in increments of ${params?.step} km`,
      },
      de: {
        "project.activities.form.validation.distanceKm.min": `Die Entfernung muss mindestens ${params?.min} km betragen`,
        "project.activities.form.validation.distanceKm.max": `Die Entfernung darf ${params?.max} km nicht überschreiten`,
        "project.activities.form.validation.distanceKm.step": `Die Entfernung muss in Schritten von ${params?.step} km angegeben werden`,
      },
    };
    return translations[locale][key] || key;
  });
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

describe("Distance Validation Schemas", () => {
  describe("CreateActivityInputSchema", () => {
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

    it("should reject distances below minimum (0.1)", () => {
      const invalidData = {
        projectId: "test-project",
        activityType: "car" as const,
        distanceKm: 0.05,
        description: null,
        activityDate: null,
      };

      const result = CreateActivityInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 0.1");
      }
    });

    it("should reject zero distance", () => {
      const invalidData = {
        projectId: "test-project",
        activityType: "car" as const,
        distanceKm: 0,
        description: null,
        activityDate: null,
      };

      const result = CreateActivityInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative distances", () => {
      const invalidData = {
        projectId: "test-project",
        activityType: "car" as const,
        distanceKm: -1,
        description: null,
        activityDate: null,
      };

      const result = CreateActivityInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject distances not in 0.1 increments", () => {
      const invalidDistances = [0.15, 0.25, 1.33, 10.05];

      for (const distance of invalidDistances) {
        const data = {
          projectId: "test-project",
          activityType: "car" as const,
          distanceKm: distance,
          description: null,
          activityDate: null,
        };

        const result = CreateActivityInputSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("increments of 0.1");
        }
      }
    });

    it("should reject distances above maximum (6000)", () => {
      const invalidData = {
        projectId: "test-project",
        activityType: "car" as const,
        distanceKm: 6000.1,
        description: null,
        activityDate: null,
      };

      const result = CreateActivityInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cannot exceed 6000");
      }
    });

    it("should accept distance at maximum (6000)", () => {
      const validData = {
        projectId: "test-project",
        activityType: "car" as const,
        distanceKm: 6000,
        description: null,
        activityDate: null,
      };

      const result = CreateActivityInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("EditActivityFormItemSchema", () => {
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

    it("should reject invalid distances in edit form", () => {
      const invalidData = {
        id: "test-id",
        projectId: "test-project-id",
        activityType: "train" as const,
        distanceKm: 0.05,
        description: "Test activity",
        activityDate: new Date(),
        isNew: false,
        isDeleted: false,
      };

      const result = EditActivityFormItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should enforce step validation in edit form", () => {
      const invalidData = {
        id: "test-id",
        projectId: "test-project-id",
        activityType: "boat" as const,
        distanceKm: 1.25, // Not a multiple of 0.1
        description: "Test activity",
        activityDate: new Date(),
        isNew: false,
        isDeleted: false,
      };

      const result = EditActivityFormItemSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("increments of 0.1");
      }
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

    expect(resultMin.success).toBe(false);
    if (!resultMin.success) {
      expect(resultMin.error.errors[0].message).toContain(
        "Distance must be at least",
      );
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
    expect(tEn).toHaveBeenCalledWith(
      "project.activities.form.validation.distanceKm.min",
      { min: MIN_DISTANCE_KM },
    );
  });

  it("should use correct translation keys for German", () => {
    const tDe = createMockTranslations("de");
    const schema = createDistanceSchema(tDe);
    const result = schema.safeParse(0.05);

    expect(result.success).toBe(false);
    expect(tDe).toHaveBeenCalledWith(
      "project.activities.form.validation.distanceKm.min",
      { min: MIN_DISTANCE_KM },
    );
  });

  it("should translate max distance errors for English", () => {
    const tEn = createMockTranslations("en");
    const schema = createDistanceSchema(tEn);
    const result = schema.safeParse(6000.1);

    expect(result.success).toBe(false);
    expect(tEn).toHaveBeenCalledWith(
      "project.activities.form.validation.distanceKm.max",
      { max: MAX_DISTANCE_KM },
    );
  });

  it("should translate step errors for German", () => {
    const tDe = createMockTranslations("de");
    const schema = createDistanceSchema(tDe);
    const result = schema.safeParse(0.15);

    expect(result.success).toBe(false);
    expect(tDe).toHaveBeenCalledWith(
      "project.activities.form.validation.distanceKm.step",
      { step: DISTANCE_KM_STEP },
    );
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
    const t = createMockTranslations("en");
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
