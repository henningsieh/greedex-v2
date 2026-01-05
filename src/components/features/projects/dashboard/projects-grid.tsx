"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, ChevronDownIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { ProjectCard } from "@/components/features/projects/project-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/config/pagination";
import { DEFAULT_PROJECT_SORT } from "@/config/projects";
import type { ProjectSortField } from "@/features/projects/types";
import { PROJECT_SORT_FIELDS } from "@/features/projects/types";
import { getColumnDisplayName } from "@/features/projects/utils";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import type { useProjectsTable } from "./use-projects-table";

interface ProjectsGridProps {
  table: ReturnType<typeof useProjectsTable>["table"];
  setSorting: ReturnType<typeof useProjectsTable>["setSorting"];
  pagination: ReturnType<typeof useProjectsTable>["pagination"];
  setPagination: ReturnType<typeof useProjectsTable>["setPagination"];
}

/**
 * Render a filterable, sortable grid of project cards with batch actions and pagination.
 *
 * @param table - The table instance from useProjectsTable.
 * @returns The rendered grid of project cards.
 */
export function ProjectsGrid({
  table,
  setSorting,
  pagination,
  setPagination,
}: ProjectsGridProps) {
  const t = useTranslations("organization.projects");
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const sorting = table.getState().sorting;

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedProjectIds = selectedRows.map((row) => row.original.id);
  const selectedProjectNames = selectedRows.map((row) => row.original.name);

  const { mutate: batchDeleteMutation, isPending: isBatchDeleting } =
    useMutation({
      mutationFn: () =>
        orpc.projects.batchDelete({
          projectIds: selectedProjectIds,
        }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success(
            t("form.batch-delete.toast-success", {
              count: result.deletedCount,
            }),
          );
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
          table.resetRowSelection();
        } else {
          toast.error(t("form.batch-delete.toast-error"));
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || t("form.batch-delete.toast-error-generic"));
      },
    });

  const handleBatchDelete = async () => {
    const confirmed = await confirm({
      title: t("form.batch-delete.confirm-title"),
      description: t("form.batch-delete.confirm-description", {
        count: selectedProjectIds.length,
        names: selectedProjectNames.join(", "),
      }),
      confirmText: t("form.batch-delete.confirm-button"),
      cancelText: t("form.batch-delete.cancel-button"),
      isDestructive: true,
    });

    if (confirmed) {
      batchDeleteMutation();
    }
  };

  // Helper to get current sort field and direction for UI
  const currentSortField =
    (sorting[0]?.id as ProjectSortField) || DEFAULT_PROJECT_SORT.column;
  const isSortDesc = sorting[0]?.desc ?? DEFAULT_PROJECT_SORT.order === "desc";

  const getSortLabel = (field: ProjectSortField) =>
    getColumnDisplayName(field, t);

  const sortOptions = PROJECT_SORT_FIELDS.map((field) => ({
    value: field,
    label: getSortLabel(field),
  }));

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              className="h-8 w-full rounded-md border-1 border-secondary bg-secondary/10 sm:w-[250px] lg:w-[300px]"
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              placeholder={t("table.filter-projects")}
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
            />
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  {selectedRows.length} {t("rows-selected")}
                </span>
                <Button
                  className="h-8"
                  disabled={isBatchDeleting}
                  onClick={handleBatchDelete}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  {t("table.batch-delete", {
                    count: selectedRows.length,
                  })}
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                aria-label="Select all"
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
              />
              <span className="text-muted-foreground text-sm">Select All</span>
            </div>
            <Button
              onClick={() => {
                const newDesc = !isSortDesc;
                setSorting([{ id: currentSortField, desc: newDesc }]);
              }}
              size="sm"
              variant="outline"
            >
              <ArrowUpDown className={isSortDesc ? "rotate-180" : ""} />
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
                    className={
                      currentSortField === opt.value ? "bg-accent" : ""
                    }
                    key={opt.value}
                    onClick={() =>
                      setSorting([{ id: opt.value, desc: isSortDesc }])
                    }
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {table.getRowModel().rows.length > 0 ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <ProjectCard
                  isSelected={row.getIsSelected()}
                  key={row.original.id}
                  onSelectChange={(value) => row.toggleSelected(value)}
                  project={row.original}
                />
              ))
          ) : (
            <Empty className="col-span-full">
              <EmptyDescription>{t("no-projects-yet.title")}</EmptyDescription>
            </Empty>
          )}
        </div>

        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:flex-1 sm:justify-start">
            <div className="text-muted-foreground text-sm">
              {(() => {
                const selectedCount =
                  table.getFilteredSelectedRowModel().rows.length;
                const totalCount = table.getFilteredRowModel().rows.length;
                const { pageIndex, pageSize } = table.getState().pagination;

                if (selectedCount > 0) {
                  return (
                    <span>
                      {selectedCount} of {totalCount} {t("rows-selected")}
                    </span>
                  );
                }
                if (totalCount === 0) {
                  return <span>0 projects</span>;
                }
                return (
                  <span>
                    Showing {pageIndex * pageSize + 1}-
                    {Math.min((pageIndex + 1) * pageSize, totalCount)} of{" "}
                    {totalCount} projects
                  </span>
                );
              })()}
            </div>

            {/* Mobile-only rows-per-page select */}
            <div className="sm:hidden">
              <Select
                onValueChange={(value) =>
                  setPagination({ pageIndex: 0, pageSize: Number(value) })
                }
                value={pagination.pageSize.toString()}
              >
                <SelectTrigger
                  aria-label={t("table.rows-per-page")}
                  className="h-8 w-16 border-secondary/40 focus-visible:border-secondary focus-visible:ring-secondary"
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("table.rows-per-page")}</SelectLabel>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem
                        className="mb-1 last:mb-0 focus:bg-secondary focus:text-secondary-foreground dark:hover:bg-secondary"
                        key={size}
                        value={size.toString()}
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 sm:justify-end">
            {/* desktop-only label for rows-per-page */}
            <Label
              className="mr-1 hidden flex-shrink-0 text-muted-foreground text-sm sm:inline"
              htmlFor="projects-rows-per-page"
            >
              {t("table.rows-per-page")}
            </Label>

            <div className="hidden sm:block">
              <Select
                onValueChange={(value) =>
                  setPagination({ pageIndex: 0, pageSize: Number(value) })
                }
                value={pagination.pageSize.toString()}
              >
                <SelectTrigger
                  aria-label={t("table.rows-per-page")}
                  className="h-8 min-w-18 border-secondary/40 focus-visible:border-secondary focus-visible:ring-secondary"
                  id="projects-rows-per-page"
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("table.rows-per-page")}</SelectLabel>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem
                        className="mb-1 last:mb-0 focus:bg-secondary focus:text-secondary-foreground dark:hover:bg-secondary"
                        key={size}
                        value={size.toString()}
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={`h-8 flex-shrink-0 ${
                      table.getCanPreviousPage()
                        ? ""
                        : "pointer-events-none opacity-50"
                    }`}
                    onClick={() => table.previousPage()}
                    text={t("table.previous")}
                    variant="secondaryoutline"
                  />
                </PaginationItem>
                {Array.from(
                  {
                    length: Math.ceil(
                      table.getFilteredRowModel().rows.length /
                        pagination.pageSize,
                    ),
                  },
                  (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={i === pagination.pageIndex}
                        onClick={() => table.setPageIndex(i)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    className={`h-8 flex-shrink-0 ${
                      table.getCanNextPage()
                        ? ""
                        : "pointer-events-none opacity-50"
                    }`}
                    onClick={() => table.nextPage()}
                    text={t("table.next")}
                    variant="secondaryoutline"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
      <ConfirmDialogComponent />
    </>
  );
}
