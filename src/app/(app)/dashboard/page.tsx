import { headers } from "next/headers";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardTabs } from "./_components/dashboard-tabs";

export default async function DashboardPage() {
  // Prefetch the projects data on the server
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  // Get active organization members using Better Auth API
  const session = await auth.api.getSession({ headers: await headers() });
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  const membersResult = await auth.api.listMembers({
    query: { organizationId: activeOrganizationId },
    headers: await headers(),
  });

  const members = membersResult.members || [];

  return (
    <HydrateClient client={queryClient}>
      <div className="space-y-8">
        <Suspense fallback={<DashboardHeaderSkeleton />}>
          <DashboardHeader />
        </Suspense>

        <DashboardTabs members={members} />
      </div>
    </HydrateClient>
  );
}

function DashboardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
