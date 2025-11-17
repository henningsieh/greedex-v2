// src/components/features/projects/types.ts:

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { projectTable } from "@/lib/drizzle/schema";

export type ProjectType = InferSelectModel<typeof projectTable>;
export type InsertProjectType = InferInsertModel<typeof projectTable>;

export const ProjectSelectSchema = createSelectSchema(projectTable);

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
