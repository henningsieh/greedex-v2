import { UsersIcon } from "lucide-react";
import { headers as nextHeaders } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  TeamTable,
  TeamTableSkeleton,
} from "@/components/features/organizations/team-table";
import { memberRoles } from "@/components/features/organizations/types";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async () => {
  const headers = await nextHeaders();

  // Get session and organizations for server-side data
  const session = await auth.api.getSession({
    headers: headers,
  });
  const organizations = await auth.api.listOrganizations({
    headers: headers,
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  // Prefetch team members data
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    orpcQuery.members.search.queryOptions({
      input: {
        organizationId: activeOrganizationId,
        filters: {
          roles: [memberRoles.Owner, memberRoles.Employee],
        },
      },
    }),
  );

  const t = await getTranslations("organization.team");

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-start gap-3">
          <UsersIcon className="mb-1.5 size-9" />
          <h2 className="font-bold font-sans text-4xl">{t("title")}</h2>
        </div>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Suspense fallback={<TeamTableSkeleton />}>
        <TeamTable
          organizationId={activeOrganizationId}
          roles={[memberRoles.Owner, memberRoles.Employee]}
        />
      </Suspense>
    </div>
  );
};
