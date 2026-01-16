import { EU_COUNTRY_CODES } from "@/config/eu-countries";
import {
  ActivityFormItemSchema,
  EditActivityFormItemSchema,
  ProjectActivityWithRelationsSchema,
} from "@/features/project-activities/validation-schemas";
import { organization, projectsTable, user } from "@/lib/drizzle/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

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

// Form schema (only user-provided fields)
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
 */
export const EditProjectWithActivitiesSchema = ProjectUpdateFormSchema.extend({
  activities: z.array(EditActivityFormItemSchema).optional(),
});

/**
 * Combined form schema with optional activities for creating projects
 */
export const CreateProjectWithActivitiesSchema = ProjectCreateFormSchema.extend({
  activities: z.array(ActivityFormItemSchema).optional(),
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
