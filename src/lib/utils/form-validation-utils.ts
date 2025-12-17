/**
 * Utility functions for form validation
 */

/**
 * Check if a string value is non-empty (truthy after trimming).
 *
 * @param value - The string value to validate
 * @returns true if the string is non-empty after trimming
 */
export function isNonEmptyString(value: string | undefined): boolean {
  return !!value?.trim();
}

/**
 * Check if a value is a positive number (greater than 0).
 *
 * @param value - The value to validate
 * @returns true if the value is a finite number greater than 0
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
 * Check if a value is a non-negative number (greater than or equal to 0).
 *
 * @param value - The value to validate
 * @returns true if the value is a finite number >= 0
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
 * Check if a value is a number within a specific minimum range.
 *
 * @param value - The value to validate
 * @param min - The minimum allowed value (inclusive)
 * @returns true if the value is a finite number >= min
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
 * Check if all provided string values are non-empty.
 *
 * @param values - Array of string values to validate
 * @returns true if all strings are non-empty after trimming
 */
export function areAllNonEmpty(...values: (string | undefined)[]): boolean {
  return values.every((value) => isNonEmptyString(value));
}

/**
 * Check if a value is truthy (exists and is not falsy).
 *
 * @param value - The value to check
 * @returns true if the value is truthy
 */
export function isTruthy(value: unknown): boolean {
  return !!value;
}
