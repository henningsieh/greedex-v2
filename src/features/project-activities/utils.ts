/**
 * Distance utility functions for project activities
 */

/**
 * Check if a distance value is a valid multiple of the step increment
 *
 * @param value - The distance value to check
 * @param step - The step increment (defaults to DISTANCE_KM_STEP)
 * @returns true if the value is a valid multiple of the step
 */
export function isMultipleOfStep(value: number, step = 0.1): boolean {
  // Handle floating point precision by using integer arithmetic
  // Multiply by 10 to convert to tenths, then check if it's an integer
  const multiplier = 1 / step;
  const scaled = Math.round(value * multiplier);
  return Math.abs(value * multiplier - scaled) < Number.EPSILON;
}

/**
 * Zod refinement function for distance validation
 * Ensures the distance is a valid multiple of the step increment
 *
 * @param value - The distance value to validate
 * @returns true if valid, false otherwise
 */
export function validateDistanceStep(value: number): boolean {
  return isMultipleOfStep(value);
}
