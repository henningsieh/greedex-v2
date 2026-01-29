import { ACTIVITY_EMISSION_FACTORS } from "@greendex/config/activities";
import { describe, expect, it } from "vitest";

import {
  calculateProjectDuration,
  getProjectStatistics,
} from "@/features/projects/utils";

describe("calculateProjectDuration", () => {
  it("returns 0 for invalid dates", () => {
    expect(calculateProjectDuration("invalid", "also-invalid")).toBe(0);
  });

  it("returns 0 when end is before start", () => {
    const start = new Date("2025-01-10");
    const end = new Date("2025-01-01");
    expect(calculateProjectDuration(start, end)).toBe(0);
  });

  it("uses ceil and returns whole days", () => {
    const start = new Date("2025-01-01T00:00:00Z");
    const end = new Date("2025-01-02T12:00:00Z"); // 1.5 days -> ceil -> 2
    expect(calculateProjectDuration(start, end)).toBe(2);
  });
});

describe("getProjectStatistics", () => {
  it("computes counts, total distance, duration and CO2 from activities", () => {
    const project = {
      startDate: "2025-01-01",
      endDate: "2025-01-05",
    };

    const participants = [{}, {}, {}];

    const activities = [
      { activityType: "car", distanceKm: 10 },
      { activityType: "train", distanceKm: 20.5 },
      // invalid activity should be ignored
      { activityType: "unknown", distanceKm: 15 },
      { activityType: "bus", distanceKm: -5 },
    ];

    const stats = getProjectStatistics(project, participants, activities as any);

    expect(stats.participantsCount).toBe(3);
    expect(stats.activitiesCount).toBe(4);
    // total distance sums numeric positive distances regardless of activity type
    // 10 + 20.5 + 15 = 45.5 (bus negative value ignored)
    expect(stats.totalDistanceKm).toBeCloseTo(45.5);
    expect(stats.durationDays).toBe(4);

    // CO2: car 10 * carFactor + train 20.5 * trainFactor (unknown ignored, negative ignored)
    const expectedCO2 =
      10 * ACTIVITY_EMISSION_FACTORS.car + 20.5 * ACTIVITY_EMISSION_FACTORS.train;
    expect(stats.activitiesCO2Kg).toBeCloseTo(expectedCO2);
  });

  it("handles missing or empty inputs safely", () => {
    const stats = getProjectStatistics(null, null, null);
    expect(stats.participantsCount).toBe(0);
    expect(stats.activitiesCount).toBe(0);
    expect(stats.totalDistanceKm).toBe(0);
    expect(stats.durationDays).toBe(0);
    expect(stats.activitiesCO2Kg).toBe(0);
  });
});
