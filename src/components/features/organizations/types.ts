import type { Organization as OrganizationType } from "better-auth/plugins";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  member as memberTable,
  organization as organizationTable,
  user as userTable,
} from "@/lib/drizzle/schema";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Organization role definitions
 * Must be defined before schemas that reference them
 */
export const memberRoles = {
  Owner: "owner", // Full access, can invite Employees/Admins
  Employee: "admin", // Team members with admin privileges
  Participant: "member", // Project participants
} as const;

// ============================================================================
// ORGANIZATION - Types
// ============================================================================

export type MemberRole = (typeof memberRoles)[keyof typeof memberRoles];
export type Organization = OrganizationType;
// export type InsertOrganizationType = InferInsertModel<typeof organizationTable>;
export type OrganizationFormSchema = z.infer<typeof OrganizationFormSchema>;

// ============================================================================
// ORGANIZATION - Schemas
// ============================================================================

/**
 * Base select schema for organizations from database
 */
// export const OrganizationSelectSchema = createSelectSchema(organizationTable);

/**
 * Insert schema with validation rules
 */
const OrganizationInsertSchema = createInsertSchema(organizationTable, {
  name: (schema) => schema.min(1, "Organization name is required"),
  slug: (schema) => schema.min(1, "Organization slug is required"),
});

/**
 * Form schema - omits auto-generated and system fields
 */
export const OrganizationFormSchema = OrganizationInsertSchema.omit({
  id: true,
  slug: true,
  logo: true,
  metadata: true,
  createdAt: true,
});

// ============================================================================
// USER - Schemas
// ============================================================================

/**
 * Base select schema for users from database
 */
export const UserSelectSchema = createSelectSchema(userTable);

// ============================================================================
// MEMBER - Types
// ============================================================================

// export type MemberType = Member;
// export type InsertMemberType = InferInsertModel<typeof memberTable>;
// export type MemberFormSchemaType = z.infer<typeof MemberFormSchema>;
// export type MemberWithUserType = z.infer<typeof MemberWithUserSchema>;

// ============================================================================
// MEMBER - Schemas
// ============================================================================

/**
 * Base select schema for members from database
 */
export const MemberSelectSchema = createSelectSchema(memberTable);

/**
 * Extended member schema with associated user data
 * Omits sensitive and unnecessary fields from user object
 */
export const MemberWithUserSchema = MemberSelectSchema.extend({
  user: UserSelectSchema.omit({
    emailVerified: true,
    createdAt: true,
    updatedAt: true,
  }).extend({
    image: z.string().optional(),
  }),
});

// Export a TypeScript type for members with user data inferred from the Zod schema
export type MemberWithUser = z.infer<typeof MemberWithUserSchema>;

/**
 * Insert schema with validation rules
 * Validates role against organizationRoles constant
 */
const MemberInsertSchema = createInsertSchema(memberTable, {
  organizationId: (schema) =>
    schema.min(1, "Organization ID is required for member"),
  userId: (schema) => schema.min(1, "User ID is required for member"),
  role: (schema) =>
    schema
      .min(1, "Member role is required")
      .refine(
        (val) =>
          Object.values(memberRoles).includes(
            val as (typeof memberRoles)[keyof typeof memberRoles],
          ),
        {
          message: `Member role must be one of: ${Object.values(memberRoles).join(", ")}`,
        },
      ),
});

/**
 * Form schema - omits auto-generated fields
 */
export const MemberFormSchema = MemberInsertSchema.omit({
  id: true,
  createdAt: true,
});
