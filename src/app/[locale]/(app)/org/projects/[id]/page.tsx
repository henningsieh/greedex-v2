// src/app/(app)/projects/[id]/page.tsx:

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/features/projects/error-fallback";
import {
  ProjectDetailsSkeleton,
  ProjectTabs,
} from "@/components/features/projects/project-tabs";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

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
        <ProjectTabs id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
