import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";

// import { ProjectSortField } from "@greendex/database/config/projects";
import { projectsTable } from "@greendex/database";

import type {
  ProjectSortFieldSchema,
  ProjectWithActivitiesSchema,
  ProjectWithRelationsSchema,
} from "./validation-schemas";

/**
 * Valid project sort field values
 * These correspond to the sortable columns in the projects table
 */
export type ProjectSortField = keyof typeof projectsTable.$inferSelect;

export const PROJECT_SORT_FIELDS = [
  "name",
  "country",
  "location",
  "startDate",
  "createdAt",
  "updatedAt",
] as const satisfies readonly ProjectSortField[];

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

/**
 * Default project duration in days when creating a new project.
 */
export const DEFAULT_PROJECT_DURATION_DAYS = 5;

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

/**
 * Project statistics summary object returned by `getProjectStatistics`.
 */
export type ProjectStatistics = {
  participantsCount: number;
  activitiesCount: number;
  totalDistanceKm: number;
  durationDays: number;
  activitiesCO2Kg: number;
};

// ============================================================================
// Helper types for listProjects procedures
// ============================================================================

/**
 * Input type for listing projects procedure
 */
export type ListProjectsInput =
  | {
      sort_by?: z.infer<typeof ProjectSortFieldSchema>;
      archived?: boolean;
    }
  | undefined;
