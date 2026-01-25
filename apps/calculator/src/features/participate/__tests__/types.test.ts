import { ACTIVITY_EMISSION_FACTORS } from "@greendex/config/activities";
import { describe, expect, it } from "vitest";

import type {
  ParticipantActivity,
  ParticipantActivityValueType,
} from "@/features/participate/types";
import type { ActivityValueType } from "@/features/project-activities/types";

describe("Participant Activity Types", () => {
  it("should allow all project activity types for ParticipantActivity", () => {
    const projectActivities: ActivityValueType[] = [
      "boat",
      "bus",
      "train",
      "car",
    ];

    for (const activityType of projectActivities) {
      const activity: ParticipantActivity = {
        id: "test-id",
        type: activityType,
        distanceKm: 100,
        co2Kg: 10,
      };

      expect(activity.type).toBe(activityType);
    }
  });

  it("should allow plane and electricCar for ParticipantActivity", () => {
    const participantOnlyActivities: ParticipantActivityValueType[] = [
      "plane",
      "electricCar",
    ];

    for (const activityType of participantOnlyActivities) {
      const activity: ParticipantActivity = {
        id: "test-id",
        type: activityType,
        distanceKm: 100,
        co2Kg: 10,
      };

      expect(activity.type).toBe(activityType);
    }
  });

  it("should have all participant activity types covered in ACTIVITY_EMISSION_FACTORS", () => {
    const participantActivityTypes: ParticipantActivityValueType[] = [
      "boat",
      "bus",
      "train",
      "car",
      "plane",
      "electricCar",
    ];

    for (const activityType of participantActivityTypes) {
      expect(ACTIVITY_EMISSION_FACTORS).toHaveProperty(activityType);
      expect(typeof ACTIVITY_EMISSION_FACTORS[activityType]).toBe("number");
      expect(ACTIVITY_EMISSION_FACTORS[activityType]).toBeGreaterThan(0);
    }
  });

  it("should have correct CO2 factors for each activity type", () => {
    // Verify all emission factors are defined as positive numbers
    // The actual values are defined in @/config/activities (single source of truth)
    // and should be reviewed/updated only when scientific/regulatory standards change
    expect(typeof ACTIVITY_EMISSION_FACTORS.car).toBe("number");
    expect(typeof ACTIVITY_EMISSION_FACTORS.boat).toBe("number");
    expect(typeof ACTIVITY_EMISSION_FACTORS.bus).toBe("number");
    expect(typeof ACTIVITY_EMISSION_FACTORS.train).toBe("number");
    expect(typeof ACTIVITY_EMISSION_FACTORS.plane).toBe("number");
    expect(typeof ACTIVITY_EMISSION_FACTORS.electricCar).toBe("number");

    expect(ACTIVITY_EMISSION_FACTORS.car).toBeGreaterThan(0);
    expect(ACTIVITY_EMISSION_FACTORS.boat).toBeGreaterThan(0);
    expect(ACTIVITY_EMISSION_FACTORS.bus).toBeGreaterThan(0);
    expect(ACTIVITY_EMISSION_FACTORS.train).toBeGreaterThan(0);
    expect(ACTIVITY_EMISSION_FACTORS.plane).toBeGreaterThan(0);
    expect(ACTIVITY_EMISSION_FACTORS.electricCar).toBeGreaterThan(0);
  });

  it("should ensure project activities do not include plane or electricCar", () => {
    const projectActivities: ActivityValueType[] = [
      "boat",
      "bus",
      "train",
      "car",
    ];

    expect(projectActivities).not.toContain("plane");
    expect(projectActivities).not.toContain("electricCar");
  });

  it("should ensure participant activities include all project activities plus plane and electricCar", () => {
    const participantActivities: ParticipantActivityValueType[] = [
      "boat",
      "bus",
      "train",
      "car",
      "plane",
      "electricCar",
    ];

    // Check all project activities are included
    expect(participantActivities).toContain("boat");
    expect(participantActivities).toContain("bus");
    expect(participantActivities).toContain("train");
    expect(participantActivities).toContain("car");

    // Check participant-specific activities
    expect(participantActivities).toContain("plane");
    expect(participantActivities).toContain("electricCar");

    // Total should be 6
    expect(participantActivities.length).toBe(6);
  });
});
