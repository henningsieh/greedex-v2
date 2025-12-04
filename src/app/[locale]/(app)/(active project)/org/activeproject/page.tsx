import { headers } from "next/headers";
import { Suspense } from "react";
import { AppBreadcrumbSkeleton } from "@/components/app-breadcrumb";
import ActiveProjectPage from "@/components/features/active-project/active-project-page";
import { ParticipationControlsClientSkeleton } from "@/components/features/participants/participants-link-controls";
import ParticipantsList, {
  ParticipantsListSkeleton,
} from "@/components/features/participants/participants-list";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function ControlActiveProjectPage() {
  const queryClient = getQueryClient();

  // Get session for server-side data
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Prefetch all necessary data
  // Using await ensures data is in cache BEFORE dehydration
  const prefetches = [
    queryClient.prefetchQuery(orpcQuery.betterauth.getSession.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.projects.list.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.list.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.getActive.queryOptions()),
  ];

  // Prefetch participants data if we have an active project
  const activeProjectId = session?.session?.activeProjectId;
  if (activeProjectId) {
    prefetches.push(
      queryClient.prefetchQuery(
        orpcQuery.projects.getParticipants.queryOptions({
          input: {
            projectId: activeProjectId,
          },
        }),
      ),
    );
  }

  await Promise.all(prefetches);

  return (
    <>
      <Suspense
        fallback={
          <>
            <AppBreadcrumbSkeleton />
            <ParticipationControlsClientSkeleton />
          </>
        }
      >
        <ActiveProjectPage />
      </Suspense>
      <Suspense fallback={<ParticipantsListSkeleton />}>
        {activeProjectId ? (
          <ParticipantsList activeProjectId={activeProjectId} />
        ) : null}
      </Suspense>
    </>
  );
}
