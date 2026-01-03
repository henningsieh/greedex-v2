"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";
import {
  TeamTableSkeleton,
  UsersTable,
} from "@/components/features/organizations/users-table";
import { MEMBER_ROLES } from "@/features/organizations";

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
    <Suspense fallback={<TeamTableSkeleton />}>
      <UsersTable
        emptyDescription={t("emptyState.description")}
        emptyTitle={t("emptyState.title")}
        organizationId={organizationId}
        roles={[MEMBER_ROLES.Participant]}
        showInviteButton={false}
      />
    </Suspense>
  );
}
