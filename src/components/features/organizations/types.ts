import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { organization } from "@/lib/drizzle/schema";

export type OrganizationType = InferSelectModel<typeof organization>;
export type InsertOrganizationType = InferInsertModel<typeof organization>;

export const organizationRoles = {
  Owner: "owner",
  Admin: "admin",
  Member: "member",
} as const;
export type OrganizationRole =
  (typeof organizationRoles)[keyof typeof organizationRoles];

// Re-export ProjectPermission type for convenience
import type { ProjectPermission } from "@/lib/better-auth/permissions";
export type { ProjectPermission };
