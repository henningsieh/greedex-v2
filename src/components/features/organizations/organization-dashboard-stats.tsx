"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { orpcQuery } from "@/lib/orpc/orpc";

interface OrganizationDashboardStatsProps {
  organizationId: string;
}

export function OrganizationDashboardStats({
  organizationId,
}: OrganizationDashboardStatsProps) {
  const t = useTranslations("organization.dashboard");

  const { data: stats } = useSuspenseQuery(
    orpcQuery.organizations.getStats.queryOptions({
      input: { organizationId },
    }),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="p-6">
        <div className="font-medium text-muted-foreground text-sm">
          {t("total-projects")}
        </div>
        <div className="font-bold text-2xl">{stats.totalProjects}</div>
      </Card>
      <Card className="p-6">
        <div className="font-medium text-muted-foreground text-sm">
          {t("total-participants")}
        </div>
        <div className="font-bold text-2xl">{stats.totalParticipants}</div>
      </Card>
      <Card className="p-6">
        <div className="font-medium text-muted-foreground text-sm">
          {t("total-activities")}
        </div>
        <div className="font-bold text-2xl">{stats.totalActivities}</div>
      </Card>
    </div>
  );
}
