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
import { EU_COUNTRY_CODES } from "@/lib/i18n/country-i18n";
import { validateDistanceStep } from "@/lib/utils/distance-utils";

// Common form field extensions with custom error messages
const projectFormExtensions = {
  country: z.enum(EU_COUNTRY_CODES, {
    message: "Please select a valid EU country",
  }),
  name: z.string().min(1, "Name is required"),
  startDate: z.date({ message: "Please select a valid start date" }),
  endDate: z.date({ message: "Please select a valid end date" }),
};

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

// Activity-related schemas (moved here to break circular dependency)
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

// Combined form schema with activities
export const EditProjectWithActivitiesSchema = ProjectUpdateFormSchema.extend({
  activities: z.array(EditActivityFormItemSchema).optional(),
});

// Schema for creating activities from forms/client (omits userId, server provides it from context)
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

// Schema for updating activities from client (omits userId, cannot be changed)
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

export const ActivityFormItemSchema = CreateActivityInputSchema.omit({
  projectId: true,
});

// Combined form schema with optional activities
export const CreateProjectWithActivitiesSchema = ProjectCreateFormSchema.extend({
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

// Schema for Project with Activities included
export const ProjectWithActivitiesSchema = createSelectSchema(
  projectsTable,
).extend({
  responsibleUser: createSelectSchema(user),
  organization: createSelectSchema(organization),
  // Ensure `country` is properly typed as enum
  country: z.enum(EU_COUNTRY_CODES),
  activities: z.array(ProjectActivityWithRelationsSchema),
});
