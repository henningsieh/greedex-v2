import { headers as nextHeaders } from "next/headers";
import { getTranslations } from "next-intl/server";
import { TeamTable } from "@/app/[locale]/(app)/org/dashboard/_components/team-table";
import { auth } from "@/lib/better-auth";

export default async () => {
  const headers = await nextHeaders();

  // Get session and organizations for server-side data (for members)
  const session = await auth.api.getSession({ headers: headers });
  const organizations = await auth.api.listOrganizations({
    headers: headers,
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  const [ownersResult, adminsResult] = await Promise.all([
    auth.api.listMembers({
      query: {
        organizationId: activeOrganizationId,
        filterField: "role",
        filterOperator: "eq",
        filterValue: "owner",
      },
      headers: headers,
    }),
    auth.api.listMembers({
      query: {
        organizationId: activeOrganizationId,
        filterField: "role",
        filterOperator: "eq",
        filterValue: "admin",
      },
      headers: headers,
    }),
  ]);

  const membersResult = {
    members: [
      ...(ownersResult?.members || []),
      ...(adminsResult?.members || []),
    ],
  };

  const t = await getTranslations("organization.team");

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-bold text-4xl">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <TeamTable members={membersResult.members} />
    </div>
  );
};
