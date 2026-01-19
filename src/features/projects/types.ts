import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";

import type { projectsTable } from "@/lib/drizzle/schema";

import type {
  ProjectSortFieldSchema,
  ProjectWithActivitiesSchema,
  ProjectWithRelationsSchema,
} from "./validation-schemas";

/**
 * Project sort field values (type-safe)
 */
type ProjectColumns = keyof typeof projectsTable.$inferSelect;

export type ProjectSortField = ProjectColumns;

export const PROJECT_SORT_FIELDS = [
  "name",
  "country",
  "location",
  "startDate",
  "createdAt",
  "updatedAt",
] as const satisfies readonly ProjectSortField[];

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

// ============================================================================
// PROJECT ACTIVITY TYPES (RE-EXPORTED)
// ============================================================================

/**
 * Re-export activity types from project-activities feature for convenience
 */
export type {
  ActivityValueType,
  ProjectActivityType,
} from "@/features/project-activities/types";

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
