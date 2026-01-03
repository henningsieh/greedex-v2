"use client";

import { ArrowUpDown, ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/features/projects/project-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  PROJECT_SORT_FIELDS,
  type ProjectSortField,
  type ProjectType,
} from "@/features/projects";

interface ProjectsGridProps {
  projects: Array<ProjectType>;
  sortBy?: ProjectSortField;
}

export function ProjectsGrid({
  projects,
  sortBy: initialSortBy,
}: ProjectsGridProps) {
  const t = useTranslations("organization.projects");

  const [sortBy, setSortBy] = useState<ProjectSortField>(
    initialSortBy ?? "startDate",
  );
  const [sortDesc, setSortDesc] = useState(false);
  const [filter, setFilter] = useState("");

  const getSortLabel = (field: ProjectSortField) => {
    switch (field) {
      case "name":
        return t("table.name");
      case "country":
        return t("table.country");
      case "startDate":
        return t("table.start-date");
      case "createdAt":
        return t("table.created");
      case "updatedAt":
        return t("table.updated");
      default:
        return field;
    }
  };

  const sortOptions = PROJECT_SORT_FIELDS.map((field) => ({
    value: field,
    label: getSortLabel(field),
  }));

  const sortedProjects = useMemo(() => {
    const filtered = projects.filter((p) =>
      (p.name || "").toLowerCase().includes(filter.toLowerCase()),
    );

    return [...filtered].sort((a, b) => {
      const aValue = a[sortBy as keyof ProjectType];
      const bValue = b[sortBy as keyof ProjectType];

      // Handle null/undefined - push them to the end
      if (aValue == null && bValue == null) {
        return 0;
      }
      if (aValue == null) {
        return sortDesc ? -1 : 1;
      }
      if (bValue == null) {
        return sortDesc ? 1 : -1;
      }

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
          className="h-8 max-w-sm"
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t("table.filter-projects")}
          value={filter}
        />
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={() => setSortDesc((s) => !s)}
            size="sm"
            variant="outline"
          >
            <ArrowUpDown className={sortDesc ? "rotate-180" : ""} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="flex w-32 items-center justify-end"
                onClick={(e) => e.stopPropagation()}
                size="sm"
                variant="outline"
              >
                {t("sort-label")} <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="space-y-1">
              <DropdownMenuLabel>{t("sort-projects")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((opt) => (
                <DropdownMenuItem
                  className={sortBy === opt.value ? "bg-accent" : ""}
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as ProjectSortField)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedProjects.length > 0 ? (
          sortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <Empty className="col-span-full">
            <EmptyDescription>{t("no-projects-yet.title")}</EmptyDescription>
          </Empty>
        )}
      </div>
    </>
  );
}
