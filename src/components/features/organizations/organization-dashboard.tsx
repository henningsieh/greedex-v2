"use client";

import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { Suspense } from "react";
import { OrganizationDashboardStats } from "@/components/features/organizations/organization-dashboard-stats";
import { ORGANIZATION_ICONS } from "@/components/features/organizations/organization-icons";
import { memberRoles } from "@/components/features/organizations/types";
import { UsersTable } from "@/components/features/organizations/users-table";
import { ProjectsTab } from "@/components/features/projects/dashboard/projects-tab";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrganizationDashboardProps {
  organizationId: string;
}

/**
 * Renders a three-tab organization dashboard ("dashboard", "projects", "participants") and synchronizes the active tab with the "tab" query parameter.
 *
 * @param organizationId - Identifier of the organization; passed to the Participants tab to scope member data.
 * @returns The tabs-based dashboard UI for the given organization.
 */
export function OrganizationDashboard({
  organizationId,
}: OrganizationDashboardProps) {
  const t = useTranslations("organization");
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "dashboard",
    parse: (value) =>
      ["dashboard", "participants", "projects"].includes(value)
        ? value
        : "dashboard",
  });

  return (
    <Tabs
      className="w-full space-y-6"
      onValueChange={setActiveTab}
      value={activeTab || "dashboard"}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger
          className="text-muted-foreground/80 data-[state=active]:text-foreground dark:data-[state=active]:border-primary/60 dark:data-[state=active]:bg-accent/60"
          value="dashboard"
        >
          <ORGANIZATION_ICONS.statistics className="h-4 w-4" />
          {t("dashboard.tabs.statistics")}
        </TabsTrigger>
        <TabsTrigger
          className="text-muted-foreground/80 data-[state=active]:text-foreground dark:data-[state=active]:border-primary/60 dark:data-[state=active]:bg-accent/60"
          value="projects"
        >
          <PROJECT_ICONS.projects className="h-4 w-4" />
          {t("dashboard.tabs.projects")}
        </TabsTrigger>
        <TabsTrigger
          className="text-muted-foreground/80 data-[state=active]:text-foreground dark:data-[state=active]:border-primary/60 dark:data-[state=active]:bg-accent/60"
          value="participants"
        >
          <PROJECT_ICONS.participants className="h-4 w-4" />
          {t("dashboard.tabs.participants")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <OrganizationDashboardStats />
      </TabsContent>

      <TabsContent value="projects">
        <Suspense fallback={<div>{t("dashboard.tabs.loading-projects")}</div>}>
          <ProjectsTab />
        </Suspense>
      </TabsContent>

      <TabsContent value="participants">
        <UsersTable
          emptyDescription={t("participants.emptyState.description")}
          emptyTitle={t("participants.emptyState.title")}
          organizationId={organizationId}
          roles={[memberRoles.Participant]}
          showInviteButton={false}
        />
      </TabsContent>
    </Tabs>
  );
}
