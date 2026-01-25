import type { MEMBER_SORT_FIELDS } from "@greendex/config/organizations";

/**
 * Organization member role definitions
 * Maps display names to database role values
 */
export const MEMBER_ROLES = {
  Owner: "owner", // Full access, can invite Employees/Admins
  Employee: "admin", // Team members with admin privileges
  Participant: "member", // Project participants
} as const;

/**
 * Type for member role values
 */
export type MemberRole = (typeof MEMBER_ROLES)[keyof typeof MEMBER_ROLES];

/**
 * Type for member sort field values - inferred from database schema
 */
export type MemberSortField = (typeof MEMBER_SORT_FIELDS)[number];
