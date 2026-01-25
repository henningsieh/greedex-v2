/**
 * Questionnaire configuration - real-world values for CO₂ emission calculations
 *
 * This file contains all hard-coded configuration values, data arrays, and factors
 * used in participant questionnaire calculations. These values are based on scientific
 * studies and real-world emission factors.
 */

// ============================================================================
// QUESTIONNAIRE STRUCTURE
// ============================================================================

/**
 * Step indices for the questionnaire.
 * Keys are in camelCase to match answer property names.
 */
export const QUESTIONNAIRE_STEPS = {
  welcome: 0,
  participantInfo: 1,
  days: 2,
  accommodationCategory: 3,
  roomOccupancy: 4,
  electricity: 5,
  food: 6,
  flightKm: 7,
  boatKm: 8,
  trainKm: 9,
  busKm: 10,
  carKm: 11,
  carType: 12, // Conditional - only if carKm > 0
  carPassengers: 13, // Conditional - only if carKm > 0
  age: 14,
  gender: 15,
} as const;

export const getParticipateStepsKey = (
  step: (typeof QUESTIONNAIRE_STEPS)[keyof typeof QUESTIONNAIRE_STEPS],
): keyof typeof QUESTIONNAIRE_STEPS | null => {
  const entry = Object.entries(QUESTIONNAIRE_STEPS).find(
    ([, value]) => value === step,
  );
  return entry ? (entry[0] as keyof typeof QUESTIONNAIRE_STEPS) : null;
};

/**
 * Total number of steps in the questionnaire.
 * Breakdown:
 * - 1 welcome screen
 * - 1 participant info (name, country, email)
 * - 14 questions (days, accommodation, food, transport, demographics)
 */
export const PARTICIPATE_TOTAL_STEPS = Object.keys(QUESTIONNAIRE_STEPS).length;

/**
 * Steps that should trigger the impact modal when answered.
 */
export const EMISSION_IMPACT_STEPS = [
  "electricity",
  "food",
  "flightKm",
  "boatKm",
  "trainKm",
  "busKm",
  "carPassengers",
] as const;

// ============================================================================
// EMISSION CALCULATION CONSTANTS
// ============================================================================

/**
 * Number of people in room affects CO₂ emissions due to shared resources.
 * These factors reduce emissions proportionally when rooms are shared.
 */
export const ROOM_OCCUPANCY_FACTORS = {
  alone: 1.0, // Full emissions - single occupancy
  "2 people": 0.6, // 40% reduction when sharing with 1 person
  "3 people": 0.4, // 60% reduction when sharing with 2 people
  "4+ people": 0.3, // 70% reduction when sharing with 3+ people
} as const;

/**
 * Green energy sources reduce accommodation emissions.
 * Factor represents the percentage of emissions remaining (75% = 25% reduction).
 */
export const GREEN_ENERGY_REDUCTION_FACTOR = 0.75;

/**
 * Standard electricity (conventional) has no emission reduction.
 */
export const CONVENTIONAL_ENERGY_FACTOR = 1.0;

/**
 * Number of kilograms of CO₂ that one tree absorbs per year.
 * Used to calculate how many trees are needed to offset total emissions.
 */
export const CO2_PER_TREE_PER_YEAR = 22;

/**
 * Round trip multiplier - participants travel TO and FROM the project.
 */
export const ROUND_TRIP_MULTIPLIER = 2;

/**
 * Default number of passengers when not specified (driver only).
 */
export const DEFAULT_CAR_PASSENGERS = 1;

// ============================================================================
// ACCOMMODATION CONFIGURATION
// ============================================================================

/**
 * Accommodation types with their CO₂ emission factors (kg CO₂ per night per person)
 */
export const ACCOMMODATION_DATA = [
  ["Camping", 1.5],
  ["Hostel", 3.0],
  ["3★ Hotel", 5.0],
  ["4★ Hotel", 7.5],
  ["5★ Hotel", 10.0],
  ["Apartment", 4.0],
  ["Friends/Family", 2.0],
] as const;

export const ACCOMMODATION_VALUES = ACCOMMODATION_DATA.map(([value]) => value);

// ============================================================================
// ROOM OCCUPANCY CONFIGURATION
// ============================================================================

export const ROOM_OCCUPANCY_VALUES = [
  "alone",
  "2 people",
  "3 people",
  "4+ people",
] as const;

// ============================================================================
// ELECTRICITY TYPE CONFIGURATION
// ============================================================================

export const ELECTRICITY_VALUES = [
  "green energy",
  "conventional energy",
  "could not find out",
] as const;

// ============================================================================
// FOOD CONFIGURATION
// ============================================================================

/**
 * Food consumption frequency with CO₂ emission factors (kg CO₂ per day)
 * Based on meat consumption frequency
 */
export const FOOD_DATA = [
  ["never", 1.5], // Never eat meat (vegetarian/vegan) - lowest emissions
  ["rarely", 2.5], // Rarely eat meat
  ["sometimes", 4.0], // Sometimes eat meat
  ["almost every day", 5.5], // Almost every day eat meat
  ["every day", 7.0], // Every day eat meat - highest emissions
] as const;

export const FOOD_VALUES = FOOD_DATA.map(([value]) => value);

// ============================================================================
// CAR TYPE CONFIGURATION
// ============================================================================
import { PARTICIPANT_ACTIVITY_VALUES } from "@greendex/config/activities";
export const CAR_TYPE_VALUES = PARTICIPANT_ACTIVITY_VALUES.filter((v: string) =>
  v.toLowerCase().includes("car"),
);

// ============================================================================
// GENDER CONFIGURATION
// ============================================================================
export const GENDER_VALUES = [
  "Female",
  "Male",
  "Other / Prefer not to say",
] as const;

// ============================================================================
// EXPORTED OPTIONS FOR UI COMPONENTS
// ============================================================================

export const ACCOMMODATION_OPTIONS = [...ACCOMMODATION_VALUES];
export const ROOM_OCCUPANCY_OPTIONS = [...ROOM_OCCUPANCY_VALUES];
export const ELECTRICITY_OPTIONS = [...ELECTRICITY_VALUES];
export const FOOD_OPTIONS = [...FOOD_VALUES];
export const CAR_TYPE_OPTIONS = [...CAR_TYPE_VALUES];
export const GENDER_OPTIONS = [...GENDER_VALUES];
