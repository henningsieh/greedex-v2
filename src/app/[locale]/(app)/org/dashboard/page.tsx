import { LayoutDashboardIcon } from "lucide-react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { organizationRoles } from "@/components/features/organizations/types";
import { DEFAULT_PROJECT_SORT } from "@/components/features/projects/types";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/react-query/hydration";
import { DashboardTabs } from "./_components/dashboard-tabs";

export default async function DashboardPage() {
  const t = await getTranslations("organization.dashboard");
  const queryClient = getQueryClient();

  // Prefetch all data using oRPC procedures for client components
  // This enables server-side Suspense without hydration errors
  // Data is dehydrated and sent with HTML, then rehydrated on client
  void queryClient.prefetchQuery(
    orpcQuery.project.list.queryOptions({
      input: { sort_by: DEFAULT_PROJECT_SORT },
    }),
  );
  void queryClient.prefetchQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  void queryClient.prefetchQuery(orpcQuery.organization.list.queryOptions());

  // Get session and organizations for server-side data
  const session = await auth.api.getSession({ headers: await headers() });
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  // Prefetch members data
  void queryClient.prefetchQuery(
    orpcQuery.member.list.queryOptions({
      input: {
        organizationId: activeOrganizationId,
        roles: [organizationRoles.Participant],
      },
    }),
  );

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
