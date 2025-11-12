import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { TeamTable } from "@/app/(app)/org/dashboard/_components/team-table";
import { auth } from "@/lib/better-auth";

export default async () => {
  const headers = await nextHeaders();

  const sessionResult = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: headers,
  });
  if (!sessionResult) redirect("/login");

  const activeOrganizationId = sessionResult.session.activeOrganizationId;

  if (!activeOrganizationId) {
    console.error("No active organization ID found in session");
    redirect("/");
  }

  const membersResult = await auth.api.listMembers({
    query: {
      organizationId: activeOrganizationId,
    },
    headers: headers,
  });

  return (
    <>
      <h1 className="font-bold text-4xl">Team Members</h1>
      <p className="py-2 text-muted-foreground">
        List of team members goes here.
      </p>
      <TeamTable members={membersResult.members} />
    </>
  );
};
