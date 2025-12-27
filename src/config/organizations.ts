/**
 * Organization Configuration
 * Single source of truth for organization roles and member sorting
 */

// ============================================================================
// MEMBER SORTING
// ============================================================================

/**
 * Valid sort fields for member search operations
 */
export const MEMBER_SORT_FIELDS = ["createdAt", "user.name", "email"] as const;
