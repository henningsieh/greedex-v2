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
