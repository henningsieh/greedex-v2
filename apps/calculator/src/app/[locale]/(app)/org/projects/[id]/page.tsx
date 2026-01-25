/**
 * @file Project details page
 *
 * Organization project details page with project details tabs
 */

import { safe } from "@orpc/client";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { PROJECTS_PATH } from "@/app/routes";
import { ContentContainer } from "@/components/content-container";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ProjectDetailsHeader,
  ProjectDetailsSkeleton,
  ProjectDetails,
} from "@/features/projects/components/project-details";
import { ErrorFallback } from "@/features/projects/components/project-error-fallback";
import { PROJECT_ICONS } from "@/features/projects/components/project-icons";
import { redirect } from "@/lib/i18n/routing";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
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
  const locale = await getLocale();
  const queryClient = getQueryClient();

  const { error, isDefined } = await safe(orpc.projects.getById({ id }));

  if (isDefined && error.code === "UNAUTHORIZED") {
    // Redirect to projects list when access is forbidden
    redirect({ href: PROJECTS_PATH, locale });
  }

  // Prefetch all queries for SSR (keep prefetching behavior)
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

      <ContentContainer width="lg">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<ProjectDetailsSkeleton />}>
            <ProjectDetails id={id} />
          </Suspense>
        </ErrorBoundary>
      </ContentContainer>
    </div>
  );
}
