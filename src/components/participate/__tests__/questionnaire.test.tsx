import { describe, expect, it } from "vitest";
import {
  ACCOMMODATION_FACTORS,
  CO2_FACTORS,
  calculateEmissions,
  type ParticipantAnswers,
} from "../questionnaire-types";

describe("Questionnaire Types and Calculations", () => {
  describe("CO2 Emission Factors", () => {
    it("should have correct transport emission factors", () => {
      expect(CO2_FACTORS.flight).toBe(0.255);
      expect(CO2_FACTORS.boat).toBe(0.115);
      expect(CO2_FACTORS.train).toBe(0.041);
      expect(CO2_FACTORS.bus).toBe(0.089);
      expect(CO2_FACTORS.car).toBe(0.192);
      expect(CO2_FACTORS.electricCar).toBe(0.053);
    });

    it("should have accommodation factors for all types", () => {
      expect(ACCOMMODATION_FACTORS.Camping).toBe(1.5);
      expect(ACCOMMODATION_FACTORS.Hostel).toBe(3.0);
      expect(ACCOMMODATION_FACTORS["3★ Hotel"]).toBe(5.0);
      expect(ACCOMMODATION_FACTORS["4★ Hotel"]).toBe(7.5);
      expect(ACCOMMODATION_FACTORS["5★ Hotel"]).toBe(10.0);
      expect(ACCOMMODATION_FACTORS.Apartment).toBe(4.0);
      expect(ACCOMMODATION_FACTORS["Friends/Family"]).toBe(2.0);
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

      // 100 * 0.255 + 50 * 0.041 + 20 * 0.089 = 25.5 + 2.05 + 1.78 = 29.33
      expect(emissions.transportCO2).toBeCloseTo(29.33, 1);
    });

    it("should calculate car emissions with passengers correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        carKm: 100,
        carType: "conventional (diesel, petrol, gas…)",
        carPassengers: 4,
      };

      const emissions = calculateEmissions(answers);

      // 100 * 0.192 / 4 = 4.8
      expect(emissions.transportCO2).toBeCloseTo(4.8, 1);
    });

    it("should calculate electric car emissions correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        carKm: 100,
        carType: "electric",
        carPassengers: 1,
      };

      const emissions = calculateEmissions(answers);

      // 100 * 0.053 / 1 = 5.3
      expect(emissions.transportCO2).toBeCloseTo(5.3, 1);
    });

    it("should calculate accommodation emissions correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 7,
        accommodationCategory: "Hostel",
        roomOccupancy: "2 people",
        electricity: "green energy",
      };

      const emissions = calculateEmissions(answers);

      // 7 days * 3.0 (hostel) * 0.6 (2 people) * 0.5 (green energy) = 6.3
      expect(emissions.accommodationCO2).toBeCloseTo(6.3, 1);
    });

    it("should calculate food emissions correctly", () => {
      const answers: Partial<ParticipantAnswers> = {
        days: 7,
        food: "sometimes",
      };

      const emissions = calculateEmissions(answers);

      // 7 days * 4.0 (sometimes) = 28.0
      expect(emissions.foodCO2).toBeCloseTo(28.0, 1);
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

      // Transport: 500 * 0.255 = 127.5
      // Accommodation: 7 * 1.5 * 0.3 * 0.5 = 1.575
      // Food: 7 * 1.5 = 10.5
      // Total: 139.575
      expect(emissions.totalCO2).toBeCloseTo(139.575, 1);
      expect(emissions.treesNeeded).toBe(7); // ceil(139.575 / 22)
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
});
