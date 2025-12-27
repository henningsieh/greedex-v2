/**
 * Project Activity Configuration
 * Single source of truth for activity types and distance settings
 */

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

/**
 * Available activity/transport types for projects
 * Used in database schema, forms, and calculations
 */
export const ACTIVITY_VALUES = ["boat", "bus", "train", "car"] as const;

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
