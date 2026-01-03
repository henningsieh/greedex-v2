import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ProjectDetails,
  ProjectDetailsSkeleton,
} from "@/components/features/projects/project-details";
import { ErrorFallback } from "@/components/features/projects/project-error-fallback";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/tanstack-react-query/hydration";

/**
 * Render the project details tabs for a given project while ensuring server-side query data for the project, its participants, and activities is prefetched into the React Query cache.
 *
 * @param params - A promise that resolves to the route parameters object containing the `id` of the project to render
 * @returns The React element that displays the project's tabs wrapped in error and suspense boundaries
 */
export default async function ProjectsDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  // Prefetch project details, participants, and activities for SSR
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(
      orpcQuery.projects.getById.queryOptions({
        input: { id },
      }),
    ),
    queryClient.prefetchQuery(
      orpcQuery.projects.getParticipants.queryOptions({
        input: { projectId: id },
      }),
    ),
    queryClient.prefetchQuery(
      orpcQuery.projectActivities.list.queryOptions({
        input: { projectId: id },
      }),
    ),
  ]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<ProjectDetailsSkeleton />}>
        <ProjectDetails id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
