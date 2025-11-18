import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";
import { DashboardTabs } from "./_components/dashboard-tabs";

export default async function DashboardPage() {
  const t = await getTranslations("organization.dashboard");
  const queryClient = getQueryClient();

  // Prefetch all data using oRPC procedures for client components
  // This enables server-side Suspense without hydration errors
  // Data is dehydrated and sent with HTML, then rehydrated on client
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());
  void queryClient.prefetchQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  void queryClient.prefetchQuery(orpcQuery.organization.list.queryOptions());

  // Get session and organizations for server-side data (for members)
  const session = await auth.api.getSession({ headers: await headers() });
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  const membersResult = await auth.api.listMembers({
    query: {
      organizationId: activeOrganizationId,
      filterField: "role",
      filterOperator: "eq",
      filterValue: "member",
    },
    headers: await headers(),
  });

  const members = membersResult.members || [];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-bold text-4xl">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <DashboardTabs members={members} />
    </div>
  );
}
