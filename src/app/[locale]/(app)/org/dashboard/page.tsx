import { LayoutDashboardIcon } from "lucide-react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { DashboardTabs } from "@/components/features/organizations/dashboard-tabs";
import { memberRoles } from "@/components/features/organizations/types";
import { DEFAULT_PROJECT_SORTING_FIELD } from "@/components/features/projects/types";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/react-query/hydration";
export default async function DashboardPage() {
  const t = await getTranslations("organization.dashboard");
  const queryClient = getQueryClient();

  // Get session and organizations for server-side data
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  // Prefetch all data using oRPC procedures for client components
  // This enables server-side Suspense without hydration errors
  // Data is dehydrated and sent with HTML, then rehydrated on client
  // Using await ensures data is in cache BEFORE dehydration
  await Promise.all([
    queryClient.prefetchQuery(
      orpcQuery.projects.list.queryOptions({
        input: {
          sort_by: DEFAULT_PROJECT_SORTING_FIELD,
        },
      }),
    ),
    queryClient.prefetchQuery(orpcQuery.betterauth.getSession.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.list.queryOptions()),
    queryClient.prefetchQuery(
      orpcQuery.members.search.queryOptions({
        input: {
          organizationId: activeOrganizationId,
          roles: [memberRoles.Participant],
        },
      }),
    ),
  ]);

  return (
    <HydrateClient client={queryClient}>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-start gap-3">
            <LayoutDashboardIcon className="mb-1.5 size-9" />
            <h2 className="font-bold font-sans text-4xl">{t("title")}</h2>
          </div>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <DashboardTabs organizationId={activeOrganizationId} />
      </div>
    </HydrateClient>
  );
}
