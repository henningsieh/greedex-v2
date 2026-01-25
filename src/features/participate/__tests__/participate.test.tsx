import { describe, expect, it } from "vitest";

import type { ProjectActivityType } from "@/features/project-activities/types";

import { ACTIVITY_EMISSION_FACTORS } from "@/config/activities";
import {
  ACCOMMODATION_DATA,
  CO2_PER_TREE_PER_YEAR,
  CONVENTIONAL_ENERGY_FACTOR,
  FOOD_DATA,
  GREEN_ENERGY_REDUCTION_FACTOR,
  ROOM_OCCUPANCY_FACTORS,
} from "@/config/participate";
import {
  ACCOMMODATION_FACTORS,
  FOOD_FACTORS,
  type ParticipantAnswers,
} from "@/features/participate/types";
import { calculateEmissions } from "@/features/participate/utils";
import { calculateActivitiesCO2 } from "@/features/projects/utils";

describe("Questionnaire Types and Calculations", () => {
  describe("CO₂ Emission Factors", () => {
    it("should have correct transport emission factors", () => {
      // Verify all factors are defined and positive (values from config)
      expect(ACTIVITY_EMISSION_FACTORS.plane).toBeGreaterThan(0);
      expect(ACTIVITY_EMISSION_FACTORS.boat).toBeGreaterThan(0);
      expect(ACTIVITY_EMISSION_FACTORS.train).toBeGreaterThan(0);
      expect(ACTIVITY_EMISSION_FACTORS.bus).toBeGreaterThan(0);
      expect(ACTIVITY_EMISSION_FACTORS.car).toBeGreaterThan(0);
      expect(ACTIVITY_EMISSION_FACTORS.electricCar).toBeGreaterThan(0);
    });

    it("should have accommodation factors for all types", () => {
      // Verify config values match expected business requirements from ACCOMMODATION_DATA
      for (const [type, factor] of ACCOMMODATION_DATA) {
        expect(ACCOMMODATION_FACTORS[type]).toBe(factor);
      }
    });

    it("should have food factors for all types", () => {
      // Verify config values match expected business requirements from FOOD_DATA
      for (const [type, factor] of FOOD_DATA) {
        expect(FOOD_FACTORS[type]).toBe(factor);
      }
    });
  });

  describe("Emission Calculations", () => {
    it("should calculate transport emissions correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        flightKm: 100,
        trainKm: 50,
        busKm: 20,
        carKm: 0,
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factors
      const expected =
        (100 * ACTIVITY_EMISSION_FACTORS.plane +
          50 * ACTIVITY_EMISSION_FACTORS.train +
          20 * ACTIVITY_EMISSION_FACTORS.bus) *
        2; // round trip
      expect(emissions.transportCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate car emissions with passengers correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        carKm: 100,
        carType: "car",
        carPassengers: 4,
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factor
      const expected = ((100 * ACTIVITY_EMISSION_FACTORS.car) / 4) * 2; // round trip
      expect(emissions.transportCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate electric car emissions correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        carKm: 100,
        carType: "electricCar",
        carPassengers: 1,
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factor
      const expected = ((100 * ACTIVITY_EMISSION_FACTORS.electricCar) / 1) * 2; // round trip
      expect(emissions.transportCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate accommodation emissions correctly with green energy", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 7,
        accommodationCategory: "Hostel",
        roomOccupancy: "2 people",
        electricity: "green energy",
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factors
      const expected =
        7 *
        ACCOMMODATION_FACTORS.Hostel *
        ROOM_OCCUPANCY_FACTORS["2 people"] *
        GREEN_ENERGY_REDUCTION_FACTOR;
      expect(emissions.accommodationCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate accommodation emissions correctly with conventional energy", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 7,
        accommodationCategory: "Hostel",
        roomOccupancy: "2 people",
        electricity: "conventional energy",
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factors (conventional energy = no reduction)
      const expected =
        7 *
        ACCOMMODATION_FACTORS.Hostel *
        ROOM_OCCUPANCY_FACTORS["2 people"] *
        CONVENTIONAL_ENERGY_FACTOR;
      expect(emissions.accommodationCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate food emissions correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 7,
        food: "sometimes",
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected value using config factor
      const expected = 7 * FOOD_FACTORS.sometimes;
      expect(emissions.foodCO2).toBeCloseTo(expected, 1);
    });

    it("should calculate total emissions and trees needed", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 7,
        accommodationCategory: "Camping",
        roomOccupancy: "4+ people",
        electricity: "green energy",
        food: "never",
        flightKm: 500,
        trainKm: 0,
        busKm: 0,
        boatKm: 0,
        carKm: 0,
      };

      const emissions = calculateEmissions(answers);

      // Calculate expected values using config factors
      const expectedTransport = 500 * ACTIVITY_EMISSION_FACTORS.plane * 2; // round trip
      const expectedAccommodation =
        7 *
        ACCOMMODATION_FACTORS.Camping *
        ROOM_OCCUPANCY_FACTORS["4+ people"] *
        GREEN_ENERGY_REDUCTION_FACTOR;
      const expectedFood = 7 * FOOD_FACTORS.never;
      const expectedTotal =
        expectedTransport + expectedAccommodation + expectedFood;

      expect(emissions.totalCO2).toBeCloseTo(expectedTotal, 1);
      expect(emissions.treesNeeded).toBe(
        Math.ceil(expectedTotal / CO2_PER_TREE_PER_YEAR),
      );
    });

    it("should handle zero values correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 0,
        flightKm: 0,
        trainKm: 0,
        busKm: 0,
        boatKm: 0,
        carKm: 0,
      };

      const emissions = calculateEmissions(answers);

      expect(emissions.totalCO2).toBe(0);
      expect(emissions.treesNeeded).toBe(0);
    });
  });

  describe("Project Activities Calculations", () => {
    it("should calculate project activities CO2 correctly", () => {
      const activities: ProjectActivityType[] = [
        {
          id: "1",
          projectId: "project1",
          activityType: "bus",
          distanceKm: 50,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          projectId: "project1",
          activityType: "train",
          distanceKm: 100,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const activitiesCO2 = calculateActivitiesCO2(activities);

      // Calculate expected value using config factors
      const expected =
        50 * ACTIVITY_EMISSION_FACTORS.bus +
        100 * ACTIVITY_EMISSION_FACTORS.train;
      expect(activitiesCO2).toBeCloseTo(expected, 2);
    });

    it("should include project activities in total emissions", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 5,
        accommodationCategory: "Hostel",
        roomOccupancy: "2 people",
        electricity: "conventional energy",
        food: "sometimes",
        flightKm: 200,
        trainKm: 0,
        busKm: 0,
        boatKm: 0,
        carKm: 0,
      };

      const projectActivities: ProjectActivityType[] = [
        {
          id: "1",
          projectId: "project1",
          activityType: "car",
          distanceKm: 30,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const emissionsWithoutActivities = calculateEmissions(answers);
      const emissionsWithActivities = calculateEmissions(
        answers,
        projectActivities,
      );

      // Calculate expected value using config factor
      const expectedProjectCO2 = 30 * ACTIVITY_EMISSION_FACTORS.car;
      expect(emissionsWithActivities.projectActivitiesCO2).toBeCloseTo(
        expectedProjectCO2,
        2,
      );
      expect(emissionsWithActivities.totalCO2).toBeCloseTo(
        emissionsWithoutActivities.totalCO2 + expectedProjectCO2,
        1,
      );
    });

    it("should handle multiple project activities", () => {
      const activities: ProjectActivityType[] = [
        {
          id: "1",
          projectId: "project1",
          activityType: "boat",
          distanceKm: 20,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          projectId: "project1",
          activityType: "bus",
          distanceKm: 40,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "3",
          projectId: "project1",
          activityType: "train",
          distanceKm: 15,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "4",
          projectId: "project1",
          activityType: "car",
          distanceKm: 25,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const activitiesCO2 = calculateActivitiesCO2(activities);

      // Calculate expected value using config factors
      const expected =
        20 * ACTIVITY_EMISSION_FACTORS.boat +
        40 * ACTIVITY_EMISSION_FACTORS.bus +
        15 * ACTIVITY_EMISSION_FACTORS.train +
        25 * ACTIVITY_EMISSION_FACTORS.car;
      expect(activitiesCO2).toBeCloseTo(expected, 2);
    });

    it("should handle empty project activities", () => {
      const activities: ProjectActivityType[] = [];
      const activitiesCO2 = calculateActivitiesCO2(activities);
      expect(activitiesCO2).toBe(0);
    });

    it("should handle invalid distance values in project activities", () => {
      const activities: ProjectActivityType[] = [
        {
          id: "1",
          projectId: "project1",
          activityType: "bus",
          distanceKm: 0,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          projectId: "project1",
          activityType: "train",
          distanceKm: -10,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "3",
          projectId: "project1",
          activityType: "car",
          distanceKm: Number.NaN,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "4",
          projectId: "project1",
          activityType: "boat",
          distanceKm: 50,
          description: null,
          activityDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const activitiesCO2 = calculateActivitiesCO2(activities);

      // Only boat should be counted (calculate using config factor)
      const expected = 50 * ACTIVITY_EMISSION_FACTORS.boat;
      expect(activitiesCO2).toBeCloseTo(expected, 2);
    });

    it("should return 0 for project activities CO2 when no activities provided", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 5,
        accommodationCategory: "Camping",
        roomOccupancy: "alone",
        electricity: "green energy",
        food: "never",
        flightKm: 100,
        trainKm: 0,
        busKm: 0,
        boatKm: 0,
        carKm: 0,
      };

      const emissions = calculateEmissions(answers);

      expect(emissions.projectActivitiesCO2).toBe(0);
    });
  });
});
