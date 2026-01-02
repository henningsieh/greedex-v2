/**
 * Questionnaire utility functions for emission calculations
 *
 * This file contains helper functions and the main emission calculation logic
 * used in the participant questionnaire flow.
 */

import type { ProjectActivityType } from "@/components/features/projects/types";
import {
  CO2_PER_TREE_PER_YEAR,
  CONVENTIONAL_ENERGY_FACTOR,
  DEFAULT_CAR_PASSENGERS,
  GREEN_ENERGY_REDUCTION_FACTOR,
  ROOM_OCCUPANCY_FACTORS,
  ROUND_TRIP_MULTIPLIER,
} from "@/config/questionnaire";
import { CO2_FACTORS, calculateActivitiesCO2 } from "@/lib/utils/project-utils";
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
export function getOccupancyFactor(
  occupancy: RoomOccupancy | undefined,
): number {
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
 * Compute CO₂ emissions from participant responses and estimate the number of trees required to offset the total.
 *
 * @param answers - Partial participant responses; fields used: `flightKm`, `boatKm`, `trainKm`, `busKm`, `carKm`, `carType`, `carPassengers`, `days`, `accommodationCategory`, `roomOccupancy`, `electricity`, and `food`
 * @param projectActivities - Optional project-level activities that contribute baseline CO₂ emissions
 * @returns An EmissionCalculation object containing:
 * - `transportCO2` — total transport emissions in kilograms CO₂ (includes round trip and per-passenger car sharing),
 * - `accommodationCO2` — accommodation emissions in kilograms CO₂ (adjusted by occupancy and electricity type),
 * - `foodCO2` — food emissions in kilograms CO₂,
 * - `projectActivitiesCO2` — CO₂ from project-level activities in kilograms,
 * - `totalCO2` — sum of all emissions in kilograms CO₂,
 * - `treesNeeded` — number of trees required to offset `totalCO2` (computed as `Math.ceil(totalCO2 / 22)`)
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
      answers.carType === "electric"
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
