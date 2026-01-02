import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { projectsTable } from "@/lib/drizzle/schema";
import type {
	ProjectWithActivitiesSchema,
	ProjectWithRelationsSchema,
} from "./validation-schemas";

/**
 * Project sort field values
 */
export const PROJECT_SORT_FIELDS = [
	"name",
	"country",
	"startDate",
	"createdAt",
	"updatedAt",
] as const;

/**
 * Type for project sort field values
 */
export type ProjectSortField = (typeof PROJECT_SORT_FIELDS)[number];

/**
 * Default sorting configuration for projects table
 */
export const DEFAULT_PROJECT_SORTING: {
	id: ProjectSortField;
	desc: boolean;
}[] = [{ id: "startDate", desc: false }];

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
// PROJECT ACTIVITY TYPES (RE-EXPORTED)
// ============================================================================

/**
 * Re-export activity types from project-activities feature for convenience
 */
export type {
	ActivityValueType,
	ProjectActivityType,
} from "@/features/project-activities";
