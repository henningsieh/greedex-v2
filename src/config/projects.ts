import type { ProjectSortField } from "@/components/features/projects/types";

/**
 * Project Sorting Configuration
 * Single source of truth for project sort fields and defaults
 */

/**
 * Available sort fields for projects
 */
export const PROJECT_SORT_FIELDS = {
  name: "name",
  startDate: "startDate",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Default sort field for project listings
 */
export const DEFAULT_PROJECT_SORTING_FIELD: ProjectSortField =
  PROJECT_SORT_FIELDS.startDate;
