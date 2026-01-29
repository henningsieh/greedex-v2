import { ProjectActivitiesTable } from "@/features/project-activities/components/project-activities-table";

interface ProjectActivitiesTabProps {
  projectId: string;
  canEdit?: boolean;
}

/**
 * Renders the activities tab content for a project, displaying the project activities table.
 *
 * @param projectId - The ID of the project whose activities to display
 * @param canEdit - Whether the user can edit the activities
 * @returns The activities tab content component
 */
export function ProjectActivitiesTab({
  projectId,
  canEdit = false,
}: ProjectActivitiesTabProps) {
  return <ProjectActivitiesTable canEdit={canEdit} projectId={projectId} />;
}
