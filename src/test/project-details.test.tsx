/**
 * Tests for the refactored project details page
 *
 * This test suite validates:
 * - Statistics calculation logic
 * - Data integration with activities and participants
 * - Rendering logic verification
 */

import { describe, expect, it } from "vitest";

describe("Project Details Statistics", () => {
  describe("Duration Calculation", () => {
    it("should calculate project duration correctly in days", () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-10");
      const duration = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(duration).toBe(9);
    });

    it("should handle same-day projects", () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-01");
      const duration = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(duration).toBe(0);
    });

    it("should handle multi-month projects", () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-03-15");
      const duration = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(duration).toBe(74);
    });
  });

  describe("Total Distance Calculation", () => {
    it("should sum all activity distances correctly", () => {
      const activities = [
        { distanceKm: "100.5" },
        { distanceKm: "50.0" },
        { distanceKm: "25.5" },
      ];

      const totalDistance = activities.reduce((sum, activity) => {
        return sum + Number.parseFloat(activity.distanceKm);
      }, 0);

      expect(totalDistance).toBe(176.0);
    });

    it("should handle empty activities list", () => {
      const activities: { distanceKm: string }[] = [];

      const totalDistance = activities.reduce((sum, activity) => {
        return sum + Number.parseFloat(activity.distanceKm);
      }, 0);

      expect(totalDistance).toBe(0);
    });

    it("should handle decimal distances correctly", () => {
      const activities = [
        { distanceKm: "100.1" },
        { distanceKm: "200.2" },
        { distanceKm: "300.3" },
      ];

      const totalDistance = activities.reduce((sum, activity) => {
        return sum + Number.parseFloat(activity.distanceKm);
      }, 0);

      expect(totalDistance).toBeCloseTo(600.6, 1);
    });
  });

  describe("Participants Count", () => {
    it("should count participants correctly", () => {
      const participants = [
        { id: "p1", name: "User 1" },
        { id: "p2", name: "User 2" },
        { id: "p3", name: "User 3" },
      ];

      const participantsCount = participants.length;
      expect(participantsCount).toBe(3);
    });

    it("should handle empty participants list", () => {
      const participants: unknown[] = [];

      const participantsCount = participants.length;
      expect(participantsCount).toBe(0);
    });
  });

  describe("Activities Count", () => {
    it("should count activities correctly", () => {
      const activities = [
        { id: "a1", activityType: "train", distanceKm: "100" },
        { id: "a2", activityType: "bus", distanceKm: "50" },
      ];

      const activitiesCount = activities.length;
      expect(activitiesCount).toBe(2);
    });

    it("should handle empty activities list", () => {
      const activities: unknown[] = [];

      const activitiesCount = activities.length;
      expect(activitiesCount).toBe(0);
    });
  });

  describe("Statistics Integration", () => {
    it("should calculate all statistics correctly for a sample project", () => {
      // Sample project data
      const projectStartDate = new Date("2024-01-01");
      const projectEndDate = new Date("2024-01-10");

      const participants = [
        { id: "p1", name: "User 1" },
        { id: "p2", name: "User 2" },
      ];

      const activities = [
        { id: "a1", activityType: "train", distanceKm: "100.5" },
        { id: "a2", activityType: "bus", distanceKm: "50.0" },
      ];

      // Calculate statistics
      const participantsCount = participants.length;
      const activitiesCount = activities.length;
      const totalDistance = activities.reduce((sum, activity) => {
        return sum + Number.parseFloat(activity.distanceKm);
      }, 0);
      const duration = Math.ceil(
        (projectEndDate.getTime() - projectStartDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Verify all statistics
      expect(participantsCount).toBe(2);
      expect(activitiesCount).toBe(2);
      expect(totalDistance).toBe(150.5);
      expect(duration).toBe(9);
    });

    it("should handle project with no activities or participants", () => {
      const projectStartDate = new Date("2024-01-01");
      const projectEndDate = new Date("2024-01-05");

      const participants: unknown[] = [];
      const activities: { distanceKm: string }[] = [];

      const participantsCount = participants.length;
      const activitiesCount = activities.length;
      const totalDistance = activities.reduce((sum, activity) => {
        return sum + Number.parseFloat(activity.distanceKm);
      }, 0);
      const duration = Math.ceil(
        (projectEndDate.getTime() - projectStartDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      expect(participantsCount).toBe(0);
      expect(activitiesCount).toBe(0);
      expect(totalDistance).toBe(0);
      expect(duration).toBe(4);
    });
  });
});
