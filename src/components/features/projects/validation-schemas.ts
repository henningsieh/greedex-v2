import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import {
  DISTANCE_KM_STEP,
  MIN_DISTANCE_KM,
} from "@/components/features/projects/types";
import {
  organization,
  projectActivitiesTable,
  projectsTable,
  user,
} from "@/lib/drizzle/schema";
import { validateDistanceStep } from "@/lib/utils/distance-utils";

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

// Combined form schema with activities
export const EditProjectWithActivitiesSchema = ProjectUpdateFormSchema.extend({
  activities: z.array(EditActivityFormItemSchema).optional(),
});

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
    distanceKm: z
      .number()
      .min(MIN_DISTANCE_KM, `Distance must be at least ${MIN_DISTANCE_KM} km`)
      .refine(
        validateDistanceStep,
        `Distance must be in increments of ${DISTANCE_KM_STEP} km`,
      ),
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
