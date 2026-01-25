import { member, user } from "@greendex/database/schema";

/**
 * Organization Configuration
 * Single source of truth for organization roles and member sorting
 */

/**
 * Type-safe sort fields inferred from Drizzle database schema
 * Only allows actual database fields from member and user tables
 */
type MemberColumns = keyof typeof member.$inferSelect;
type UserColumns = keyof typeof user.$inferSelect;
type MemberSortField = MemberColumns | `user.${UserColumns}`;

/**
 * Valid sort fields for member search operations
 * Type-safe: Only allows actual database fields from member and user tables
 *
 * Direct member fields: "createdAt", "role"
 * Related user fields: "user.name", "user.email"
 */
export const MEMBER_SORT_FIELDS = [
  "createdAt", // member.createdAt
  "role", // member.role
  "user.name", // user.name (via userId relation)
  "user.email", // user.email (via userId relation)
] as const satisfies readonly MemberSortField[];
