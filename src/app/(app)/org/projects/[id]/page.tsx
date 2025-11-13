// src/app/(app)/projects/[id]/page.tsx:

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ProjectDetails from "@/components/features/projects/project-details";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function ProjectsDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Prefetch the project details data on the server
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    orpcQuery.project.getById.queryOptions({ input: { id } }),
  );

  return (
    <ErrorBoundary fallback={<div>Failed to load project details.</div>}>
      <Suspense fallback="loading project details...">
        {/* <HydrateClient client={queryClient}> */}
        <ProjectDetails id={id} />
        {/* </HydrateClient> */}
      </Suspense>
    </ErrorBoundary>
  );
}
