import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { useTranslations } from "next-intl";
import { z } from "zod";

import { createDistanceSchema } from "@/features/project-activities/utils";
import { projectActivitiesTable, projectsTable } from "@/lib/drizzle/schema";

// ============================================================================
// ACTIVITY FORM SCHEMAS
// ============================================================================

/**
 * Schema for creating activities from forms/client
 * Omits auto-generated fields (id, timestamps)
 * 
 * @param t - Translation function from useTranslations() hook
 * @returns Zod schema for creating activities
 */
export function createActivityInputSchema(
  t: ReturnType<typeof useTranslations>,
) {
  return createInsertSchema(projectActivitiesTable)
    .omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    })
    .extend({
      distanceKm: createDistanceSchema(t),
    });
}

/**
 * Schema for updating activities from client
 * Cannot change projectId or id
 * 
 * @param t - Translation function from useTranslations() hook
 * @returns Zod schema for updating activities
 */
export function createUpdateActivityInputSchema(
  t: ReturnType<typeof useTranslations>,
) {
  return createUpdateSchema(projectActivitiesTable)
    .omit({
      id: true,
      projectId: true, // Cannot change which project the activity belongs to
      createdAt: true,
      updatedAt: true,
    })
    .extend({
      distanceKm: createDistanceSchema(t, true), // optional for updates
    });
}

/**
 * Edit activity form item schema (includes id for existing activities)
 * 
 * @param t - Translation function from useTranslations() hook
 * @returns Zod schema for editing activities in forms
 */
export function createEditActivityFormItemSchema(
  t: ReturnType<typeof useTranslations>,
) {
  return createUpdateSchema(projectActivitiesTable)
    .omit({
      createdAt: true,
      updatedAt: true,
    })
    .extend({
      id: z.string(), // Required for existing activities to identify them
      projectId: z.string(), // Required for activities
      distanceKm: createDistanceSchema(t),
      isNew: z.boolean().optional(), // Track if activity is new
      isDeleted: z.boolean().optional(), // Track if activity should be deleted
    });
}

// ============================================================================
// STATIC SCHEMAS (for server-side/procedures without i18n)
// ============================================================================

/**
 * Static schema for creating activities (server-side, no i18n)
 * Used in oRPC procedures and server-side validation
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
    distanceKm: z.number(),
  });

/**
 * Static schema for updating activities (server-side, no i18n)
 * Used in oRPC procedures and server-side validation
 */
export const UpdateActivityInputSchema = createUpdateSchema(
  projectActivitiesTable,
)
  .omit({
    id: true,
    projectId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    distanceKm: z.number().optional(),
  });

/**
 * Activity form item schema (without projectId, used in project forms)
 */
export const ActivityFormItemSchema = CreateActivityInputSchema.omit({
  projectId: true,
});

/**
 * Static edit activity form item schema (server-side, no i18n)
 */
export const EditActivityFormItemSchema = createUpdateSchema(
  projectActivitiesTable,
)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string(),
    projectId: z.string(),
    distanceKm: z.number(),
    isNew: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
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
  project: createSelectSchema(projectsTable),
});
