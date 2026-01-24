"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PROJECTS_PATH } from "@/app/routes";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PROJECT_SORT } from "@/config/projects";
import { ProjectsGrid } from "@/features/projects/components/dashboard/projects-grid";
import { ProjectsTable } from "@/features/projects/components/dashboard/projects-table";
import { PROJECT_ICONS } from "@/features/projects/components/project-icons";
import { ProjectsViewSelect } from "@/features/projects/components/projects-view-select";
import { Link } from "@/lib/i18n/routing";
import { orpcQuery } from "@/lib/orpc/orpc";

/**
 * Render a view of archived projects with a selectable grid or table presentation.
 *
 * Fetches archived projects (sorted by the default project sort) and:
 * - shows an empty state with icon, title, and description when no archived projects exist;
 * - otherwise renders a view selector and either a grid or table of the archived projects.
 *
 * @returns A React element that displays the empty archived-projects state or the view selector with the archived projects rendered in the selected layout.
 */
export function ArchivedProjects() {
  const t = useTranslations("organization.projectsArchive");
  const [view, setView] = useState<"grid" | "table">("table");

  const { data: projects } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions({
      input: {
        sort_by: DEFAULT_PROJECT_SORT.column,
        archived: true,
      },
    }),
  );

  if (!projects || projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader className="max-w-lg">
          <EmptyMedia variant="icon">
            <PROJECT_ICONS.archive className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t("no-archived-projects.title")}</EmptyTitle>
          <EmptyDescription>
            {t("no-archived-projects.description")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="secondaryoutline">
            <Link href={PROJECTS_PATH}>
              {/* <PROJECT_ICONS.projects className="mr-2 size-4" /> */}
              <ArrowRightIcon className="mr-2 size-4" />
              {t("go-to-projects")}
            </Link>
          </Button>
        </EmptyContent>
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

/**
 * Skeleton component for ArchivedProjects loading state
 */
export function ArchivedProjectsSkeleton() {
  return (
    <div className="space-y-4">
      {/* View selector skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto rounded-md border">
        <div className="mb-4 w-full sm:mb-0">
          {/* Table header skeleton */}
          <div className="border-b bg-muted/50">
            <div className="flex h-12 items-center px-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="ml-4 h-4 w-20" />
              <Skeleton className="ml-4 h-4 w-16" />
              <Skeleton className="ml-4 h-4 w-24" />
              <Skeleton className="ml-4 h-4 w-20" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          </div>

          {/* Table body skeleton */}
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div className="flex items-center space-x-4" key={i}>
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="ml-auto size-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
