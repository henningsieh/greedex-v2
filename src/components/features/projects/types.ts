import type { InferSelectModel } from "drizzle-orm";
import type { projectActivitiesTable, projectsTable } from "@/lib/drizzle/schema";

// ============================================================================
// PROJECT TYPES
// ============================================================================

// Type inferred from DB schema
export type ProjectType = InferSelectModel<typeof projectsTable>;

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
export const activityTypeValues = ["boat", "bus", "train", "car"] as const;
export type ActivityType = (typeof activityTypeValues)[number];

// Type inferred from DB schema
export type ProjectActivityType = InferSelectModel<typeof projectActivitiesTable>;
