import { EU_COUNTRY_CODES } from "@greendex/config/eu-countries";
import {
  organization,
  projectActivitiesTable,
  projectsTable,
  user,
} from "@greendex/database/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { ProjectActivityWithRelationsSchema } from "@/features/project-activities/validation-schemas";

import { PROJECT_SORT_FIELDS } from "./types";

// Common form field extensions with custom error messages
const projectFormExtensions = {
  country: z.enum(EU_COUNTRY_CODES, {
    error: "Please select a valid EU country",
  }),
  name: z.string().min(1, { error: "Name is required" }),
  startDate: z.date({ error: "Please select a valid start date" }),
  endDate: z.date({ error: "Please select a valid end date" }),
};

export const ProjectSortFieldSchema = z.enum(PROJECT_SORT_FIELDS);

/**
 * Schema for creating a new project (only user-provided fields).
 *
 * This schema is derived from `projectsTable` via `createInsertSchema` and
 * customized to represent the payload that can be submitted by users when
 * creating a project.
 *
 * Key details:
 * - Omits database-managed fields: `id`, `responsibleUserId`, `createdAt`, and `updatedAt`.
 * - Extends with `projectFormExtensions`, which enforces:
 *   - `country`: enum of EU country codes (with a custom error message)
 *   - `name`: required non-empty string
 *   - `startDate` / `endDate`: `Date` values with validation messages
 *
 * Usage:
 * - Use this schema to validate create-request payloads from forms or APIs.
 * - If you need to accept activities at creation time, use
 *   `CreateProjectWithActivitiesSchema` which extends this schema with
 *   an optional `activities` array.
 *
 * Note: `responsibleUserId` is intentionally omitted because it should be
 * populated server-side (e.g., based on the authenticated user creating the
 * project).
 */
export const ProjectCreateFormSchema = createInsertSchema(projectsTable)
  .omit({
    id: true,
    responsibleUserId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend(projectFormExtensions);

export const ProjectWithRelationsSchema = createSelectSchema(
  projectsTable,
).extend({
  responsibleUser: createSelectSchema(user),
  organization: createSelectSchema(organization),
  country: z.enum(EU_COUNTRY_CODES),
});

/**
 * Schema for updating an existing project (partial user-provided fields).
 *
 * Built from `projectsTable` via `createUpdateSchema` and tailored for
 * edit/update payloads. This schema:
 *
 * - Omits database-managed fields: `id`, `responsibleUserId`, `createdAt`, and `updatedAt`.
 * - Extends with `projectFormExtensions` so that `name`, `startDate`, and
 *   `endDate` keep their validation rules, but fields may be omitted when
 *   performing partial updates.
 * - Explicitly makes `country` optional to allow updates that don't change the
 *   country value.
 *
 * Usage:
 * - Use this schema to validate update/edit request payloads from forms or APIs.
 * - For editing a project together with activities, use
 *   `EditProjectWithActivitiesSchema` which extends this schema with an
 *   optional `activities` array.
 *
 * Note: `responsibleUserId` is intentionally omitted because it should be
 * managed server-side and not provided by the client during updates.
 */
export const ProjectUpdateFormSchema = createUpdateSchema(projectsTable)
  .omit({
    id: true,
    responsibleUserId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    ...projectFormExtensions,
    country: projectFormExtensions.country.optional(),
  });

// ============================================================================
// COMBINED SCHEMAS WITH ACTIVITIES
// ============================================================================

/**
 * Combined form schema with activities for editing projects
 *
 * Activities use inline base schema with batch operation flags (no i18n needed)
 */
export const EditProjectWithActivitiesSchema = ProjectUpdateFormSchema.extend({
  activities: z
    .array(
      createUpdateSchema(projectActivitiesTable)
        .omit({
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          id: z.string(),
          projectId: z.string(),
          isNew: z.boolean().optional(),
          isDeleted: z.boolean().optional(),
        }),
    )
    .optional(),
});

/**
 * Combined form schema with optional activities for creating projects
 *
 * Activities use inline base schema for batch operations (no i18n needed)
 */
export const CreateProjectWithActivitiesSchema = ProjectCreateFormSchema.extend({
  activities: z
    .array(
      createInsertSchema(projectActivitiesTable).omit({
        id: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .optional(),
});

export type CreateProjectWithActivities = z.infer<
  typeof CreateProjectWithActivitiesSchema
>;

/**
 * Schema for Project with Activities included
 */
export const ProjectWithActivitiesSchema = createSelectSchema(
  projectsTable,
).extend({
  responsibleUser: createSelectSchema(user),
  organization: createSelectSchema(organization),
  // Ensure `country` is properly typed as enum
  country: z.enum(EU_COUNTRY_CODES),
  activities: z.array(ProjectActivityWithRelationsSchema),
});
