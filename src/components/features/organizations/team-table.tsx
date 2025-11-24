"use client";

import { useQuery } from "@tanstack/react-query";
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
import { useTranslations } from "next-intl";
import * as React from "react";
import type {
  MemberRole,
  MemberWithUser,
} from "@/components/features/organizations/types";
import { memberRoles } from "@/components/features/organizations/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { orpcQuery } from "@/lib/orpc/orpc";
import InviteMemberDialog from "./invite-member-dialog";

interface TeamTableProps {
  organizationId: string;
  roles: MemberRole[];
}

export function TeamTable({ organizationId, roles }: TeamTableProps) {
  const t = useTranslations("organization.team.table");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const sortBy = sorting?.[0]?.id ?? undefined;
  const sortDirection = sorting?.[0]?.desc ? "desc" : "asc";

  const { data: membersResult } = useQuery(
    orpcQuery.member.search.queryOptions({
      input: {
        organizationId,
        filters: {
          roles,
          search: debouncedSearch || undefined,
          sortBy,
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

  const roleKeyByValue: Record<string, string> = Object.fromEntries(
    Object.entries(memberRoles).map(([key, value]) => [value, key]),
  );

  const columns = React.useMemo<
    ColumnDef<MemberWithUser, string | Date | undefined>[]
  >(
    () => [
      {
        id: "member",
        header: t("member"),
        accessorFn: (row: MemberWithUser) => row.user?.name ?? undefined,
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-3">
            <Avatar>
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
        enableSorting: false,
        cell: (info) => <>{String(info.getValue() ?? "")}</>,
      },
      {
        id: "role",
        header: t("role"),
        accessorFn: (row: MemberWithUser) => row.role ?? undefined,
        enableSorting: false,
        cell: (info) => (
          <Badge
            variant={
              String(info.getValue()) === "owner" ? "default" : "secondary"
            }
          >
            {roleKeyByValue[String(info.getValue())] ??
              String(info.getValue() ?? "")}
          </Badge>
        ),
      },
      {
        id: "createdAt",
        header: t("joined"),
        accessorFn: (row: MemberWithUser) => row.createdAt as Date | undefined,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "";
          const date = typeof val === "string" ? new Date(val) : (val as Date);
          return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(date as Date);
        },
      },
    ],
    [t, roleKeyByValue],
  );

  const table = useReactTable({
    data: members,
    columns,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize) || 0,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
  });

  // Update query when table pagination or sorting changes: update pageIndex and pageSize
  // explicit reference to table to avoid unused variable lint errors
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _table = table;
  return (
    <div>
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder={t("table.filter")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
          <InviteMemberDialog
            organizationId={organizationId}
            allowedRoles={roles}
            onSuccess={() => {
              setPageIndex(0);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              setPageIndex(0);
            }}
          >
            {t("table.clear")}
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="border-b bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={() => header.column.toggleSorting()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            header.column.toggleSorting();
                          }
                        }}
                        className="inline-flex items-center gap-2"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                <TableCell colSpan={4} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
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

export function TeamTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
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
