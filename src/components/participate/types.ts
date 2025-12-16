import type { z } from "zod";
import type { ParticipantSchema } from "@/components/features/participants/validation-schemas";
import { activityValues } from "@/components/features/projects/types";

// Participant activities extend project activities with plane and electric car
const participantActivityValues = [
  ...activityValues,
  "plane",
  "electricCar",
] as const;
export type ParticipantActivityValueType =
  (typeof participantActivityValues)[number];

/**
 * Participation activity type - computed values for UI display
 * Represents individual travel segments calculated from participant questionnaire responses
 * Not stored in database, computed at runtime for display purposes
 */
export type ParticipantActivity = {
  id: string;
  type: ParticipantActivityValueType; // Includes all transport modes: boat, bus, train, car, plane, electricCar
  distanceKm: number;
  co2Kg: number;
};

// Computed fields type for participant statistics
// These are calculated on-the-fly and are not stored in the database
type ParticipantComputedFields = {
  totalCO2: number;
  rank?: number;
};

/**
 * Participant type for UI display with computed fields
 * This extends the inferred database type with calculated values
 */
export type Participant = z.infer<typeof ParticipantSchema> & {
  activities: ParticipantActivity[];
} & ParticipantComputedFields;

/**
 * Project statistics type - computed values only, not persisted
 * This is calculated on-the-fly from participant and activity data
 */
export type ProjectStats = {
  totalParticipants: number;
  totalCO2: number;
  averageCO2: number;
  breakdownByType: Record<
    ParticipantActivityValueType,
    {
      distance: number;
      co2: number;
      count: number;
    }
  >;
  treesNeeded: number; // Average tree absorbs ~22kg CO₂ per year, ~1 ton in lifetime (~45 years)
};
