"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { ProjectsGrid } from "@/components/features/projects/dashboard/projects-grid";
import { ProjectsTable } from "@/components/features/projects/dashboard/projects-table";
import { ProjectsViewSelect } from "@/components/features/projects/projects-view-select";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DEFAULT_PROJECT_SORTING } from "@/features/projects";
import { orpcQuery } from "@/lib/orpc/orpc";

export function ProjectsTab() {
  const t = useTranslations("organization.projects");
  const [view, setView] = useState<"grid" | "table">("table");
  // Grid sorting is handled within ProjectsGrid; table keeps its own internal sorting.

  const { data: allProjects, error } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions({
      input: {
        sort_by: DEFAULT_PROJECT_SORTING[0].id,
      },
    }),
  );

  // Filter out archived projects - show only active projects
  const projects = allProjects?.filter((project) => !project.archived) || [];

  // Get active organization to use as key for resetting table state on org switch
  const { data: activeOrg } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  // Grid sorting is handled inside ProjectsGrid to keep sorting logic
  // consistent with the table view and avoid duplicating `sortedProjects`.

  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

  if (!projects || projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t("no-projects-yet.title")}</EmptyTitle>
          <EmptyDescription>
            {t("no-projects-yet.description")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateProjectButton />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <ProjectsViewSelect setView={setView} view={view} />
      {view === "grid" ? (
        <ProjectsGrid key={activeOrg.id} projects={projects} />
      ) : (
        <ProjectsTable key={activeOrg.id} projects={projects} />
      )}
    </div>
  );
}
