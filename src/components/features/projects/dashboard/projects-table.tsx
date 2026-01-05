"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { flexRender } from "@tanstack/react-table";
import {
  FunnelXIcon,
  SearchIcon,
  Sheet as SheetIcon,
  TableProperties as TablePropertiesIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PAGE_SIZE_OPTIONS } from "@/config/pagination";
import { MEMBER_ROLES } from "@/features/organizations/types";
import type { ProjectType } from "@/features/projects/types";
import { getProjectDetailPath } from "@/features/projects/utils";
import { getCountryData } from "@/lib/i18n/countries";
import { useRouter } from "@/lib/i18n/routing";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import type { useProjectsTable } from "./use-projects-table";

interface ProjectsTableProps {
  projects: ProjectType[];
  table: ReturnType<typeof useProjectsTable>["table"];
  columnFilters: ReturnType<typeof useProjectsTable>["columnFilters"];
  setColumnFilters: ReturnType<typeof useProjectsTable>["setColumnFilters"];
  pagination: ReturnType<typeof useProjectsTable>["pagination"];
  setPagination: ReturnType<typeof useProjectsTable>["setPagination"];
}

/**
 * Render an interactive projects table with search, filtering, sorting, pagination, row selection, and batch deletion controls.
 *
 * The table displays the provided projects and exposes UI for filtering by name and country, selecting rows, navigating pages,
 * and performing a batch delete action (when permitted by the user's role). Active filters, selected counts, and an empty-state
 * view are shown as appropriate.
 *
 * @param projects - Array of project objects to display in the table.
 * @returns The JSX element for the projects table including its header controls, table body, pagination footer, and confirm dialog.
 */
