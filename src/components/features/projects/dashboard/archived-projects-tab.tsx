"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ArchiveIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
import { DEFAULT_PROJECT_SORTING_FIELD } from "@/config/projects";
import { orpcQuery } from "@/lib/orpc/orpc";

export function ArchivedProjectsTab() {
  const t = useTranslations("organization.projectsArchive");
  const [view, setView] = useState<"grid" | "table">("table");

  const { data: projects } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions({
      input: {
        sort_by: DEFAULT_PROJECT_SORTING_FIELD,
        archived: true,
      },
    }),
  );

  if (!projects || projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ArchiveIcon className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t("no-archived-projects.title")}</EmptyTitle>
          <EmptyDescription>
            {t("no-archived-projects.description")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <ProjectsViewSelect setView={setView} view={view} />
      {view === "grid" ? (
        <ProjectsGrid projects={projects} />
      ) : (
        <ProjectsTable projects={projects} />
      )}
    </div>
  );
}
