/**
 * Project Activity Configuration
 * Single source of truth for activity types, distance settings, and emission factors
 */

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

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
const PARTICIPANT_ACTIVITY_VALUES = [
	...ACTIVITY_VALUES,
	"plane",
	"electricCar",
] as const;

/**
 * Type for participant activity values (includes plane and electricCar)
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
 * CO₂ emission factors for different transport types (kg CO₂ per km)
 * Based on European Environment Agency averages
 */
export const ACTIVITY_EMISSION_FACTORS: Record<
	ParticipantActivityValueType,
	number
> = {
	plane: 0.255, // Average commercial flight
	boat: 0.02, // Ferry/boat
	train: 0.014, // Electric train average
	bus: 0.089, // Long-distance bus
	car: 0.192, // Conventional car (diesel/petrol)
	electricCar: 0.053, // Electric car (EU average grid mix)
} as const;

// ============================================================================
// ACTIVITY DEFAULTS
// ============================================================================

/**
 * Default distance values for activities (km)
 * Used as placeholders in forms
 */
export const ACTIVITY_DEFAULT_DISTANCES: Record<
	ParticipantActivityValueType,
	number
> = {
	plane: 0,
	boat: 0,
	train: 0,
	bus: 0,
	car: 0,
	electricCar: 0,
} as const;
