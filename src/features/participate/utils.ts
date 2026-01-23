/**
 * Questionnaire utility functions for emission calculations
 *
 * This file contains helper functions and the main emission calculation logic
 * used in the participant questionnaire flow.
 */

import type { ProjectActivityType } from "@/features/project-activities/types";

import {
  CO2_PER_TREE_PER_YEAR,
  CONVENTIONAL_ENERGY_FACTOR,
  DEFAULT_CAR_PASSENGERS,
  GREEN_ENERGY_REDUCTION_FACTOR,
  ROOM_OCCUPANCY_FACTORS,
  ROUND_TRIP_MULTIPLIER,
} from "@/config/participate";
import { calculateActivitiesCO2, CO2_FACTORS } from "@/features/projects/utils";

import {
  ACCOMMODATION_FACTORS,
  type ElectricityType,
  type EmissionCalculation,
  FOOD_FACTORS,
  type ParticipantAnswers,
  type RoomOccupancy,
} from "./types";

/**
 * Get the emission reduction factor for a given room occupancy.
 *
 * @param occupancy - The room occupancy type
 * @returns The occupancy factor (1.0 = full emissions, <1.0 = reduced emissions)
 */
export function getOccupancyFactor(occupancy: RoomOccupancy | undefined): number {
  if (!occupancy) {
    return ROOM_OCCUPANCY_FACTORS.alone;
  }
  return ROOM_OCCUPANCY_FACTORS[occupancy];
}

/**
 * Get the emission factor for electricity type.
 *
 * @param electricity - The electricity type used
 * @returns The electricity factor (0.75 for green energy, 1.0 otherwise)
 */
export function getElectricityFactor(
  electricity: ElectricityType | undefined,
): number {
  if (electricity === "green energy") {
    return GREEN_ENERGY_REDUCTION_FACTOR;
  }
  return CONVENTIONAL_ENERGY_FACTOR;
}

/**
 * Calculate CO₂ emissions from participant answers and estimate the number of trees required to offset the total.
 *
 * @param answers - Partial participant responses. Uses fields: `flightKm`, `boatKm`, `trainKm`, `busKm`, `carKm`, `carType`, `carPassengers`, `days`, `accommodationCategory`, `roomOccupancy`, `electricity`, and `food`
 * @param projectActivities - Optional array of project-level activities that contribute baseline CO₂ emissions
 * @returns An EmissionCalculation object containing:
 * - `transportCO2` — total transport emissions in kilograms of CO₂ (includes round trip and per-passenger car allocation),
 * - `accommodationCO2` — accommodation emissions in kilograms of CO₂ (adjusted by room occupancy and electricity type),
 * - `foodCO2` — food-related emissions in kilograms of CO₂,
 * - `projectActivitiesCO2` — CO₂ from provided project-level activities in kilograms of CO₂,
 * - `totalCO2` — sum of all above emissions in kilograms of CO₂,
 * - `treesNeeded` — number of trees required to offset `totalCO2` (rounded up)
 */
export function calculateEmissions(
  answers: Partial<ParticipantAnswers>,
  projectActivities?: ProjectActivityType[],
): EmissionCalculation {
  let transportCO2 = 0;
  let accommodationCO2 = 0;
  let foodCO2 = 0;

  // Calculate transport emissions (round trip: TO and FROM project)
  if (answers.flightKm) {
    transportCO2 += answers.flightKm * CO2_FACTORS.plane;
  }
  if (answers.boatKm) {
    transportCO2 += answers.boatKm * CO2_FACTORS.boat;
  }
  if (answers.trainKm) {
    transportCO2 += answers.trainKm * CO2_FACTORS.train;
  }
  if (answers.busKm) {
    transportCO2 += answers.busKm * CO2_FACTORS.bus;
  }
  if (answers.carKm) {
    const carFactor =
      answers.carType === "electricCar"
        ? CO2_FACTORS.electricCar
        : CO2_FACTORS.car;
    const passengers = answers.carPassengers || DEFAULT_CAR_PASSENGERS;
    transportCO2 += (answers.carKm * carFactor) / passengers;
  }

  // Double transport emissions for round trip (to and from project)
  transportCO2 *= ROUND_TRIP_MULTIPLIER;

  // Calculate accommodation emissions
  if (answers.days && answers.accommodationCategory) {
    const baseFactor = ACCOMMODATION_FACTORS[answers.accommodationCategory];
    const occupancyFactor = getOccupancyFactor(answers.roomOccupancy);
    const electricityFactor = getElectricityFactor(answers.electricity);

    accommodationCO2 =
      answers.days * baseFactor * occupancyFactor * electricityFactor;
  }

  // Calculate food emissions
  if (answers.days && answers.food) {
    foodCO2 = answers.days * FOOD_FACTORS[answers.food];
  }

  // Calculate project activities emissions (baseline CO₂)
  const projectActivitiesCO2 = projectActivities
    ? calculateActivitiesCO2(projectActivities)
    : 0;

  const totalCO2 =
    transportCO2 + accommodationCO2 + foodCO2 + projectActivitiesCO2;
  const treesNeeded = Math.ceil(totalCO2 / CO2_PER_TREE_PER_YEAR);

  return {
    transportCO2,
    accommodationCO2,
    foodCO2,
    projectActivitiesCO2,
    totalCO2,
    treesNeeded,
  };
}

/**
 * Utility functions for form validation
 */

/**
 * Determine whether a string contains non-whitespace characters.
 *
 * @param value - The string to check
 * @returns `true` if `value` exists and contains characters other than whitespace, `false` otherwise
 */
export function isNonEmptyString(value: string | undefined): boolean {
  return !!value?.trim();
}

/**
 * Determines whether a value is a positive number greater than 0.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a finite number greater than 0, `false` otherwise.
 */
export function isPositiveNumber(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    !Number.isNaN(value) &&
    value > 0
  );
}

/**
 * Determine whether a value is a number greater than or equal to 0.
 *
 * @param value - The value to validate
 * @returns `true` if `value` is a finite number greater than or equal to 0, `false` otherwise.
 */
export function isNonNegativeNumber(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    !Number.isNaN(value) &&
    value >= 0
  );
}

/**
 * Determines whether a value is greater than or equal to a specified minimum.
 *
 * @param value - The value to validate
 * @param min - The minimum allowed value (inclusive)
 * @returns `true` if the value is a finite number greater than or equal to `min`, `false` otherwise.
 */
export function isNumberAtLeast(value: unknown, min: number): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    !Number.isNaN(value) &&
    value >= min
  );
}

/**
 * Determine whether every provided string contains non-whitespace characters.
 *
 * @returns `true` if every value is a non-empty string after trimming, `false` otherwise.
 */
export function areAllNonEmpty(...values: (string | undefined)[]): boolean {
  return values.every((value) => isNonEmptyString(value));
}

/**
 * Determine whether a value is truthy.
 *
 * @param value - The value to evaluate for truthiness
 * @returns `true` if `value` is truthy, `false` otherwise
 */
export function isTruthy(value: unknown): boolean {
  return !!value;
}
