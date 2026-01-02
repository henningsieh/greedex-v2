import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { DISTANCE_KM_STEP, MIN_DISTANCE_KM } from "@/config/activities";
import {
	projectActivitiesTable,
	projectsTable,
} from "@/lib/drizzle/schema";
import { validateDistanceStep } from "@/lib/utils/distance-utils";

// ============================================================================
// ACTIVITY FORM SCHEMAS
// ============================================================================

/**
 * Schema for creating activities from forms/client
 * Omits auto-generated fields (id, timestamps)
 */
export const CreateActivityInputSchema = createInsertSchema(
	projectActivitiesTable,
)
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		distanceKm: z
			.number()
			.min(MIN_DISTANCE_KM, `Distance must be at least ${MIN_DISTANCE_KM} km`)
			.refine(
				validateDistanceStep,
				`Distance must be in increments of ${DISTANCE_KM_STEP} km`,
			),
	});

/**
 * Schema for updating activities from client
 * Cannot change projectId or id
 */
export const UpdateActivityInputSchema = createUpdateSchema(
	projectActivitiesTable,
)
	.omit({
		id: true,
		projectId: true, // Cannot change which project the activity belongs to
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		distanceKm: z
			.number()
			.min(MIN_DISTANCE_KM, `Distance must be at least ${MIN_DISTANCE_KM} km`)
			.refine(
				validateDistanceStep,
				`Distance must be in increments of ${DISTANCE_KM_STEP} km`,
			)
			.optional(),
	});

/**
 * Activity form item schema (without projectId, used in project forms)
 */
export const ActivityFormItemSchema = CreateActivityInputSchema.omit({
	projectId: true,
});

/**
 * Edit activity form item schema (includes id for existing activities)
 */
export const EditActivityFormItemSchema = createUpdateSchema(
	projectActivitiesTable,
)
	.omit({
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		id: z.string(), // Required for existing activities to identify them
		projectId: z.string(), // Required for activities
		distanceKm: z
			.number()
			.min(MIN_DISTANCE_KM, `Distance must be at least ${MIN_DISTANCE_KM} km`)
			.refine(
				validateDistanceStep,
				`Distance must be in increments of ${DISTANCE_KM_STEP} km`,
			),
		isNew: z.boolean().optional(), // Track if activity is new
		isDeleted: z.boolean().optional(), // Track if activity should be deleted
	});

// ============================================================================
// ACTIVITY QUERY SCHEMAS
// ============================================================================

/**
 * Schema for project activity with optional project relation
 */
export const ProjectActivityWithRelationsSchema = createSelectSchema(
	projectActivitiesTable,
).extend({
	project: createSelectSchema(projectsTable).optional(),
});
