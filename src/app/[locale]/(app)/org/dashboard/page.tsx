import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { OrganizationDashboard } from "@/components/features/organizations/organization-dashboard";
import { ORGANIZATION_ICONS } from "@/components/features/organizations/organization-icons";
import { DEFAULT_PAGE_SIZE } from "@/config/pagination";
import { DEFAULT_PROJECT_SORT } from "@/config/projects";
import { MEMBER_ROLES } from "@/features/organizations/types";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/tanstack-react-query/hydration";
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
  await Promise.all([
    queryClient.prefetchQuery(
      orpcQuery.projects.list.queryOptions({
        input: {
          sort_by: DEFAULT_PROJECT_SORT.column,
        },
      }),
    ),
    queryClient.prefetchQuery(orpcQuery.betterauth.getSession.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.list.queryOptions()),
    queryClient.prefetchQuery(
      orpcQuery.members.search.queryOptions({
        input: {
          organizationId: activeOrganizationId,
          filters: {
            roles: [MEMBER_ROLES.Participant],
            search: undefined,
            sortBy: undefined,
            sortDirection: "asc",
            limit: DEFAULT_PAGE_SIZE,
            offset: 0,
          },
        },
      }),
    ),
    queryClient.prefetchQuery(
      orpcQuery.organizations.getStats.queryOptions({
        input: {
          organizationId: activeOrganizationId,
        },
      }),
    ),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-start gap-3">
          <ORGANIZATION_ICONS.dashboard className="mb-1.5 size-9" />
          <h2 className="font-bold font-sans text-4xl">{t("title")}</h2>
        </div>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <OrganizationDashboard organizationId={activeOrganizationId} />
    </div>
  );
}
