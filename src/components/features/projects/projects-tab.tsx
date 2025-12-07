"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { ProjectsGrid } from "@/components/features/projects/projects-grid";
import { ProjectsTable } from "@/components/features/projects/projects-table";
import { ProjectsViewSelect } from "@/components/features/projects/projects-view-select";
import { DEFAULT_PROJECT_SORTING_FIELD } from "@/components/features/projects/types";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { orpcQuery } from "@/lib/orpc/orpc";

export function ProjectsTab() {
  const t = useTranslations("organization.projects");
  const [view, setView] = useState<"grid" | "table">("table");
  // Grid sorting is handled within ProjectsGrid; table keeps its own internal sorting.

  const { data: projects, error } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions({
      input: {
        sort_by: DEFAULT_PROJECT_SORTING_FIELD,
      },
    }),
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
          <EmptyDescription>{t("no-projects-yet.description")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateProjectButton />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center"></div>
      <ProjectsViewSelect view={view} setView={setView} />
      {view === "grid" ? (
        <ProjectsGrid projects={projects} />
      ) : (
        <ProjectsTable projects={projects} />
      )}
    </div>
  );
}
