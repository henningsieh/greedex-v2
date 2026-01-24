import type z from "zod";

import { asc, desc, type SQL, sql } from "drizzle-orm";
import React from "react";

import type { ProjectActivityType } from "@/features/project-activities/types";
import type {
  ListProjectsInput,
  ProjectSortField,
  ProjectStatistics,
  ProjectType,
} from "@/features/projects/types";
import type { ProjectSortFieldSchema } from "@/features/projects/validation-schemas";

import { type AppRoute, PROJECT_DETAIL_PATH } from "@/app/routes";
import { DEFAULT_PROJECT_SORT, MILLISECONDS_PER_DAY } from "@/config/projects";
import { PROJECT_ACTIVITIES_ICONS } from "@/features/project-activities/activities-icons";
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
 * Produce the default sorting configuration used for project lists.
 *
 * @returns An array with a single sort criterion: `id` is the default sort column and `desc` is `true` when the default order is `"desc"`, `false` otherwise.
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
 * Render the icon for a given project activity type with consistent sizing.
 *
 * @param type - The activity type key from PROJECT_ACTIVITIES_ICONS
 * @returns A React element that renders the corresponding activity icon (styled with consistent size)
 */
export function getProjectActivityIcon(
  type: keyof typeof PROJECT_ACTIVITIES_ICONS,
): React.ReactElement {
  const Icon = PROJECT_ACTIVITIES_ICONS[type];
  return React.createElement(Icon, { className: "size-4" });
}

/**
 * Return the localized display name for a project sort field or column.
 *
 * @param columnId - The project sort field or column identifier to translate
 * @param t - Translation function that accepts a translation key and returns the localized string
 * @returns The localized display name for `columnId`, or `columnId` unchanged if no mapping exists
 */
export function getColumnDisplayName(
  columnId: ProjectSortField | string,
  t: (key: string) => string,
): string {
  switch (columnId) {
    case "name":
      return t("table.name");
    case "country":
      return t("table.country");
    case "location":
      return t("table.city");
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
 * Compare two field values and produce an ordering number, honoring the requested sort direction.
 *
 * Compares two values as Dates (by timestamp) when both are Date instances, as strings using localeCompare when both are strings, and otherwise by their stringified forms. Does not treat `null`/`undefined` specially.
 *
 * @param aValue - The first value to compare
 * @param bValue - The second value to compare
 * @param sortDesc - If `true`, the comparison result is reversed for descending order
 * @returns A negative number if `aValue` is less than `bValue`, zero if equal, or a positive number if `aValue` is greater than `bValue`; the sign is reversed when `sortDesc` is `true`
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

/**
 * Create a comparator function for Project objects based on a specific field and sort direction.
 *
 * @param sortBy - The project field to compare.
 * @param sortDesc - If `true`, the comparator orders descending; otherwise orders ascending.
 * @returns A comparison function returning a negative number if the first project should come before the second, `0` if they are equal, or a positive number if the first should come after the second.
 */
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
/**
 * Compute the project duration in days in a tolerant way.
 *
 * - Returns 0 for invalid dates or when end is before start.
 * - Uses Math.ceil to match UI expectations (partial days count as a full day).
 *
 * @param startDate The start date of the project
 * @param endDate The end date of the project
 * @returns The duration in whole days (>= 0)
 */
export const calculateProjectDuration = (
  startDate: string | Date,
  endDate: string | Date,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = end.getTime() - start.getTime();
  if (!Number.isFinite(diffInMs) || diffInMs < 0) {
    return 0;
  }

  return Math.max(0, Math.ceil(diffInMs / MILLISECONDS_PER_DAY));
};

/**
 * Compute commonly used statistics for a project in one place so the UI and other
 * consumers get consistent, testable values.
 *
 * The function is tolerant of missing inputs and returns sensible defaults.
 */
export function getProjectStatistics(
  project:
    | { startDate?: string | Date; endDate?: string | Date }
    | null
    | undefined,
  participants?: Array<unknown> | null,
  activities?: ProjectActivityType[] | null,
): ProjectStatistics {
  const participantsCount = participants?.length ?? 0;
  const activitiesCount = activities?.length ?? 0;

  const totalDistance = (activities ?? []).reduce((sum, activity) => {
    const distanceKm = Number(activity.distanceKm);
    return sum + (Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm : 0);
  }, 0);

  const durationDays = project
    ? calculateProjectDuration(project.startDate ?? "", project.endDate ?? "")
    : 0;

  const activitiesCO2Kg = calculateActivitiesCO2(activities ?? []);

  return {
    participantsCount,
    activitiesCount,
    totalDistanceKm: totalDistance,
    durationDays,
    activitiesCO2Kg,
  };
}

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
 * Determine whether project list sorting should be descending.
 *
 * Uses the configured default sort direction when no sort field is provided or when the requested
 * sort field equals the configured default column; otherwise returns `false`.
 *
 * @param input - Query input for listing projects
 * @returns `true` if sorting should be descending, `false` otherwise
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
 * Builds an SQL ORDER BY clause for the specified project sort field and direction.
 *
 * @param sortField - The project sort field to order by (e.g. `"name"`, `"startDate"`, `"createdAt"`, `"updatedAt"`).
 * @param sortDesc - If `true`, produce a descending order clause; otherwise produce an ascending clause.
 * @returns An SQL ordering expression targeting the chosen project column and direction.
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
    case "country":
      return sortDesc ? desc(projectsTable.country) : asc(projectsTable.country);
    case "location":
      return sortDesc
        ? desc(sql`lower(${projectsTable.location})`)
        : asc(sql`lower(${projectsTable.location})`);
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
