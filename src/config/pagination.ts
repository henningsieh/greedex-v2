/**
 * Pagination Configuration
 * Single source of truth for all pagination-related settings
 */

/**
 * Default page size for tables and lists
 * Used across ProjectsTable, UsersTable, MembersTable, and other paginated components
 */
export const DEFAULT_PAGE_SIZE = 5;

/**
 * Available page size options for pagination controls
 */
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;

/**
 * Type for available page size options
 * Used in ProjectsTable and other paginated components for type safety
 */
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