export function ProjectsTable({
  projects,
  table,
  columnFilters,
  setColumnFilters,
  pagination,
  setPagination,
}: ProjectsTableProps) {
  const t = useTranslations("organization.projects");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  // Fetch active organization
  const { data: memberRole } = useSuspenseQuery(
    orpcQuery.organizations.getRole.queryOptions(),
  );

  // Get unique countries from projects
  const uniqueCountries = useMemo(
    () => [...new Set(projects.map((p) => p.country))],
    [projects],
  );

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

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[250px] lg:w-[300px]">
              <SearchIcon className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-full border-secondary pl-9 placeholder:text-sm focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary"
                id="project-name-filter"
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                placeholder={t("table.search-by-name")}
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                key={`location-filter-${columnFilters.find((f) => f.id === "location")?.value || "none"}`}
                onValueChange={(value) =>
                  setColumnFilters((prev) => {
                    const filtered = prev.filter((f) => f.id !== "location");
                    if (value && value !== "all") {
                      filtered.push({ id: "location", value });
                    }
                    return filtered;
                  })
                }
                value={
                  (columnFilters.find((f) => f.id === "location")
                    ?.value as string) || ""
                }
              >
                <SelectTrigger
                  className="w-[180px] focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary"
                  size="sm"
                >
                  <SelectValue placeholder={t("filter-by-country")} />
                </SelectTrigger>
                <SelectContent>
                  {columnFilters.some((f) => f.id === "location") && (
                    <SelectItem
                      className="focus:bg-secondary focus:text-secondary-foreground"
                      value="all"
                    >
                      {t("table.filter-all-countries")}
                    </SelectItem>
                  )}
                  {uniqueCountries.map((code) => {
                    const data = getCountryData(code, locale);
                    if (!data) {
                      return null;
                    }
                    return (
                      <SelectItem
                        className="focus:bg-secondary focus:text-secondary-foreground"
                        key={code}
                        value={code}
                      >
                        {data.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Badge
                className="hidden h-8 gap-1 px-2.5 font-normal text-sm lg:flex"
                variant="outline"
              >
                <span className="font-medium">
                  {table.getFilteredRowModel().rows.length}
                </span>
                <span className="text-muted-foreground">
                  {table.getFilteredRowModel().rows.length !== projects.length
                    ? `/ ${projects.length}`
                    : ""}
                </span>
                <span className="text-muted-foreground">
                  {t("table.projects-count", { defaultValue: "Projects" })}
                </span>
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {memberRole === MEMBER_ROLES.Owner && selectedRows.length > 0 && (
              <Button
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
            )}
          </div>
        </div>
        {columnFilters.length > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="size-7"
                  disabled={columnFilters.length === 0}
                  onClick={() => setColumnFilters([])}
                  // size="icon-sm"
                  variant="destructive"
                >
                  <FunnelXIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("table.clear-filters")}</TooltipContent>
            </Tooltip>
            <span className="text-muted-foreground text-sm">
              {t("table.active-filters")}:
            </span>
            {columnFilters.map((filter) => {
              if (filter.id === "location") {
                const data = getCountryData(filter.value as string, locale);
                return (
                  <Badge
                    className="px-2 text-xs"
                    key={filter.id}
                    variant="secondaryoutline"
                  >
                    {t("table.country")}:{" "}
                    {data?.name || (filter.value as string)}
                  </Badge>
                );
              }
              if (filter.id === "name") {
                return (
                  <Badge
                    className="px-2 text-xs"
                    key={filter.id}
                    variant="secondaryoutline"
                  >
                    {t("table.name")}: {filter.value as string}
                  </Badge>
                );
              }
              return (
                <Badge
                  className="px-2 text-xs"
                  key={filter.id}
                  variant="secondaryoutline"
                >
                  {filter.id}: {filter.value as string}
                </Badge>
              );
            })}
          </div>
        )}
        <div className="max-w-full overflow-x-auto rounded-md border">
          <Table className="mb-4 w-full sm:mb-0">
            <TableHeader className="border-b bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  className="border-b transition-colors"
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        className="h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:px-2"
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className="cursor-pointer transition-colors hover:bg-secondary/20"
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                    onClick={(e) => {
                      // Don't navigate if clicking on checkbox or action buttons
                      const target = e.target as HTMLElement;
                      if (
                        target.closest('[role="checkbox"]') ||
                        target.closest("button") ||
                        target.closest('[role="menuitem"]')
                      ) {
                        return;
                      }
                      router.push(getProjectDetailPath(row.original.id));
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className="pl-3" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-96 text-center"
                    colSpan={table.getVisibleLeafColumns().length}
                  >
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <SearchIcon className="size-6 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>
                          {t("table.no-results.title", {
                            defaultValue: "No projects found",
                          })}
                        </EmptyTitle>
                        <EmptyDescription>
                          {t("table.no-results.description", {
                            defaultValue:
                              "Try adjusting your filters or search query.",
                          })}
                        </EmptyDescription>
                      </EmptyHeader>
                      <div className="mt-6">
                        <Button
                          onClick={() => {
                            setColumnFilters([]);
                            table.getColumn("name")?.setFilterValue("");
                          }}
                          variant="outline"
                        >
                          {t("table.clear-filters", {
                            defaultValue: "Clear filters",
                          })}
                        </Button>
                      </div>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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

/**
 * Skeleton component for ProjectsTab loading state
 */
export function ProjectsTabSkeleton() {
  const t = useTranslations("organization.projects");

  return (
    <div className="space-y-0">
      <div className="space-y-4">
        {/* View selector skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="flex h-8 w-8 items-center justify-center gap-1.5 border-1 border-secondary/60 bg-secondary/40 sm:w-42">
              <TablePropertiesIcon className="size-5 shrink-0 text-muted-foreground" />
              <p className="hidden font-medium text-muted-foreground text-sm sm:inline">
                {t("views.table")}
              </p>
            </Skeleton>
            <Skeleton className="flex h-8 w-8 items-center justify-center gap-1.5 border-1 border-secondary/60 bg-secondary/40 sm:w-42">
              <SheetIcon className="size-5 shrink-0 text-muted-foreground" />
              <p className="hidden font-medium text-muted-foreground text-sm sm:inline">
                {t("views.grid")}
              </p>
            </Skeleton>
          </div>
        </div>

        {/* Search + actions skeleton (separate row under view selector) */}
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-8 w-full rounded-md border-1 border-secondary bg-secondary/10 sm:w-[250px] lg:w-[300px]" />
            <div className="hidden items-center sm:flex">
              <Skeleton className="h-8 w-[180px] rounded-md border-secondary/60 bg-secondary/40" />
            </div>
          </div>

          {/* Right side action skeleton (Create button / batch delete) */}
          {/* <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md border-secondary/60 bg-secondary/40" />
          </div> */}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="max-w-full overflow-x-auto rounded-md border">
        <div className="mb-4 w-full sm:mb-0">
          {/* Table header skeleton */}
          <div className="border-b bg-muted/50">
            <div className="flex h-12 items-center px-3">
              <Skeleton className="h-4 w-4 flex-shrink-0 bg-muted-foreground/20" />
              <Skeleton className="ml-9 h-4 w-64 flex-shrink-0 bg-muted-foreground/20" />
              <Skeleton className="ml-4 h-4 w-40 flex-shrink-0 bg-muted-foreground/20" />
              <Skeleton className="ml-4 h-4 w-36 flex-shrink-0 bg-muted-foreground/20" />
              <Skeleton className="ml-4 h-4 w-36 flex-shrink-0 bg-muted-foreground/20" />
              <Skeleton className="mr-7 ml-auto size-6 flex-shrink-0 border-1 border-muted-foreground/40 bg-background" />
            </div>
          </div>

          {/* Table body skeleton */}
          <div className="space-y-0 py-1.5">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                className="flex h-12 items-center border-b border-b-muted px-3 last:border-0"
                key={i}
              >
                <Skeleton className="h-4 w-4 flex-shrink-0 bg-muted/60" />
                <Skeleton className="ml-10 h-4 w-64 flex-shrink-0 bg-muted/60" />
                <Skeleton className="ml-4 h-4 w-40 flex-shrink-0 bg-muted/60" />
                <Skeleton className="ml-4 h-4 w-36 flex-shrink-0 bg-muted/60" />
                <Skeleton className="ml-4 h-4 w-36 flex-shrink-0 bg-muted/60" />
                <Skeleton className="mr-7 ml-auto size-6 flex-shrink-0 border-1 border-secondary/40 bg-background" />
              </div>
            ))}
          </div>

          {/* Footer skeleton (compact, matches responsive layout) */}
          <div className="flex items-center justify-between py-4">
            <Skeleton className="h-4 w-[180px] bg-muted/20" />
            <div className="flex items-center gap-2">
              <Skeleton className="hidden h-4 w-20 bg-muted/20 sm:block" />
              <Skeleton className="h-8 w-[72px] rounded-md bg-muted/20" />
              <Skeleton className="h-8 w-[100px] rounded-md bg-muted/20" />
              <Skeleton className="h-8 w-[100px] rounded-md bg-muted/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
