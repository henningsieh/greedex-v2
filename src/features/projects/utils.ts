import { asc, desc, type SQL, sql } from "drizzle-orm";
import React from "react";
import type z from "zod";
import { type AppRoute, PROJECT_DETAIL_PATH } from "@/app/routes";
import { PROJECT_ACTIVITIES_ICONS } from "@/components/features/project-activities/activities-icons";
import { DEFAULT_PROJECT_SORT, MILLISECONDS_PER_DAY } from "@/config/projects";
import type { ProjectActivityType } from "@/features/project-activities/types";
import type {
  ListProjectsInput,
  ProjectSortField,
  ProjectType,
} from "@/features/projects/types";
import type { ProjectSortFieldSchema } from "@/features/projects/validation-schemas";
import { projectsTable } from "@/lib/drizzle/schema";
import { orpc } from "@/lib/orpc/orpc";

/**
 * Get the project detail path for a given project ID
 * @param projectId
 * @returns The project detail path with the project ID inserted
 */
export const getProjectDetailPath = (projectId: string): AppRoute =>
  PROJECT_DETAIL_PATH.replace("[id]", projectId) as AppRoute;

/**
 * Convert project default sort to TanStack SortingState
 */
export function getProjectsDefaultSorting() {
  return [
    {
      id: DEFAULT_PROJECT_SORT.column as ProjectSortField,
      desc: DEFAULT_PROJECT_SORT.order === "desc",
    },
  ];
}

/**
 * Retrieves project data and associated activities for the given project ID.
 *
 * @param projectId - The project's unique identifier
 * @returns The project data including its activities, or `null` if fetching fails
 */
export async function getProjectData(projectId: string) {
  try {
    return await orpc.projects.getForParticipation({ id: projectId });
  } catch (error) {
    console.error("Failed to fetch project data:", error);
    return null;
  }
}

/**
 * Render a consistent activity icon for any activity type.
 *
 * @param type - The activity type
 * @returns The JSX element for the activity icon.
 */
export function getProjectActivityIcon(
  type: keyof typeof PROJECT_ACTIVITIES_ICONS,
): React.ReactElement {
  const Icon = PROJECT_ACTIVITIES_ICONS[type];
  return React.createElement(Icon, { className: "h-4 w-4" });
}

/**
 * Get the display name for a project sort field/column
 *
 * @param columnId The project sort field/column ID
 * @param t Translation function
 * @returns The display name for the column
 */
export function getColumnDisplayName(
  columnId: ProjectSortField | string,
  t: (key: string) => string,
): string {
  switch (columnId) {
    case "name":
      return t("table.name");
    case "location":
      return t("table.country");
    case "startDate":
      return t("table.start-date");
    case "createdAt":
      return t("table.created");
    case "updatedAt":
      return t("table.updated");
    default:
      return columnId;
  }
}

/**
 * Create a comparator for sorting projects by a given field and direction.
 *
 * Handles null/undefined values (pushed to the end) and supports Date and string comparison.
 */
function compareProjectFieldValues(
  aValue: unknown,
  bValue: unknown,
  sortDesc: boolean,
) {
  if (aValue instanceof Date && bValue instanceof Date) {
    const diff = aValue.getTime() - bValue.getTime();
    return sortDesc ? -diff : diff;
  }

  if (typeof aValue === "string" && typeof bValue === "string") {
    const res = aValue.localeCompare(bValue);
    return sortDesc ? -res : res;
  }

  const res = String(aValue).localeCompare(String(bValue));
  return sortDesc ? -res : res;
}

export function createProjectComparator(
  sortBy: ProjectSortField,
  sortDesc: boolean,
) {
  return (a: ProjectType, b: ProjectType) => {
    const aValue = a[sortBy as keyof ProjectType];
    const bValue = b[sortBy as keyof ProjectType];

    // Handle null/undefined - push them to the end
    if (aValue == null && bValue == null) {
      return 0;
    }
    if (aValue == null) {
      return sortDesc ? -1 : 1;
    }
    if (bValue == null) {
      return sortDesc ? 1 : -1;
    }

    return compareProjectFieldValues(aValue, bValue, sortDesc);
  };
}

/**
 * @param startDate The start date of the project
 * @param endDate The end date of the project
 * @returns The duration of the project in days
 */
