"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  FunnelXIcon,
  SearchIcon,
  SheetIcon,
  TablePropertiesIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { ProjectType } from "@/features/projects/types";

import { useConfirmDialog } from "@/components/confirm-dialog";
import { ProjectTableColumns } from "@/components/features/projects/dashboard/projects-table-columns";
import { Location } from "@/components/location";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/config/pagination";
import { MEMBER_ROLES } from "@/features/organizations/types";
import {
  getProjectDetailPath,
  getProjectsDefaultSorting,
} from "@/features/projects/utils";
import { useRouter } from "@/lib/i18n/routing";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

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
export function ProjectsTable({ projects }: { projects: ProjectType[] }) {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("organization.projects");
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

  // Get columns with translations
  const projectTableColumns = useMemo(
    () => ProjectTableColumns(t, locale),
    [t, locale],
  );

  const [sorting, setSorting] = useState<SortingState>(() =>
    getProjectsDefaultSorting(),
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    name: true,
    country: true,
    location: true,
    startDate: true,
    createdAt: true,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const table = useReactTable({
    data: projects,
    columns: projectTableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedProjectIds = selectedRows.map((row) => row.original.id);
  const selectedProjectNames = selectedRows.map((row) => row.original.name);

  const { mutate: batchDeleteMutation, isPending: isBatchDeleting } = useMutation(
    {
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
    },
  );

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
      <div className="min-w-0">
        <div className="flex flex-col py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full flex-1">
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
                key={`country-filter-${columnFilters.find((f) => f.id === "country")?.value || "none"}`}
                onValueChange={(value) =>
                  setColumnFilters((prev) => {
                    const filtered = prev.filter((f) => f.id !== "country");
                    if (value && value !== "all") {
                      filtered.push({ id: "country", value });
                    }
                    return filtered;
                  })
                }
                value={
                  (columnFilters.find((f) => f.id === "country")
                    ?.value as string) || ""
                }
              >
                <SelectTrigger
                  className="w-full focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary"
                  size="sm"
                >
                  <SelectValue placeholder={t("filter-by-country")} />
                </SelectTrigger>
                <SelectContent>
                  {columnFilters.some((f) => f.id === "country") && (
                    <SelectItem
                      className="focus:bg-secondary focus:text-secondary-foreground"
                      value="all"
                    >
                      {t("table.filter-all-countries")}
                    </SelectItem>
                  )}
                  {uniqueCountries.map((code) => (
                    <SelectItem
                      className="focus:bg-secondary focus:text-secondary-foreground"
                      key={code}
                      value={code}
                    >
                      <Location countryCode={code} locale={locale} showFlag />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge
                className="h-8 gap-1 px-2.5 text-sm font-normal"
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
            <span className="text-sm text-muted-foreground">
              {t("table.active-filters")}:
            </span>
            {columnFilters.map((filter) => {
              if (filter.id === "country") {
                return (
                  <Badge
                    className="px-2 text-xs"
                    key={filter.id}
                    variant="secondaryoutline"
                  >
                    {t("table.country")}:{" "}
                    <Location
                      countryCode={filter.value as string}
                      locale={locale}
                      showFlag
                    />
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
                        className={
                          "h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:px-2"
                        }
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
                    className="cursor-pointer transition-colors hover:bg-secondary/40"
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                    onClick={(e: React.MouseEvent<HTMLTableRowElement>) => {
                      if (
                        !(
                          e.target instanceof HTMLElement &&
                          (e.target.closest("button") ||
                            e.target.closest('[role="checkbox"]') ||
                            e.target.closest('[role="menuitem"]'))
                        )
                      ) {
                        router.push(getProjectDetailPath(row.original.id));
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-96 text-center"
                    colSpan={projectTableColumns.length}
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
        <div className="flex items-center justify-between gap-3 py-4">
          <div className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
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

          <div className="flex shrink-0 items-center gap-2">
            {/* desktop-only label for rows-per-page */}
            <Label
              className="mr-1 hidden text-sm text-muted-foreground sm:inline"
              htmlFor="projects-rows-per-page"
            >
              {t("table.rows-per-page")}
            </Label>

            <Select
              onValueChange={(value) =>
                setPagination({ pageIndex: 0, pageSize: Number(value) })
              }
              value={pagination.pageSize.toString()}
            >
              <SelectTrigger
                aria-label={t("table.rows-per-page")}
                className="h-8 w-14 shrink-0 focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary sm:w-18"
                id="projects-rows-per-page"
                size="sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t("table.rows-per-page")}</SelectLabel>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              className="h-8 shrink-0 px-2"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="sm"
              variant="outline"
            >
              {t("table.previous")}
            </Button>

            <Button
              className="h-8 shrink-0 px-2"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="sm"
              variant="outline"
            >
              {t("table.next")}
            </Button>
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
            <Skeleton className="flex h-8 w-8 items-center justify-center gap-1.5 border border-secondary/60 bg-secondary/40 sm:w-42">
              <TablePropertiesIcon className="size-5 shrink-0 text-muted-foreground" />
              <p className="hidden text-sm font-medium text-muted-foreground sm:inline">
                {t("views.table")}
              </p>
            </Skeleton>
            <Skeleton className="flex h-8 w-8 items-center justify-center gap-1.5 border border-secondary/60 bg-secondary/40 sm:w-42">
              <SheetIcon className="size-5 shrink-0 text-muted-foreground" />
              <p className="hidden text-sm font-medium text-muted-foreground sm:inline">
                {t("views.grid")}
              </p>
            </Skeleton>
          </div>
        </div>

        {/* Search + actions skeleton (separate row under view selector) */}
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-8 w-full rounded-md border border-secondary bg-secondary/10 sm:w-62.5 lg:w-75" />
            <div className="hidden items-center sm:flex">
              <Skeleton className="h-8 w-45 rounded-md border-secondary/60 bg-secondary/40" />
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
              <Skeleton className="h-4 w-4 shrink-0 bg-muted-foreground/20" />
              <Skeleton className="ml-9 h-4 w-64 shrink-0 bg-muted-foreground/20" />
              <Skeleton className="ml-4 h-4 w-40 shrink-0 bg-muted-foreground/20" />
              <Skeleton className="ml-4 h-4 w-36 shrink-0 bg-muted-foreground/20" />
              <Skeleton className="ml-4 h-4 w-36 shrink-0 bg-muted-foreground/20" />
              <Skeleton className="mr-7 ml-auto size-6 shrink-0 border border-muted-foreground/40 bg-background" />
            </div>
          </div>

          {/* Table body skeleton */}
          <div className="space-y-0 py-1.5">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                className="flex h-12 items-center border-b border-b-muted px-3 last:border-0"
                key={i}
              >
                <Skeleton className="h-4 w-4 shrink-0 bg-muted/60" />
                <Skeleton className="ml-10 h-4 w-64 shrink-0 bg-muted/60" />
                <Skeleton className="ml-4 h-4 w-40 shrink-0 bg-muted/60" />
                <Skeleton className="ml-4 h-4 w-36 shrink-0 bg-muted/60" />
                <Skeleton className="ml-4 h-4 w-36 shrink-0 bg-muted/60" />
                <Skeleton className="mr-7 ml-auto size-6 shrink-0 border border-secondary/40 bg-background" />
              </div>
            ))}
          </div>

          {/* Footer skeleton (compact, matches responsive layout) */}
          <div className="flex items-center justify-between py-4">
            <Skeleton className="h-4 w-45 bg-muted/20" />
            <div className="flex items-center gap-2">
              <Skeleton className="hidden h-4 w-20 bg-muted/20 sm:block" />
              <Skeleton className="h-8 w-18 rounded-md bg-muted/20" />
              <Skeleton className="h-8 w-25 rounded-md bg-muted/20" />
              <Skeleton className="h-8 w-25 rounded-md bg-muted/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
