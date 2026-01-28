"use client";

import { useTranslations } from "@greendex/i18n/client";
import { useSuspenseQuery } from "@tanstack/react-query";

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
        <div className="text-sm font-medium text-muted-foreground">
          {t("total-projects")}
        </div>
        <div className="text-2xl font-bold">{stats.totalProjects}</div>
      </Card>
      <Card className="p-6">
        <div className="text-sm font-medium text-muted-foreground">
          {t("total-participants")}
        </div>
        <div className="text-2xl font-bold">{stats.totalParticipants}</div>
      </Card>
      <Card className="p-6">
        <div className="text-sm font-medium text-muted-foreground">
          {t("total-activities")}
        </div>
        <div className="text-2xl font-bold">{stats.totalActivities}</div>
      </Card>
    </div>
  );
}
