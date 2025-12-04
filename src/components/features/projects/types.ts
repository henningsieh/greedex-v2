import type { InferSelectModel } from "drizzle-orm";
import {
  DEFAULT_PROJECT_SORTING_FIELD as REGISTRY_DEFAULT_PROJECT_SORTING_FIELD,
  PROJECT_SORT_FIELDS as REGISTRY_PROJECT_SORT_FIELDS,
} from "@/lib/config/registry";
import type { projectsTable } from "@/lib/drizzle/schema";

export type ProjectType = InferSelectModel<typeof projectsTable>;

// Sort options for projects (re-exported from central registry)
export const PROJECT_SORT_FIELDS = REGISTRY_PROJECT_SORT_FIELDS;

export type ProjectSortField =
  (typeof PROJECT_SORT_FIELDS)[keyof typeof PROJECT_SORT_FIELDS];

// Default sort option (re-exported from central registry)
export const DEFAULT_PROJECT_SORTING_FIELD: ProjectSortField =
  REGISTRY_DEFAULT_PROJECT_SORTING_FIELD;
