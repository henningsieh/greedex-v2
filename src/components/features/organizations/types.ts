import type { Organization } from "better-auth/plugins";
import type { InferInsertModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type z from "zod";
import { organization as organizationTable } from "@/lib/drizzle/schema";

// export type OrganizationType = InferSelectModel<typeof organizationTable>;
// Types of property 'logo' are incompatible.        Type 'string | null | undefined' is not assignable to type 'string | null'.
export type OrganizationType = Organization;
export type InsertOrganizationType = InferInsertModel<typeof organizationTable>;

export const OrganizationSelectSchema = createSelectSchema(organizationTable);

const OrganizationInsertSchema = createInsertSchema(organizationTable, {
  name: (schema) => schema.min(1, "Organization name is required"),
  slug: (schema) => schema.min(1, "Organization slug is required"),
});

export const OrganizationFormSchema = OrganizationInsertSchema.omit({
  id: true,
  slug: true,
  logo: true,
  metadata: true,
  createdAt: true,
});

export type OrganizationFormSchemaType = z.infer<typeof OrganizationFormSchema>;

export const organizationRoles = {
  Owner: "owner",
  Employee: "admin",
  Participant: "member",
} as const;

export type OrganizationRole =
  (typeof organizationRoles)[keyof typeof organizationRoles];

// Re-export ProjectPermission type for convenience
import type { ProjectPermission } from "@/lib/better-auth/permissions";
export type { ProjectPermission };
