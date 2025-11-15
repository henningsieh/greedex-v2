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
      const year = date.getFullYear();
      return year >= 1900 && year <= 2100;
    }, "Start date must be between 1900 and 2100"),
  endDate: (schema) =>
    schema.refine((date) => {
      const year = date.getFullYear();
      return year >= 1900 && year <= 2100;
    }, "End date must be between 1900 and 2100"),
});

// Form schema (only user-provided fields)
export const ProjectFormSchema = ProjectInsertSchema.omit({
  id: true,
  responsibleUserId: true,
  createdAt: true,
  updatedAt: true,
});

export type ProjectFormSchemaType = z.infer<typeof ProjectFormSchema>;
