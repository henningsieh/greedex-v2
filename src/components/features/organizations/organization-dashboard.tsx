"use client";

import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { Suspense } from "react";

import { OrganizationDashboardStats } from "@/components/features/organizations/organization-dashboard-stats";
import { ORGANIZATION_ICONS } from "@/components/features/organizations/organization-icons";
import {
  TeamTableSkeleton,
  UsersTable,
} from "@/components/features/organizations/users-table";
import { ProjectsTab } from "@/components/features/projects/dashboard/projects-tab";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MEMBER_ROLES } from "@/features/organizations/types";

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
          className="text-muted-foreground/80 data-[state=active]:border-secondary data-[state=active]:bg-secondary/60 data-[state=active]:text-foreground dark:data-[state=active]:border-secondary dark:data-[state=active]:bg-secondary/60"
          value="dashboard"
        >
          <ORGANIZATION_ICONS.statistics className="size-4" />
          <p className="truncate">{t("dashboard.tabs.statistics")}</p>
        </TabsTrigger>
        <TabsTrigger
          className="text-muted-foreground/80 data-[state=active]:border-secondary data-[state=active]:bg-secondary/60 data-[state=active]:text-foreground dark:data-[state=active]:border-secondary dark:data-[state=active]:bg-secondary/60"
          value="projects"
        >
          <PROJECT_ICONS.projects className="size-4" />
          <p className="truncate">{t("dashboard.tabs.projects")}</p>
        </TabsTrigger>
        <TabsTrigger
          className="text-muted-foreground/80 data-[state=active]:border-secondary data-[state=active]:bg-secondary/60 data-[state=active]:text-foreground dark:data-[state=active]:border-secondary dark:data-[state=active]:bg-secondary/60"
          value="participants"
        >
          <PROJECT_ICONS.participants className="size-4" />
          <p className="truncate">{t("dashboard.tabs.participants")}</p>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <Suspense fallback={<div>{t("dashboard.tabs.loading-stats")}</div>}>
          <OrganizationDashboardStats organizationId={organizationId} />
        </Suspense>
      </TabsContent>

      <TabsContent value="projects">
        <Suspense fallback={<div>{t("dashboard.tabs.loading-projects")}</div>}>
          <ProjectsTab />
        </Suspense>
      </TabsContent>

      <TabsContent value="participants">
        <Suspense fallback={<TeamTableSkeleton />}>
          <UsersTable
            emptyDescription={t("participants.emptyState.description")}
            emptyTitle={t("participants.emptyState.title")}
            organizationId={organizationId}
            roles={[MEMBER_ROLES.Participant]}
            showInviteButton={false}
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
