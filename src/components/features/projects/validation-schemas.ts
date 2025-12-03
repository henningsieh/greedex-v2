import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import {
  organization,
  projectActivitiesTable,
  projectsTable,
  user,
} from "@/lib/drizzle/schema";

// Form schema (only user-provided fields)
export const ProjectFormSchema = createInsertSchema(projectsTable).omit({
  id: true,
  responsibleUserId: true,
  createdAt: true,
  updatedAt: true,
});

export const ProjectWithRelationsSchema = createSelectSchema(
  projectsTable,
).extend({
  responsibleUser: createSelectSchema(user),
  organization: createSelectSchema(organization),
});

export const ProjectUpdateFormSchema = createUpdateSchema(projectsTable).omit({
  id: true,
  responsibleUserId: true,
  createdAt: true,
  updatedAt: true,
});

// Activity-related schemas (moved here to break circular dependency)
export const EditActivityFormItemSchema = createUpdateSchema(
  projectActivitiesTable,
)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    distanceKm: z.number().min(0, "Distance must be positive"),
    isNew: z.boolean().optional(), // Track if activity is new
    isDeleted: z.boolean().optional(), // Track if activity should be deleted
  });

// Combined form schema with activities
export const EditProjectWithActivitiesSchema = ProjectUpdateFormSchema.extend({
  activities: z.array(EditActivityFormItemSchema).optional(),
});
