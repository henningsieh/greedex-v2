"use client";

import { useQueryState } from "nuqs";
import { ProjectsGrid } from "@/app/(app)/dashboard/_components/projects-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "./dashboard-stats";
import { TeamTable } from "./team-table";

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
      ["dashboard", "team", "projects"].includes(value) ? value : "dashboard",
  });

  return (
    <Tabs
      value={activeTab || "dashboard"}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="mt-6">
        <DashboardStats />
      </TabsContent>

      <TabsContent value="team" className="mt-6">
        <TeamTable members={members} />
      </TabsContent>

      <TabsContent value="projects" className="mt-6">
        <ProjectsGrid />
      </TabsContent>
    </Tabs>
  );
}
