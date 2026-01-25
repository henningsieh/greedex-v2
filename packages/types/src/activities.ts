/**
 * Activity types
 * Type definitions for project and participant activities
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
