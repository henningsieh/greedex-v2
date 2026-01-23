"use client";

import { useTranslations } from "next-intl";

import type { auth } from "@/lib/better-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AcceptInvitationButton } from "@/features/organizations/components/accept-invitation-button";
import { CancelInvitationButton } from "@/features/organizations/components/cancel-invitation-button";
import { ORGANIZATION_ICONS } from "@/features/organizations/organization-icons";

interface HandleInvitationProps {
  invitation: Awaited<ReturnType<typeof auth.api.getInvitation>>;
}

export function HandleInvitation({ invitation }: HandleInvitationProps) {
  const t = useTranslations("organization");

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("invitation.title")}</CardTitle>
          <CardDescription>{t("invitation.description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ORGANIZATION_ICONS.organization
                  aria-hidden={true}
                  className="size-5"
                />
                {t("invitation.organization")}
              </span>
              <span className="text-sm font-semibold">
                {invitation.organizationName}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ORGANIZATION_ICONS.role aria-hidden={true} className="size-5" />
                {t("invitation.role")}
              </span>
              <span className="text-sm font-semibold">
                {t(`roles.${invitation.role}`)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ORGANIZATION_ICONS.person
                  aria-hidden={true}
                  className="size-5"
                />
                {t("invitation.invitedBy")}
              </span>
              <span className="text-sm font-semibold">
                {invitation.inviterEmail}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <CancelInvitationButton
            className="flex-1"
            invitationId={invitation.id}
          />
          <AcceptInvitationButton
            className="flex-1"
            invitationId={invitation.id}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
