import { headers } from "next/headers";
import { Suspense } from "react";
import ControlActiveProjectPageSkeleton from "@/components/features/projects/ControlActiveProjectPageSkeleton";
import ParticipantsList from "@/components/features/projects/ParticipantsList";
import ParticipationControlsClient from "@/components/features/projects/ParticipationControlsClient";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { auth } from "@/lib/better-auth";
import { Link } from "@/lib/i18n/navigation";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function ControlActiveProjectPage() {
  // Fetch session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch projects and determine active project
  const projects = await orpc.project.list();
  const activeProjectId = session?.session.activeProjectId;
  const activeProject = projects.find(
    (project) => project.id === activeProjectId,
  );

  // Prefetch data
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  void queryClient.prefetchQuery(orpcQuery.organization.list.queryOptions());
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  // Get origin for consistent URL rendering
  const host = (await headers()).get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = `${protocol}://${host}`;

  if (!activeProjectId) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No Active Project</EmptyTitle>
            <EmptyDescription>
              Please select a project from the projects page to view its
              details.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/org/dashboard?tab=projects">Go to Projects</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Project Not Found</EmptyTitle>
            <EmptyDescription>
              The active project could not be found.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/org/dashboard?tab=projects">Go to Projects</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  void queryClient.prefetchQuery(
    orpcQuery.project.getParticipants.queryOptions({
      input: { projectId: session.session.activeProjectId },
    }),
  );
  // Fetch participants
  const participants = await orpc.project.getParticipants({
    projectId: activeProjectId,
  });

  return (
    <Suspense fallback={<ControlActiveProjectPageSkeleton />}>
      <ParticipationControlsClient
        activeProjectId={activeProjectId}
        origin={origin}
      />

      <ParticipantsList participants={participants} />
    </Suspense>
  );
}
