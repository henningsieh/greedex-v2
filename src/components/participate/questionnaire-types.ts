// Questionnaire types based on the clickdummy App.js structure

import type {
  ProjectActivityType,
  ProjectWithActivitiesType,
} from "@/components/features/projects/types";
import { CO2_FACTORS, calculateActivitiesCO2 } from "@/lib/utils/project-utils";

const ACCOMMODATION_DATA = [
  ["Camping", 1.5],
  ["Hostel", 3.0],
  ["3★ Hotel", 5.0],
  ["4★ Hotel", 7.5],
  ["5★ Hotel", 10.0],
  ["Apartment", 4.0],
  ["Friends/Family", 2.0],
] as const;

const ACCOMMODATION_VALUES = ACCOMMODATION_DATA.map(([value]) => value);

export type AccommodationCategory = (typeof ACCOMMODATION_VALUES)[number];

const ROOM_OCCUPANCY_VALUES = [
  "alone",
  "2 people",
  "3 people",
  "4+ people",
] as const;

export type RoomOccupancy = (typeof ROOM_OCCUPANCY_VALUES)[number];

const ELECTRICITY_VALUES = [
  "green energy",
  "conventional energy",
  "could not find out",
] as const;

export type ElectricityType = (typeof ELECTRICITY_VALUES)[number];

const FOOD_DATA = [
  ["never", 1.5], // Never eat meat (vegetarian/vegan) - lowest emissions
  ["rarely", 2.5], // Rarely eat meat
  ["sometimes", 4.0], // Sometimes eat meat
  ["almost every day", 5.5], // Almost every day eat meat
  ["every day", 7.0], // Every day eat meat - highest emissions
] as const;

const FOOD_VALUES = FOOD_DATA.map(([value]) => value);

export type FoodFrequency = (typeof FOOD_VALUES)[number];

const CAR_TYPE_VALUES = [
  "conventional (diesel, petrol, gas…)",
  "electric",
] as const;

export type CarType = (typeof CAR_TYPE_VALUES)[number];

const GENDER_VALUES = ["Female", "Male", "Other / Prefer not to say"] as const;

export type Gender = (typeof GENDER_VALUES)[number];

export const ACCOMMODATION_OPTIONS: AccommodationCategory[] = [
  ...ACCOMMODATION_VALUES,
];

export const ROOM_OCCUPANCY_OPTIONS: RoomOccupancy[] = [...ROOM_OCCUPANCY_VALUES];

export const ELECTRICITY_OPTIONS: ElectricityType[] = [...ELECTRICITY_VALUES];

export const FOOD_OPTIONS: FoodFrequency[] = [...FOOD_VALUES];

export const CAR_TYPE_OPTIONS: CarType[] = [...CAR_TYPE_VALUES];

export const GENDER_OPTIONS: Gender[] = [...GENDER_VALUES];

export interface ParticipantAnswers {
  // Step 0: Participant Info
  firstName: string;
  country: string;
  email: string;

  // Step 1: Days
  days: number;

  // Step 2: Accommodation category
  accommodationCategory: AccommodationCategory;

  // Step 3: Room occupancy
  roomOccupancy: RoomOccupancy;

  // Step 4: Electricity
  electricity: ElectricityType;

  // Step 5: Food
  food: FoodFrequency;

  // Step 6: Flight km TO project
  flightKm: number;

  // Step 7: Boat km TO project
  boatKm: number;

  // Step 8: Train km TO project
  trainKm: number;

  // Step 9: Bus km TO project
  busKm: number;

  // Step 10: Car km TO project
  carKm: number;

  // Step 11: Car type (conditional on carKm > 0)
  carType?: CarType;

  // Step 12: Car passengers (conditional on carKm > 0)
  carPassengers?: number;

  // Step 13: Age
  age: number;

  // Step 14: Gender
  gender: Gender;
}

// Accommodation CO₂ factors (kg CO₂ per night per person)
export const ACCOMMODATION_FACTORS: Record<AccommodationCategory, number> =
  Object.fromEntries(ACCOMMODATION_DATA) as Record<AccommodationCategory, number>;

// Food CO₂ factors (kg CO₂ per day)
const FOOD_FACTORS: Record<FoodFrequency, number> = Object.fromEntries(
  FOOD_DATA,
) as Record<FoodFrequency, number>;

// Re-export Project type for use in questionnaire components
export type Project = ProjectWithActivitiesType;

export interface EmissionCalculation {
  transportCO2: number;
  accommodationCO2: number;
  foodCO2: number;
  projectActivitiesCO2: number;
  totalCO2: number;
  treesNeeded: number;
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
    transportCO2 += answers.flightKm * CO2_FACTORS.flight;
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
      answers.carType === "electric" ? CO2_FACTORS.electricCar : CO2_FACTORS.car;
    const passengers = answers.carPassengers || 1;
    transportCO2 += (answers.carKm * carFactor) / passengers;
  }

  // Double transport emissions for round trip (to and from project)
  transportCO2 *= 2;

  // Calculate accommodation emissions
  if (answers.days && answers.accommodationCategory) {
    const baseFactor = ACCOMMODATION_FACTORS[answers.accommodationCategory];

    // Adjust for room occupancy
    let occupancyFactor = 1.0;
    switch (answers.roomOccupancy) {
      case "alone":
        occupancyFactor = 1.0;
        break;
      case "2 people":
        occupancyFactor = 0.6;
        break;
      case "3 people":
        occupancyFactor = 0.4;
        break;
      case "4+ people":
        occupancyFactor = 0.3;
        break;
    }

    // Adjust for electricity type (green energy reduces emissions by 25%)
    let electricityFactor = 1.0;
    if (answers.electricity === "green energy") {
      electricityFactor = 0.75;
    }

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
  const treesNeeded = Math.ceil(totalCO2 / 22); // 22kg CO₂ per tree per year

  return {
    transportCO2,
    accommodationCO2,
    foodCO2,
    projectActivitiesCO2,
    totalCO2,
    treesNeeded,
  };
}
