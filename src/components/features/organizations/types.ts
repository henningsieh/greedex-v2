import type { Organization as OrganizationType } from "better-auth/plugins";

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
// SORTING - Types
// ============================================================================

/**
 * Valid sort fields for member search operations
 */
export const validSortFields = ["createdAt", "user.name", "email"] as const;

/**
 * Type for valid sort fields
 */
export type SortField = (typeof validSortFields)[number];

// ============================================================================
// ORGANIZATION - Types
// ============================================================================

export type MemberRole = (typeof memberRoles)[keyof typeof memberRoles];
export type Organization = OrganizationType;
// export type InsertOrganizationType = InferInsertModel<typeof organizationTable>;
