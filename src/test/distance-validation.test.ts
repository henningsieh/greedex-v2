import { describe, expect, it } from "vitest";
import {
  DISTANCE_KM_STEP,
  MIN_DISTANCE_KM,
} from "@/components/features/projects/types";
import {
  EditActivityFormItemSchema,
  ProjectActivityFormSchema,
} from "@/components/features/projects/validation-schemas";
import {
  isMultipleOfStep,
  validateDistanceStep,
} from "@/lib/utils/distance-utils";

describe("Distance Constants", () => {
  it("should have correct constant values", () => {
    expect(MIN_DISTANCE_KM).toBe(0.1);
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
  describe("ProjectActivityFormSchema", () => {
    it("should accept valid distance values", () => {
      const validData = {
        projectId: "test-project",
        activityType: "car" as const,
        distanceKm: 0.1,
        description: null,
        activityDate: null,
      };

      const result = ProjectActivityFormSchema.safeParse(validData);
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

        const result = ProjectActivityFormSchema.safeParse(data);
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

      const result = ProjectActivityFormSchema.safeParse(invalidData);
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

      const result = ProjectActivityFormSchema.safeParse(invalidData);
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

      const result = ProjectActivityFormSchema.safeParse(invalidData);
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

        const result = ProjectActivityFormSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("increments of 0.1");
        }
      }
    });
  });

  describe("EditActivityFormItemSchema", () => {
    it("should accept valid distance values with activity ID", () => {
      const validData = {
        id: "test-id",
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
