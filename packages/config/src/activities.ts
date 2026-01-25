/**
 * Activity types and configuration
 * Type definitions for project and participant activities plus emission factors
 */

/**
 * Available activity/transport types for projects
 * Used in database schema, forms, and calculations
 */
export const ACTIVITY_VALUES = ["boat", "bus", "train", "car"] as const;

/**
 * Type for project activity values
 */
export type ActivityValueType = (typeof ACTIVITY_VALUES)[number];

/**
 * Participant activities extend project activities with plane and electric car
 * These additional transport modes are specific to participant questionnaires
 */
export const PARTICIPANT_ACTIVITY_VALUES = [
  ...ACTIVITY_VALUES,
  "plane",
  "electricCar",
] as const;

/**
 * Type for participant activity values
 */
export type ParticipantActivityValueType =
  (typeof PARTICIPANT_ACTIVITY_VALUES)[number];

// ============================================================================
// DISTANCE CONFIGURATIONS
// ============================================================================

/**
 * Minimum distance in kilometers for project activities
 * Activities must have at least this distance to be valid
 */
export const MIN_DISTANCE_KM = 0.1;

/**
 * Maximum distance in kilometers for project activities.
 * Activities must not exceed this value to be considered valid.
 *
 * Recommendation for form validation:
 * - Use a hard upper bound slightly above realistic values to avoid edge-case rounding.
 * - Suggested max distance: 6,000 km.
 *
 * Why not higher?
 * - Erasmus+ funding bands do not support intercontinental EU distances.
 * - Official calculators never reach 10,000+ km.
 * - Distances above ~6,000 km are effectively guaranteed invalid in the Erasmus+ context.
 */
export const MAX_DISTANCE_KM = 6000;

/**
 * Step increment for distance input fields
 * Distance values must be multiples of this step
 */
export const DISTANCE_KM_STEP = 0.1;

/**
 * Database decimal precision for distance_km column
 * Total number of digits (both before and after decimal point)
 */
export const DECIMAL_PRECISION = 10;

/**
 * Database decimal scale for distance_km column
 * Number of digits after the decimal point
 * Scale of 1 supports step of 0.1 (one decimal place)
 */
export const DECIMAL_SCALE = 1;

// ============================================================================
// EMISSION FACTORS (kg CO₂ per km)
// ============================================================================

/**
 * CO₂ emission factors for Erasmus+ journeys (kg CO₂ per km)
 * Focused on intra-European travel within typical Erasmus+ distance bands
 * Based on European Environment Agency and Our World in Data transport research
 */
export const ACTIVITY_EMISSION_FACTORS: Record<
  ParticipantActivityValueType,
  number
> = {
  plane: 0.154, // Short-haul intra-European flights (typical 500-2000km range)
  boat: 0.05, // Standard ferry (use 0.115 for fast/long-distance ferry)
  train: 0.035, // EU electric train average (lower for high-speed rail)
  bus: 0.032, // Long-distance coach (Erasmus-eligible green travel)
  car: 0.168, // Real-world EU fleet average (diesel/petrol)
  electricCar: 0.053, // Electric car (EU grid mix average)
} as const;
