import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { projectActivitiesTable, projectsTable } from "@/lib/drizzle/schema";
import type {
  ProjectWithActivitiesSchema,
  ProjectWithRelationsSchema,
} from "./validation-schemas";

// ============================================================================
// PROJECT TYPES
// ============================================================================

// Type inferred from DB schema
export type ProjectType = InferSelectModel<typeof projectsTable>;

// Type inferred from schema with relations (user, organization)
export type ProjectWithRelationsType = z.infer<typeof ProjectWithRelationsSchema>;

// Type inferred from schema with relations and activities
export type ProjectWithActivitiesType = z.infer<
  typeof ProjectWithActivitiesSchema
>;

// Sort options for projects
export const PROJECT_SORT_FIELDS = {
  name: "name",
  startDate: "startDate",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

export type ProjectSortField =
  (typeof PROJECT_SORT_FIELDS)[keyof typeof PROJECT_SORT_FIELDS];

// Default sort option
export const DEFAULT_PROJECT_SORTING_FIELD: ProjectSortField =
  PROJECT_SORT_FIELDS.startDate;

// ============================================================================
// PROJECT ACTIVITY TYPES
// ============================================================================

// Single source of truth for activity types
export const activityValues = ["boat", "bus", "train", "car"] as const;
export type ActivityValueType = (typeof activityValues)[number];

// Type inferred from DB schema
export type ProjectActivityType = InferSelectModel<typeof projectActivitiesTable>;

// ============================================================================
// DISTANCE CONSTANTS
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
