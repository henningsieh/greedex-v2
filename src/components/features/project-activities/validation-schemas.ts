import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { ProjectFormSchema } from "@/components/features/projects/validation-schemas";
import { projectActivitiesTable, projectsTable } from "@/lib/drizzle/schema";

// Form schema for ProjectActivity with proper number handling for distanceKm
export const ProjectActivityFormSchema = createInsertSchema(
  projectActivitiesTable,
)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    distanceKm: z.number().min(0, "Distance must be positive"),
  });

export const ActivityFormItemSchema = ProjectActivityFormSchema.omit({
  projectId: true,
});

// Combined form schema with optional activities
export const CreateProjectWithActivitiesSchema = ProjectFormSchema.extend({
  activities: z.array(ActivityFormItemSchema).optional(),
});

export type CreateProjectWithActivities = z.infer<
  typeof CreateProjectWithActivitiesSchema
>;

export const ProjectActivityWithRelationsSchema = createSelectSchema(
  projectActivitiesTable,
).extend({
  project: createSelectSchema(projectsTable).optional(),
});
