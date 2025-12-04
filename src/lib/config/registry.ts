// Central configuration registry
// Re-export commonly used constants and provide application-wide configuration

export * from "@/lib/i18n/locales"; // locales & helpers
export * from "./app"; // app routes and helpers

// Projects: expose sorting fields and defaults in one place
export const PROJECT_SORT_FIELDS = {
  name: "name",
  startDate: "startDate",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

export type ProjectSortField =
  (typeof PROJECT_SORT_FIELDS)[keyof typeof PROJECT_SORT_FIELDS];

export const DEFAULT_PROJECT_SORTING_FIELD: ProjectSortField =
  PROJECT_SORT_FIELDS.startDate;
