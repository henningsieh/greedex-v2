"use client";

import { LayoutDashboardIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { Suspense } from "react";
import { DashboardStats } from "@/components/features/organizations/dashboard-stats";
import { TeamTable } from "@/components/features/organizations/team-table";
import { memberRoles } from "@/components/features/organizations/types";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { ProjectsTab } from "@/components/features/projects/projects-tab";
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
        <TabsTrigger
          className="text-muted-foreground/80 data-[state=active]:text-foreground dark:data-[state=active]:border-primary/60 dark:data-[state=active]:bg-accent/60"
          value="dashboard"
        >
          <LayoutDashboardIcon className="h-4 w-4" />
          {t("tabs.dashboard")}
        </TabsTrigger>
        <TabsTrigger
          className="text-muted-foreground/80 data-[state=active]:text-foreground dark:data-[state=active]:border-primary/60 dark:data-[state=active]:bg-accent/60"
          value="projects"
        >
          <PROJECT_ICONS.projects className="h-4 w-4" />
          {t("tabs.projects")}
        </TabsTrigger>
        <TabsTrigger
          className="text-muted-foreground/80 data-[state=active]:text-foreground dark:data-[state=active]:border-primary/60 dark:data-[state=active]:bg-accent/60"
          value="participants"
        >
          <PROJECT_ICONS.participants className="h-4 w-4" />
          {t("tabs.participants")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <DashboardStats />
      </TabsContent>

      <TabsContent value="projects">
        <Suspense fallback={<div>{t("tabs.loading-projects")}</div>}>
          <ProjectsTab />
        </Suspense>
      </TabsContent>

      <TabsContent value="participants">
        <TeamTable
          organizationId={organizationId}
          roles={[memberRoles.Participant]}
        />
      </TabsContent>
    </Tabs>
  );
}