export const calculateProjectDuration = (
  startDate: string | Date,
  endDate: string | Date,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid start date provided");
  }
  if (Number.isNaN(end.getTime())) {
    throw new Error("Invalid end date provided");
  }
  if (end.getTime() < start.getTime()) {
    throw new Error("End date must be after or equal to start date");
  }

  return Math.floor((end.getTime() - start.getTime()) / MILLISECONDS_PER_DAY);
};

/**
 * CO₂ emission factors in kilograms per kilometer for various transport modes.
 */
export const CO2_FACTORS = {
  car: 0.192,
  boat: 0.115,
  bus: 0.089,
  train: 0.041,
  // Reserved for participant questionnaire calculations:
  plane: 0.255,
  electricCar: 0.053,
} as const;

/**
 * Type for valid activity types that can be used in CO2 calculations.
 */
type ValidActivityType = keyof typeof CO2_FACTORS;

/**
 * Check if an activity type has a known CO2 factor.
 *
 * @param activityType - The activity type to check
 * @returns true if the activity type has a known CO2 factor
 */
function hasValidCO2Factor(
  activityType: string,
): activityType is ValidActivityType {
  return activityType in CO2_FACTORS;
}

/**
 * Calculate CO₂ emissions for a single activity.
 *
 * @param activityType - Type of transport activity
 * @param distanceKm - Distance traveled in kilometers
 * @returns CO₂ emissions in kilograms, or 0 if invalid
 */
function calculateSingleActivityCO2(
  activityType: string,
  distanceKm: number,
): number {
  // Validate distance
  if (Number.isNaN(distanceKm) || distanceKm <= 0) {
    return 0;
  }

  // Check if activity type has a known CO2 factor
  if (!hasValidCO2Factor(activityType)) {
    console.error(`Unknown activity type: ${activityType}`);
    return 0;
  }

  // Calculate emissions based on activity type
  return distanceKm * CO2_FACTORS[activityType];
}

/**
 * Compute total CO₂ emissions for a list of transport activities.
 *
 * Ignores activities whose `distanceKm` is not a positive number and skips activity types without known CO2 factors.
 *
 * @param activities - Array of activities containing `activityType` and `distanceKm` (kilometers)
 * @returns Total CO₂ emissions in kilograms
 */
export function calculateActivitiesCO2(
  activities: ProjectActivityType[],
): number {
  if (!activities || activities.length === 0) {
    return 0;
  }

  return activities.reduce((total, activity) => {
    const distanceKm = Number(activity.distanceKm);
    const emissions = calculateSingleActivityCO2(
      activity.activityType,
      distanceKm,
    );
    return total + emissions;
  }, 0);
}

/**
 *
 * @param input - Input type for listing projects procedure
 * @returns Whether the sort order should be descending
 */
export function computeSortDesc(input: ListProjectsInput) {
  // If no explicit sort field was requested, use the configured default
  if (input?.sort_by === undefined) {
    return DEFAULT_PROJECT_SORT.order === "desc";
  }

  // If the client requested the default column, apply the default direction
  return input.sort_by === DEFAULT_PROJECT_SORT.column
    ? DEFAULT_PROJECT_SORT.order === "desc"
    : false;
}

/**
 *
 * @param sortField - The project sort field/column
 * @param sortDesc - Whether the sort order is descending
 * @returns
 */
export function orderByClauseFor(
  sortField: z.infer<typeof ProjectSortFieldSchema>,
  sortDesc: boolean,
): SQL<unknown> {
  switch (sortField) {
    case "name":
      return sortDesc
        ? desc(sql`lower(${projectsTable.name})`)
        : asc(sql`lower(${projectsTable.name})`);
    case "startDate":
      return sortDesc
        ? desc(projectsTable.startDate)
        : asc(projectsTable.startDate);
    case "createdAt":
      return sortDesc
        ? desc(projectsTable.createdAt)
        : asc(projectsTable.createdAt);
    case "updatedAt":
      return sortDesc
        ? desc(projectsTable.updatedAt)
        : asc(projectsTable.updatedAt);
    default:
      return DEFAULT_PROJECT_SORT.order === "desc"
        ? desc(projectsTable.startDate)
        : asc(projectsTable.startDate);
  }
}
