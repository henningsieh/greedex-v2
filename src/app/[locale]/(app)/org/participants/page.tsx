/**
 * @file Participants page
 *
 * Organization participants page with list of participants
 */

import { ContentContainer } from "@/components/content-container";
import { TeamTableSkeleton } from "@/components/features/organizations/users-table";
import { ParticipantsTable } from "@/components/features/participants/participants-table";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { PageHeader } from "@/components/page-header";
import { DEFAULT_PAGE_SIZE } from "@/config/pagination";
import { MEMBER_ROLES } from "@/features/organizations/types";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/tanstack-react-query/hydration";
import { getTranslations } from "next-intl/server";
import { headers as nextHeaders } from "next/headers";
import { Suspense } from "react";

export default async () => {
  const headers = await nextHeaders();

  // Get session and organizations for server-side data
  const session = await auth.api.getSession({
    headers,
  });
  const organizations = await auth.api.listOrganizations({
    headers,
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  // Prefetch participants data (members with "member" role)
  // Using await ensures data is in cache BEFORE dehydration
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
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
  );

  const t = await getTranslations("organization.participants");

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<PROJECT_ICONS.participants />}
        title={t("title")}
        description={t("description")}
      />
      <ContentContainer width="xl">
        <Suspense fallback={<TeamTableSkeleton />}>
          <ParticipantsTable organizationId={activeOrganizationId} />
        </Suspense>
      </ContentContainer>
    </div>
  );
};
