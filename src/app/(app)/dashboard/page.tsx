import { headers } from "next/headers";
import CreateOrganizationModal from "@/components/features/organizations/create-organization-modal";
import { auth } from "@/lib/better-auth";
import { DashboardTabs } from "./_components/dashboard-tabs";

export default async function DashboardPage() {
  // Get active organization members using Better Auth API
  const session = await auth.api.getSession({ headers: await headers() });
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  const activeOrganization = organizations.find(
    (org) => org.id === activeOrganizationId
  );

  const membersResult = await auth.api.listMembers({
    query: { organizationId: activeOrganizationId },
    headers: await headers(),
  });

  const members = membersResult.members || [];

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">{activeOrganization?.name}</h1>
            <p className="text-muted-foreground">
              Welcome to your organization dashboard
            </p>
          </div>

          <CreateOrganizationModal />
        </div>

        <DashboardTabs members={members} />
      </div>
    </div>
  );
}
