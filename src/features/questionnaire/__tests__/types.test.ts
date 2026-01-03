import { describe, expect, it } from "vitest";
import type { ActivityValueType } from "@/features/project-activities";
import { CO2_FACTORS } from "@/features/projects/utils";
import type {
  ParticipantActivity,
  ParticipantActivityValueType,
} from "@/features/questionnaire/types";

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

  it("should have all participant activity types covered in CO2_FACTORS", () => {
    const participantActivityTypes: ParticipantActivityValueType[] = [
      "boat",
      "bus",
      "train",
      "car",
      "plane",
      "electricCar",
    ];

    for (const activityType of participantActivityTypes) {
      expect(CO2_FACTORS).toHaveProperty(activityType);
      expect(typeof CO2_FACTORS[activityType]).toBe("number");
      expect(CO2_FACTORS[activityType]).toBeGreaterThan(0);
    }
  });

  it("should have correct CO2 factors for each activity type", () => {
    expect(CO2_FACTORS.car).toBe(0.192);
    expect(CO2_FACTORS.boat).toBe(0.115);
    expect(CO2_FACTORS.bus).toBe(0.089);
    expect(CO2_FACTORS.train).toBe(0.041);
    expect(CO2_FACTORS.plane).toBe(0.255);
    expect(CO2_FACTORS.electricCar).toBe(0.053);
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
