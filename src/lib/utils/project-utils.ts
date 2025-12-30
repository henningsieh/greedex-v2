import type { ProjectActivityType } from "@/components/features/projects/types";
import { orpc } from "@/lib/orpc/orpc";
import { type AppRoute, PROJECT_DETAIL_PATH } from "@/lib/utils/app-routes";

/**
 * Get the project detail path for a given project ID
 * @param projectId
 * @returns The project detail path with the project ID inserted
 */
export const getProjectDetailPath = (projectId: string): AppRoute =>
  PROJECT_DETAIL_PATH.replace("[id]", projectId) as AppRoute;

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

export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

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

// CO₂ emission factors (kg CO₂ per km per person)
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
