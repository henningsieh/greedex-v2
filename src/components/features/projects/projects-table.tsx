"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  DEFAULT_PROJECT_SORT,
  SORT_OPTIONS,
  type SortOption,
} from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orpcQuery } from "@/lib/orpc/orpc";

export function ProjectsTable() {
  const t = useTranslations("project");
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_PROJECT_SORT);

  const { data: projects, error } = useSuspenseQuery(
    orpcQuery.project.list.queryOptions({ input: { sort_by: sortBy } }),
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  // Display names for sort options
  const sortOptionLabels: Record<SortOption, string> = {
    [SORT_OPTIONS.name]: "Name",
    [SORT_OPTIONS.startDate]: "Start Date",
    [SORT_OPTIONS.createdAt]: "Created",
    [SORT_OPTIONS.updatedAt]: "Updated",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(SORT_OPTIONS).map((option) => (
                <SelectItem key={option} value={option}>
                  {sortOptionLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{project.country}</TableCell>
              <TableCell>{formatDate(project.startDate)}</TableCell>
              <TableCell>{formatDate(project.createdAt)}</TableCell>
              <TableCell>{formatDate(project.updatedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
