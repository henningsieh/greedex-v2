import type { ProjectActivityType } from "@/components/features/projects/types";
import { type AppRoute, PROJECT_DETAIL_PATH } from "@/config/AppRoutes";
import { orpc } from "@/lib/orpc/orpc";

/**
 * Get the project detail path for a given project ID
 * @param projectId
 * @returns The project detail path with the project ID inserted
 */
export const getProjectDetailPath = (projectId: string): AppRoute =>
  PROJECT_DETAIL_PATH.replace("[id]", projectId) as AppRoute;

/**
 * Retrieve a project's data and its activities by project ID.
 *
 * @param projectId - The project's unique identifier
 * @returns The project data including its activities, or `null` if an error occurs while fetching
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

// CO₂ emission factors (kg CO₂ per km per person)
export const CO2_FACTORS = {
  car: 0.192,
  boat: 0.115,
  bus: 0.089,
  train: 0.041,
  // Reserved for participant questionnaire calculations:
  plane: 0.255,
  electricCar: 0.053,
};

/**
 * Calculate CO₂ emissions from activities.
 * This method transparently calculates emissions for both participant's and project's activities.
 *
 * @param activities - Activities from database (transport modes and distances)
 * @returns Total CO₂ emissions from activities in kilograms
 */
export function calculateActivitiesCO2(
  activities: ProjectActivityType[],
): number {
  let activitiesCO2 = 0;

  if (!activities || activities.length === 0) {
    return activitiesCO2;
  }

  for (const activity of activities) {
    const distanceKm = Number(activity.distanceKm);
    if (Number.isNaN(distanceKm) || distanceKm <= 0) continue;

    switch (activity.activityType) {
      case "boat":
        activitiesCO2 += distanceKm * CO2_FACTORS.boat;
        break;
      case "bus":
        activitiesCO2 += distanceKm * CO2_FACTORS.bus;
        break;
      case "train":
        activitiesCO2 += distanceKm * CO2_FACTORS.train;
        break;
      case "car":
        // Use conventional car factor for activities
        activitiesCO2 += distanceKm * CO2_FACTORS.car;
        break;
    }
  }

  return activitiesCO2;
}
