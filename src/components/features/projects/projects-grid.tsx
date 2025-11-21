"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { ProjectsControls } from "@/components/features/projects/ProjectsControls";
import ProjectCard from "@/components/features/projects/project-card";
import { ProjectsTable } from "@/components/features/projects/projects-table";
import {
  DEFAULT_PROJECT_SORT,
  type SortOption,
} from "@/components/features/projects/types";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { orpcQuery } from "@/lib/orpc/orpc";

export function ProjectsGrid() {
  const t = useTranslations("organization.projects");
  const [view, setView] = useState<"grid" | "table">("table");
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_PROJECT_SORT);

  const { data: projects, error } = useSuspenseQuery(
    orpcQuery.project.list.queryOptions({
      input: { sort_by: DEFAULT_PROJECT_SORT },
    }),
  );

  // Sort projects for grid view
  const sortedProjects = useMemo(() => {
    if (view !== "grid" || !projects) return projects || [];

    return [...projects].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue instanceof Date && bValue instanceof Date) {
        return aValue.getTime() - bValue.getTime();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue);
      }

      return 0;
    });
  }, [projects, sortBy, view]);

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
      <div className="flex items-center justify-between"></div>
      <ProjectsControls
        view={view}
        setView={setView}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <ProjectsTable projects={projects} />
      )}
    </div>
  );
}
