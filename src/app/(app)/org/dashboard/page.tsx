import { headers } from "next/headers";
import { Suspense } from "react";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";
import {
  DashboardHeader,
  DashboardHeaderSkeleton,
} from "./_components/dashboard-header";
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
    <div className="space-y-8">
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>

      <DashboardTabs members={members} />
    </div>
  );
}
