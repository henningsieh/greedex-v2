"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { ProjectsGrid } from "@/components/features/projects/dashboard/projects-grid";
import { ProjectsTable } from "@/components/features/projects/dashboard/projects-table";
import { useProjectsTable } from "@/components/features/projects/dashboard/use-projects-table";
import { ProjectsViewSelect } from "@/components/features/projects/projects-view-select";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DEFAULT_PROJECT_SORT } from "@/config/projects";
import { orpcQuery } from "@/lib/orpc/orpc";

/**
 * Renders the organization's projects view, showing either a grid or table of active projects and a create-project call-to-action when none exist.
 *
 * The component tracks the current view via a URL-backed query state, fetches projects and the active organization, and excludes archived projects from the displayed list. When the active organization changes, the grid/table resets its internal state.
 *
 * @returns The rendered projects UI as a JSX element.
 */
export function ProjectsTab() {
  const t = useTranslations("organization.projects");
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(["table", "grid"] as const).withDefault("table"),
  );
  // Grid sorting is handled within ProjectsGrid; table keeps its own internal sorting.

  const { data: allProjects, error } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions({
      input: {
        sort_by: DEFAULT_PROJECT_SORT.column,
      },
    }),
  );

  // Filter out archived projects - show only active projects
  const projects = allProjects?.filter((project) => !project.archived) || [];

  // Get active organization to use as key for resetting table state on org switch
  const { data: activeOrg } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  // Initialize table state here to share between grid and table views
  const {
    table,
    setSorting,
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
  } = useProjectsTable(projects);

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
        <ProjectsGrid
          key={activeOrg.id}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          table={table}
        />
      ) : (
        <ProjectsTable
          columnFilters={columnFilters}
          key={activeOrg.id}
          pagination={pagination}
          projects={projects}
          setColumnFilters={setColumnFilters}
          setPagination={setPagination}
          table={table}
        />
      )}
    </div>
  );
}
