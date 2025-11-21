import { UsersIcon } from "lucide-react";
import { headers as nextHeaders } from "next/headers";
import { getTranslations } from "next-intl/server";
import { TeamTable } from "@/app/[locale]/(app)/org/dashboard/_components/team-table";
import { organizationRoles } from "@/components/features/organizations/types";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/react-query/hydration";

export default async () => {
  const headers = await nextHeaders();

  // Get session and organizations for server-side data
  const session = await auth.api.getSession({ headers: headers });
  const organizations = await auth.api.listOrganizations({
    headers: headers,
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  // Prefetch team members data
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    orpcQuery.member.list.queryOptions({
      input: {
        organizationId: activeOrganizationId,
        roles: [organizationRoles.Owner, organizationRoles.Employee],
      },
    }),
  );

  const t = await getTranslations("organization.team");

  return (
    <HydrateClient client={queryClient}>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-start gap-3">
            <UsersIcon className="mb-1.5 size-9" />
            <h2 className="font-bold font-sans text-4xl">{t("title")}</h2>
          </div>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        {/* TODO: Suspense */}
        <TeamTable
          organizationId={activeOrganizationId}
          roles={[organizationRoles.Owner, organizationRoles.Employee]}
        />
      </div>
    </HydrateClient>
  );
};
