"use client";

import { useTranslations } from "next-intl";
import { MEMBER_ROLES } from "@/components/features/organizations/types";
import { UsersTable } from "@/components/features/organizations/users-table";

interface ParticipantsTableProps {
  organizationId: string;
}

/**
 * Participants table component
 * Displays organization members with "member" role (project participants)
 * Reuses the UsersTable component but without the invite functionality
 */
export function ParticipantsTable({ organizationId }: ParticipantsTableProps) {
  const t = useTranslations("organization.participants");
  return (
    <UsersTable
      emptyDescription={t("emptyState.description")}
      emptyTitle={t("emptyState.title")}
      organizationId={organizationId}
      roles={[MEMBER_ROLES.Participant]}
      showInviteButton={false}
    />
  );
}
