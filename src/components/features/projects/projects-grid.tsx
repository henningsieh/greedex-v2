"use client";

import { ArrowUpDown, ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/features/projects/project-card";
import type {
  ProjectSortField,
  ProjectType,
} from "@/components/features/projects/types";
import {
  DEFAULT_PROJECT_SORTING_FIELD,
  PROJECT_SORT_FIELDS,
} from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface ProjectsGridProps {
  projects: Array<ProjectType>;
  sortBy?: ProjectSortField;
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const t = useTranslations("organization.projects");

  const [sortBy, setSortBy] = useState<ProjectSortField>(
    DEFAULT_PROJECT_SORTING_FIELD,
  );
  const [sortDesc, setSortDesc] = useState(false);
  const [filter, setFilter] = useState("");

  const sortOptions = [
    { value: PROJECT_SORT_FIELDS.name, label: t("table.name") },
    { value: PROJECT_SORT_FIELDS.startDate, label: t("table.start-date") },
    { value: PROJECT_SORT_FIELDS.createdAt, label: t("table.created") },
    { value: PROJECT_SORT_FIELDS.updatedAt, label: t("table.updated") },
  ];

  const sortedProjects = useMemo(() => {
    if (!projects) return [];

    const filtered = projects.filter((p) =>
      (p.name || "").toLowerCase().includes(filter.toLowerCase()),
    );

    return [...filtered].sort((a, b) => {
      const aValue = a[sortBy as keyof ProjectType];
      const bValue = b[sortBy as keyof ProjectType];

      let result = 0;
      if (aValue instanceof Date && bValue instanceof Date) {
        result = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        result = aValue.localeCompare(bValue);
      }

      return sortDesc ? -result : result;
    });
  }, [projects, sortBy, sortDesc, filter]);

  return (
    <>
      <div className="my-auto flex h-14 items-center">
        <Input
          placeholder={t("table.filter-projects")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDesc((s) => !s)}
          >
            <ArrowUpDown className={sortDesc ? "rotate-180" : ""} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="flex w-32 items-center justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                {t("sort-label")} <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-1" align="end">
              <DropdownMenuLabel>{t("sort-projects")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as ProjectSortField)}
                  className={sortBy === opt.value ? "bg-accent" : ""}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}
