"use client";

import { useQueryState } from "nuqs";
import { Suspense } from "react";
import { DashboardStats } from "@/app/(app)/org/dashboard/_components/dashboard-stats";
import { TeamTable } from "@/app/(app)/org/dashboard/_components/team-table";
import { ProjectsGrid } from "@/components/features/projects/projects-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null | undefined;
  };
}

interface DashboardTabsProps {
  members: Member[];
}

export function DashboardTabs({ members }: DashboardTabsProps) {
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
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="participants">Participants</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="mt-6">
        <DashboardStats />
      </TabsContent>

      <TabsContent value="participants" className="mt-6">
        <TeamTable members={members} />
      </TabsContent>

      <TabsContent value="projects" className="mt-6">
        <Suspense fallback={<div>Loading projects...</div>}>
          <ProjectsGrid />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
