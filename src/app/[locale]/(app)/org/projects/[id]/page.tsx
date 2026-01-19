/**
 * @file Project details page
 *
 * Organization project details page with project details tabs
 */

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ContentContainer } from "@/components/content-container";
import {
  ProjectDetails,
  ProjectDetailsHeader,
  ProjectDetailsSkeleton,
} from "@/components/features/projects/project-details";
import { ErrorFallback } from "@/components/features/projects/project-error-fallback";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="space-y-8">
      <Suspense
        fallback={
          <PageHeader
            icon={<PROJECT_ICONS.project />}
            title={<Skeleton className="h-8 w-64" />}
            description={<Skeleton className="h-5 w-96" />}
          />
        }
      >
        <ProjectDetailsHeader id={id} />
      </Suspense>

      <ContentContainer width="xl">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<ProjectDetailsSkeleton />}>
            <ProjectDetails id={id} />
          </Suspense>
        </ErrorBoundary>
      </ContentContainer>
    </div>
  );
}
