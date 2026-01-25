import type { ProjectSortField } from "@/features/projects/types";

/**
 * Default project duration in days when creating a new project.
 */
export const DEFAULT_PROJECT_DURATION_DAYS = 5;

/**
 * Milliseconds in one day (used for date/time calculations).
 */
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Default sorting configuration for projects table (single column)
 * - column: project field used for default sort
 * - order: 'asc' | 'desc'
 */
export const DEFAULT_PROJECT_SORT = {
  column: "name",
  order: "desc",
} as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};
