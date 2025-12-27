import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { ACTIVITY_VALUES } from "@/config/activities";
import type { PROJECT_SORT_FIELDS } from "@/config/projects";
import type {
  projectActivitiesTable,
  projectsTable,
} from "@/lib/drizzle/schema";
import type {
  ProjectWithActivitiesSchema,
  ProjectWithRelationsSchema,
} from "./validation-schemas";

/**
 * Type for project sort field values
 */
export type ProjectSortField =
  (typeof PROJECT_SORT_FIELDS)[keyof typeof PROJECT_SORT_FIELDS];

// ============================================================================
// PROJECT TYPES
// ============================================================================

// Type inferred from DB schema
export type ProjectType = InferSelectModel<typeof projectsTable>;

// Type inferred from schema with relations (user, organization)
export type ProjectWithRelationsType = z.infer<
  typeof ProjectWithRelationsSchema
>;

// Type inferred from schema with relations and activities
export type ProjectWithActivitiesType = z.infer<
  typeof ProjectWithActivitiesSchema
>;

// ============================================================================
// PROJECT ACTIVITY TYPES
// ============================================================================

// Type inferred from DB schema
export type ProjectActivityType = InferSelectModel<
  typeof projectActivitiesTable
>;

/**
 * Type for activity values
 */
export type ActivityValueType = (typeof ACTIVITY_VALUES)[number];
