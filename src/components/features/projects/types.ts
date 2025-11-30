// src/components/features/projects/types.ts:

import type { InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projectActivity, projectTable } from "@/lib/drizzle/schema";
import { organization, user } from "@/lib/drizzle/schemas/auth-schema";

export type ProjectType = InferSelectModel<typeof projectTable>;
// export type InsertProjectType = InferInsertModel<typeof projectTable>;

const ProjectSelectSchema = createSelectSchema(projectTable);

// Schema for project with responsible user included
export const ProjectWithRelationsSchema = ProjectSelectSchema.extend({
  responsibleUser: createSelectSchema(user),
  organization: createSelectSchema(organization),
});

// Inferred type from the schema
export type ProjectWithRelations = z.infer<typeof ProjectWithRelationsSchema>;

// Full insert schema (includes all DB fields) with refinements
const ProjectInsertSchema = createInsertSchema(projectTable, {
  name: (schema) => schema.min(1, "Project name is required"),
  country: (schema) => schema.min(1, "Country is required"),
  organizationId: (schema) => schema.min(1, "Organization is required"),
  startDate: (schema) =>
    schema.refine((date) => {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return false;
      }
      // Ensure date has valid day, month, year (not just a timestamp)
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      return (
        day >= 1 &&
        day <= 31 &&
        month >= 0 &&
        month <= 11 &&
        year >= 1900 &&
        year <= 2100
      );
    }, "Start date must be a valid date between 1900 and 2100"),
  endDate: (schema) =>
    schema.refine((date) => {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return false;
      }
      // Ensure date has valid day, month, year (not just a timestamp)
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      return (
        day >= 1 &&
        day <= 31 &&
        month >= 0 &&
        month <= 11 &&
        year >= 1900 &&
        year <= 2100
      );
    }, "End date must be a valid date between 1900 and 2100"),
});

// Form schema (only user-provided fields)
export const ProjectFormSchema = ProjectInsertSchema.omit({
  id: true,
  responsibleUserId: true,
  createdAt: true,
  updatedAt: true,
});

export type ProjectFormSchemaType = z.infer<typeof ProjectFormSchema>;

// Sort options for projects
export const SORT_OPTIONS = {
  name: "name",
  startDate: "startDate",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

// Default sort option
export const DEFAULT_PROJECT_SORT: SortOption = SORT_OPTIONS.createdAt;

// Define activity types as a const array (single source of truth)
export const activityTypeValues = ["boat", "bus", "train", "car"] as const;
export type ActivityType = (typeof activityTypeValues)[number];

// ============================================================================
// PROJECT ACTIVITY TYPES & SCHEMAS
// ============================================================================

// Type inferred from DB schema
export type ProjectActivityType = InferSelectModel<typeof projectActivity>;

// Select schema for ProjectActivity
const ProjectActivitySelectSchema = createSelectSchema(projectActivity);

// Schema for project activity with project relation included
export const ProjectActivityWithRelationsSchema =
  ProjectActivitySelectSchema.extend({
    project: ProjectSelectSchema.optional(),
  });

// Inferred type from schema
export type ProjectActivityWithRelations = z.infer<
  typeof ProjectActivityWithRelationsSchema
>;

// Insert schema for ProjectActivity with refinements
const ProjectActivityInsertSchema = createInsertSchema(projectActivity, {
  activityType: (schema) =>
    schema.refine((val) => activityTypeValues.includes(val as ActivityType), {
      message: "Activity type must be one of: boat, bus, train, car",
    }),
  distanceKm: (schema) =>
    schema.refine(
      (val) => {
        const num = Number.parseFloat(String(val));
        return !Number.isNaN(num) && num >= 0;
      },
      { message: "Distance must be a positive number" },
    ),
});

// Form schema for ProjectActivity (only user-provided fields)
export const ProjectActivityFormSchema = ProjectActivityInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProjectActivityFormSchemaType = z.infer<
  typeof ProjectActivityFormSchema
>;

// Array schema for multiple activities
export const ProjectActivitiesArraySchema = z.array(
  ProjectActivityWithRelationsSchema,
);
