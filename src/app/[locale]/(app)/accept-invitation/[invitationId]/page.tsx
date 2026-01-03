import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { HandleInvitation } from "@/components/features/authentication/handle-invitation";
import { auth } from "@/lib/better-auth";

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{
    invitationId: string;
  }>;
}) {
  const { invitationId } = await params;
  const requestHeaders = await headers();

  // User is authenticated, now we can safely fetch the invitation
  const invitation = await auth.api.getInvitation({
    query: {
      id: invitationId,
    },
    headers: requestHeaders,
  });

  if (!invitation?.id) {
    notFound();
    return null;
  }

  return <HandleInvitation invitation={invitation} />;
}
