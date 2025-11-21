"use client";

import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { Suspense } from "react";
import { DashboardStats } from "@/app/[locale]/(app)/org/dashboard/_components/dashboard-stats";
import { TeamTable } from "@/app/[locale]/(app)/org/dashboard/_components/team-table";
import { organizationRoles } from "@/components/features/organizations/types";
import { ProjectsGrid } from "@/components/features/projects/projects-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardTabsProps {
  organizationId: string;
}

export function DashboardTabs({ organizationId }: DashboardTabsProps) {
  const t = useTranslations("organization.dashboard");
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "dashboard",
    parse: (value) =>
      ["dashboard", "participants", "projects"].includes(value)
        ? value
        : "dashboard",
  });

  return (
    <Tabs
      value={activeTab || "dashboard"}
      onValueChange={setActiveTab}
      className="w-full space-y-6"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard">{t("tabs.dashboard")}</TabsTrigger>
        <TabsTrigger value="projects">{t("tabs.projects")}</TabsTrigger>
        <TabsTrigger value="participants">{t("tabs.participants")}</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <DashboardStats />
      </TabsContent>

      <TabsContent value="projects">
        <Suspense fallback={<div>{t("tabs.loading-projects")}</div>}>
          <ProjectsGrid />
        </Suspense>
      </TabsContent>

      <TabsContent value="participants">
        <TeamTable
          organizationId={organizationId}
          roles={[organizationRoles.Participant]}
        />
      </TabsContent>
    </Tabs>
  );
}
