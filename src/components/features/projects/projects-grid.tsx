"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen, Grid2X2, Plus, TableProperties } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ProjectCard from "@/components/features/projects/project-card";
import { ProjectsTable } from "@/components/features/projects/projects-table";
import { DEFAULT_PROJECT_SORT } from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
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
  const t = useTranslations("project");
  const [view, setView] = useState<"grid" | "table">("table");

  const { data: projects, error } = useSuspenseQuery(
    orpcQuery.project.list.queryOptions({
      input: { sort_by: DEFAULT_PROJECT_SORT },
    }),
  );

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
          <EmptyTitle>{t("no-projects-yet")}</EmptyTitle>
          <EmptyDescription>
            {t(
              "projects-will-help-you-organize-your-work-and-track-activities-start-by-creating-your-first-project",
            )}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <Plus className="mr-2 size-4" />
            {t("button.create-project")}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Projects</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
          >
            <Grid2X2 className="mr-2 size-4" />
            Grid
          </Button>
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
          >
            <TableProperties className="mr-2 size-4" />
            Table
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <ProjectsTable />
      )}
    </div>
  );
}
