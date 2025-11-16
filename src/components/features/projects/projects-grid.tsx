"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import ProjectCard from "@/components/features/projects/project-card";
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

  const { data: projects, error } = useSuspenseQuery(
    orpcQuery.project.list.queryOptions(),
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
