"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { getProjectColumns } from "@/components/features/projects/columns";
import { DataTable } from "@/components/features/projects/data-table";
import type { ProjectType } from "@/components/features/projects/types";
import { DEFAULT_PROJECT_SORT } from "@/components/features/projects/types";

export function ProjectsTable({ projects }: { projects: ProjectType[] }) {
  const t = useTranslations("project");

  // Create columns with translations
  const columns = useMemo(() => getProjectColumns(t), [t]);

  // Map the default sort to TanStack format
  const defaultSorting = [{ id: DEFAULT_PROJECT_SORT, desc: false }];

  return (
    <DataTable
      columns={columns}
      data={projects}
      searchKey="name"
      searchPlaceholder={t("table.filter-projects")}
      defaultSorting={defaultSorting}
    />
  );
}
