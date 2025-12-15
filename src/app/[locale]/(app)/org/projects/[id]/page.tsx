// src/app/(app)/projects/[id]/page.tsx:

import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ProjectDetails,
  ProjectDetailsSkeleton,
} from "@/components/features/projects/project-details";
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
  const t = await getTranslations("project.details");

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
    <ErrorBoundary fallback={t("error")}>
      <Suspense fallback={<ProjectDetailsSkeleton />}>
        <ProjectDetails id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
