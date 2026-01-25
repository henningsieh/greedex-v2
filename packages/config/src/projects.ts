/**
 * Project-related types and configuration
 */

/**
 * Valid project sort field values
 * These correspond to the sortable columns in the projects table
 */
export type ProjectSortField =
  | "id"
  | "name"
  | "startDate"
  | "endDate"
  | "location"
  | "country"
  | "welcomeMessage"
  | "responsibleUserId"
  | "organizationId"
  | "archived"
  | "createdAt"
  | "updatedAt";

/**
 * Default project duration in days when creating a new project.
 */
export const DEFAULT_PROJECT_DURATION_DAYS = 5;

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
