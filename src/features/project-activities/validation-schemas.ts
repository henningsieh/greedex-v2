import type { useTranslations } from "next-intl";
import type { getTranslations } from "next-intl/server";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { createDistanceSchema } from "@/features/project-activities/utils";
import { projectActivitiesTable, projectsTable } from "@/lib/drizzle/schema";

// ============================================================================
// UNIFIED TRANSLATION TYPE
// ============================================================================

/**
 * Unified translation function type that works for both client and server
 * Accepts return types from both useTranslations() and getTranslations()
 */
type TranslateFn =
  | ReturnType<typeof useTranslations>
  | Awaited<ReturnType<typeof getTranslations>>;

// ============================================================================
// UNIFIED SCHEMA FACTORIES (work for both client and server)
// ============================================================================

/**
 * Create schema for creating activities with translated validation messages
 *
 * Works for both client-side (useTranslations) and server-side (getTranslations)
 * Omits auto-generated fields (id, timestamps)
 *
 * @param t - Translation function (from useTranslations() or await getTranslations())
 * @returns Zod schema for creating activities with i18n validation
 *
 * @example Client-side
 * const t = useTranslations("project.activities");
 * const schema = activityInputSchema(t);
 *
 * @example Server-side
 * const t = await getTranslations("project.activities");
 * const schema = activityInputSchema(t);
 */
export function activityInputSchema(t: TranslateFn) {
  return createInsertSchema(projectActivitiesTable)
    .omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    })
    .extend({
      distanceKm: createDistanceSchema(t),
    })
    .required({ distanceKm: true });
}

/**
 * Create schema for updating activities with translated validation messages
 *
 * Works for both client-side (useTranslations) and server-side (getTranslations)
 * Cannot change projectId or id
 *
 * @param t - Translation function (from useTranslations() or await getTranslations())
 * @returns Zod schema for updating activities with i18n validation
 *
 * @example Client-side
 * const t = useTranslations("project.activities");
 * const schema = activityUpdateSchema(t);
 *
 * @example Server-side
 * const t = await getTranslations("project.activities");
 * const schema = activityUpdateSchema(t);
 */
export function activityUpdateSchema(t: TranslateFn) {
  return createUpdateSchema(projectActivitiesTable)
    .omit({
      id: true,
      projectId: true, // Cannot change which project the activity belongs to
      createdAt: true,
      updatedAt: true,
    })
    .extend({
      distanceKm: createDistanceSchema(t), // required (NOT NULL in DB)
    });
}

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
