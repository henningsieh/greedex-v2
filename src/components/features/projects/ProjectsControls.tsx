"use client";

import { ChevronDown, Grid2X2, TableProperties } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SortOption } from "./types";
import { SORT_OPTIONS } from "./types";

interface ProjectsControlsProps {
  view: "grid" | "table";
  setView: (view: "grid" | "table") => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

export function ProjectsControls({
  view,
  setView,
  sortBy,
  onSortChange,
}: ProjectsControlsProps) {
  const tProject = useTranslations("project");
  const t = useTranslations("app");

  const sortOptions = [
    { value: SORT_OPTIONS.name, label: tProject("table.name") },
    { value: SORT_OPTIONS.startDate, label: tProject("table.start-date") },
    { value: SORT_OPTIONS.createdAt, label: tProject("table.created") },
    { value: SORT_OPTIONS.updatedAt, label: tProject("table.updated") },
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant={view === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("table")}
        >
          <TableProperties className="mr-2 size-4" />
          {t("views.table")}
        </Button>
        <Button
          variant={view === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("grid")}
        >
          <Grid2X2 className="mr-2 size-4" />
          {t("views.grid")}
        </Button>
      </div>

      {view === "grid" && onSortChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {tProject("sort-label")}{" "}
              {sortOptions.find((option) => option.value === sortBy)?.label}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{tProject("sort-projects")}</DropdownMenuLabel>
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
