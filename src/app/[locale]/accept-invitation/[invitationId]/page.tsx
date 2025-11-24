import { headers as nextHeaders } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AcceptInvitationButton from "@/components/features/organizations/accept-invitation-button";
import { auth } from "@/lib/better-auth";

export default async function AcceptInvitationPage({
  params,
}: {
  params: { invitationId: string };
}) {
  const t = await getTranslations("organization.invitation");
  const headers = await nextHeaders();
  const { invitationId } = params;

  const invitation = await auth.api.getInvitation({
    query: { id: invitationId },
    headers,
  });
  const session = await auth.api.getSession({ headers });
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
          {/* <div className="font-semibold text-lg">
            {invitation.organization?.name}
          </div> */}
          <div className="text-muted-foreground text-sm">{invitation.role}</div>
          <div className="mt-2 text-muted-foreground text-sm">
            {invitation.inviterEmail}
          </div>
        </div>

        <div className="space-y-2">
          {session?.user ? (
            <AcceptInvitationButton invitationId={invitation.id} />
          ) : (
            <div>
              <p className="mb-2 text-muted-foreground text-sm">
                You need to sign in to accept the invitation.
              </p>
              <Link
                href={`/login?next=/accept-invitation/${invitationId}`}
                className="text-primary underline"
              >
                Sign in to accept invitation
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
