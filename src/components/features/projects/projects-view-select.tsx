"use client";

import { ChevronDownIcon, Grid2X2Icon, TablePropertiesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  PROJECT_SORT_FIELDS,
  type ProjectSortField,
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

interface ProjectsControlsProps {
  view: "grid" | "table";
  setView: (view: "grid" | "table") => void;
  sortBy?: ProjectSortField;
  onSortChange?: (sort: ProjectSortField) => void;
}

export function ProjectsViewSelect({
  view,
  setView,
  sortBy,
  onSortChange,
}: ProjectsControlsProps) {
  const t = useTranslations("organization.projects");

  const sortOptions = [
    {
      value: PROJECT_SORT_FIELDS.name,
      label: t("table.name"),
    },
    {
      value: PROJECT_SORT_FIELDS.startDate,
      label: t("table.start-date"),
    },
    {
      value: PROJECT_SORT_FIELDS.createdAt,
      label: t("table.created"),
    },
    {
      value: PROJECT_SORT_FIELDS.updatedAt,
      label: t("table.updated"),
    },
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant={view === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("table")}
        >
          <TablePropertiesIcon className="mr-2 size-4" />
          {t("views.table")}
        </Button>
        <Button
          variant={view === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("grid")}
        >
          <Grid2X2Icon className="mr-2 size-4" />
          {t("views.grid")}
        </Button>
      </div>

      {view === "grid" && onSortChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {t("sort-label")}{" "}
              {sortOptions.find((option) => option.value === sortBy)?.label}
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("sort-projects")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={sortBy === option.value ? "bg-accent" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
