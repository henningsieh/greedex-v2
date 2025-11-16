import { describe, expect, it } from "vitest";
import { CO2_FACTORS } from "../types";

describe("ParticipateForm", () => {
  describe("CO2 Calculations", () => {
    it("should have correct emission factors", () => {
      expect(CO2_FACTORS.car).toBe(0.192);
      expect(CO2_FACTORS.bus).toBe(0.089);
      expect(CO2_FACTORS.train).toBe(0.041);
      expect(CO2_FACTORS.boat).toBe(0.115);
    });

    it("should calculate CO2 for car travel correctly", () => {
      const distanceKm = 100;
      const co2 = distanceKm * CO2_FACTORS.car;
      expect(co2).toBe(19.2);
    });

    it("should calculate CO2 for train travel correctly", () => {
      const distanceKm = 250;
      const co2 = distanceKm * CO2_FACTORS.train;
      expect(co2).toBe(10.25);
    });

    it("should calculate total CO2 for multiple transports", () => {
      const transports = [
        { type: "train" as const, distanceKm: 250 },
        { type: "bus" as const, distanceKm: 45.5 },
      ];

      const totalCO2 = transports.reduce((sum, transport) => {
        return sum + transport.distanceKm * CO2_FACTORS[transport.type];
      }, 0);

      expect(totalCO2).toBeCloseTo(14.2995, 2);
    });

    it("should calculate trees needed correctly", () => {
      const testCases = [
        { co2: 14.3, expectedTrees: 1 },
        { co2: 22.0, expectedTrees: 1 },
        { co2: 22.1, expectedTrees: 2 },
        { co2: 50.0, expectedTrees: 3 },
        { co2: 100.5, expectedTrees: 5 },
      ];

      testCases.forEach(({ co2, expectedTrees }) => {
        const trees = Math.ceil(co2 / 22);
        expect(trees).toBe(expectedTrees);
      });
    });
  });

  describe("ActivityType", () => {
    it("should have correct activity type values", () => {
      const validTypes = ["boat", "bus", "train", "car"];

      validTypes.forEach((type) => {
        expect(CO2_FACTORS).toHaveProperty(type);
      });
    });
  });
});
