import { headers as nextHeaders } from "next/headers";
import { Suspense } from "react";
import ActiveProjectContent from "@/components/features/projects/ActiveProjectContent";
import { ActiveProjectHeaderClientSkeleton } from "@/components/features/projects/ActiveProjectHeaderClient";
import ActiveProjectParticipantsWrapper from "@/components/features/projects/ActiveProjectParticipantsWrapper";
import { ParticipantsListSkeleton } from "@/components/features/projects/ParticipantsList";
import { ParticipationControlsClientSkeleton } from "@/components/features/projects/ParticipationControlsClient";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function ControlActiveProjectPage() {
  const headers = await nextHeaders();

  // Get session for server-side data
  const session = await auth.api.getSession({
    headers: headers,
  });

  const activeProjectId = session?.session?.activeProjectId;

  // Prefetch all necessary data
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpcQuery.betterauth.getSession.queryOptions());
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  // Prefetch participants data if we have an active project
  if (activeProjectId) {
    void queryClient.prefetchQuery(
      orpcQuery.project.getParticipants.queryOptions({
        input: {
          projectId: activeProjectId,
        },
      }),
    );
  }

  return (
    <>
      <Suspense
        fallback={
          <>
            <ActiveProjectHeaderClientSkeleton />
            <ParticipationControlsClientSkeleton />
          </>
        }
      >
        <ActiveProjectContent />
      </Suspense>
      <Suspense fallback={<ParticipantsListSkeleton />}>
        <ActiveProjectParticipantsWrapper />
      </Suspense>
    </>
  );
}
