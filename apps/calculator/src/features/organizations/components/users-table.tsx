"use client";

import type z from "zod";

import { DEFAULT_PAGE_SIZE } from "@greendex/config/pagination";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { FilterXIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import type { MemberWithUserSchema } from "@/features/organizations/validation-schemas";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
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
  USERS_SORT_FIELDS,
  type MemberRole,
  type MemberSortField,
} from "@/features/organizations/types";
import { SortableHeader } from "@/features/projects/components/sortable-header";
import { orpcQuery } from "@/lib/orpc/orpc";

import { InviteEmployeeDialog } from "./invite-employee-dialog";

interface TeamTableProps {
  organizationId: string;
  roles: MemberRole[];
  showInviteButton?: boolean; // Optional prop to control invite button visibility
  emptyTitle: string;
  emptyDescription: string;
}

export function UsersTable({
  organizationId,
  roles,
  showInviteButton = true,
  emptyTitle,
  emptyDescription,
}: TeamTableProps) {
  const tRoles = useTranslations("organization.roles");
  const t = useTranslations("organization.userstable");
  const locale = useLocale();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const sortBy = sorting?.[0]?.id ?? undefined;
  const sortDirection = sorting?.[0]?.desc ? "desc" : "asc";

  // Map table column IDs to procedure sort fields
  let procedureSortBy: MemberSortField | undefined;
  if (sortBy === "member") {
    procedureSortBy = "user.name";
  } else if (sortBy === "email") {
    procedureSortBy = "user.email";
  } else if (USERS_SORT_FIELDS.includes(sortBy as MemberSortField)) {
    procedureSortBy = sortBy as MemberSortField;
  } else {
    procedureSortBy = undefined;
  }

  const { data: membersResult } = useSuspenseQuery(
    orpcQuery.members.search.queryOptions({
      input: {
        organizationId,
        filters: {
          roles,
          search: debouncedSearch || undefined,
          sortBy: procedureSortBy,
          sortDirection,
          limit: pageSize,
          offset: pageIndex * pageSize,
        },
      },
      // keep previous data while fetching new
      keepPreviousData: true,
    }),
  );

  const members = membersResult?.members ?? [];
  const total = membersResult?.total ?? 0;

  type MemberWithUser = z.infer<typeof MemberWithUserSchema>;

  const columns = useMemo<ColumnDef<MemberWithUser, string | Date | undefined>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
      {
        id: "member",
        header: t("name"),
        accessorFn: (row: MemberWithUser) => row.user?.name ?? undefined,
        enableSorting: true,
        size: 250,
        cell: (info) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-5">
              <AvatarImage src={info.row.original.user.image || undefined} />
              <AvatarFallback>
                {info.row.original.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{String(info.getValue() ?? "")}</span>
          </div>
        ),
      },
      {
        id: "email",
        header: t("email"),
        accessorFn: (row: MemberWithUser) => row.user?.email ?? undefined,
        enableSorting: true,
        size: 300,
        cell: (info) => <>{String(info.getValue() ?? "")}</>,
      },
      {
        id: "role",
        header: t("role"),
        accessorFn: (row: MemberWithUser) => row.role ?? undefined,
        enableSorting: true,
        size: 120,
        cell: (info) => (
          <Badge
            variant={
              String(info.getValue()) === "owner" ? "default" : "secondary"
            }
          >
            {tRoles(String(info.getValue()))}
          </Badge>
        ),
      },
      {
        id: "createdAt",
        header: t("joined"),
        accessorFn: (row: MemberWithUser) => row.createdAt as Date | undefined,
        enableSorting: true,
        size: 150,
        cell: (info) => {
          const val = info.getValue();
          if (!val) {
            return "";
          }
          const date = typeof val === "string" ? new Date(val) : (val as Date);
          return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(date as Date);
        },
      },
    ],
    [t, tRoles, locale],
  );

  const table = useReactTable({
    data: members,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
      rowSelection,
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize) || 0,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({
              pageIndex,
              pageSize,
            })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
  });

  const getColumnWidth = (id: string, isHeader: boolean) => {
    if (id === "select") {
      return "w-12";
    }
    if (id === "member") {
      return isHeader ? "pl-10.5" : "";
    }
    if (id === "email") {
      return "";
    }
    if (id === "role") {
      return "w-32";
    }
    return "w-36";
  };

  return (
    <div>
      <div className="flex flex-col gap-6 pb-4 sm:flex-row sm:items-center">
        <div className="flex w-full items-center gap-3">
          <Input
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("control.filter")}
            value={search}
          />
          <Button
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              setPageIndex(0);
            }}
            size="icon"
            variant="outline"
          >
            <FilterXIcon />
            {/* {t("control.clear")} */}
          </Button>
        </div>
        {showInviteButton && (
          <InviteEmployeeDialog
            allowedRoles={roles}
            onSuccess={() => {
              setPageIndex(0);
            }}
            organizationId={organizationId}
          />
        )}
      </div>
      <div className="rounded-md border">
        <Table className="mb-4 w-full sm:mb-0">
          <TableHeader className="border-b bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortState = header.column.getIsSorted();
                  let ariaSort: "ascending" | "descending" | "none" = "none";
                  if (sortState === "asc") {
                    ariaSort = "ascending";
                  } else if (sortState === "desc") {
                    ariaSort = "descending";
                  }

                  return (
                    <TableHead
                      aria-sort={
                        header.column.getCanSort() ? ariaSort : undefined
                      }
                      className={getColumnWidth(header.id, true)}
                      key={header.id}
                    >
                      {(() => {
                        if (header.isPlaceholder) {
                          return null;
                        }
                        if (header.column.getCanSort()) {
                          return (
                            <SortableHeader
                              column={header.column}
                              isNumeric={header.id === "createdAt"}
                              table={table}
                              title={String(
                                flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                ),
                              )}
                              buttonVariant="ghost"
                            />
                          );
                        }
                        return flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        );
                      })()}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(() => {
              if (table.getRowModel().rows?.length > 0) {
                return table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          className={getColumnWidth(cell.column.id, false)}
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ));
              }

              return (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length}>
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <FilterXIcon className="size-9 text-destructive" />
                        </EmptyMedia>
                        <EmptyTitle className="text-destructive">
                          {emptyTitle}
                        </EmptyTitle>
                        <EmptyDescription>{emptyDescription}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {t("rowsSelected", {
            selected: table.getFilteredSelectedRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length,
          })}
        </div>
        <div className="space-x-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="outline"
          >
            {t("previous")}
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="sm"
            variant="outline"
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * TeamTable Skeleton with Shadcn UI table structure
 * Used as a fallback while loading the actual TeamTable
 * implementation: Shadcn Skeletons
 */

const SKELETON_ROWS = Array.from({ length: 5 }, (_, i) => `skeleton-${i}`);

export function TeamTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="size-4" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SKELETON_ROWS.map((key) => (
            <TableRow key={key}>
              <TableCell>
                <Skeleton className="size-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
