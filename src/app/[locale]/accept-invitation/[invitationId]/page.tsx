import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AcceptInvitationButton } from "@/components/features/organizations/accept-invitation-button";
import { auth } from "@/lib/better-auth";
import { redirect } from "@/lib/i18n/navigation";
import { handleUnauthenticatedRedirect } from "@/lib/utils/auth-utils";

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{
    invitationId: string;
  }>;
}) {
  const t = await getTranslations("organization.invitation");
  const locale = await getLocale();
  const { invitationId } = await params;
  const requestHeaders = await headers();

  // Check session first to determine if user is authenticated
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  // If user is not authenticated, redirect to login with the invitation URL as callback
  if (!session?.user) {
    const rememberedPath =
      requestHeaders.get("x-org-requested-path") ??
      `/accept-invitation/${invitationId}`;
    const href = handleUnauthenticatedRedirect(
      rememberedPath,
      `/accept-invitation/${invitationId}`,
    );
    redirect({
      href,
      locale,
    });
  }

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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-bold text-2xl">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="rounded-md border p-6">
        <div className="mb-4">
          <div className="text-muted-foreground text-sm">{invitation.role}</div>
          <div className="mt-2 text-muted-foreground text-sm">
            {invitation.inviterEmail}
          </div>
        </div>

        <div className="space-y-2">
          <AcceptInvitationButton invitationId={invitation.id} />
        </div>
      </div>
    </div>
  );
}
