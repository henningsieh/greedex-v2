"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2Icon, EyeIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { EditProjectForm } from "@/components/features/projects/edit-project-form";
import { SortableHeader } from "@/components/features/projects/sortable-header";
import {
  PROJECT_SORT_FIELDS,
  type ProjectType,
} from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { Link } from "@/lib/i18n/navigation";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { getProjectDetailPath } from "@/lib/utils/project-utils";

function DateCell({ date }: { date: Date }) {
  const format = useFormatter();
  return (
    <div>
      {format.dateTime(date, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </div>
  );
}

export function getProjectColumns(
  t: (key: string) => string,
): ColumnDef<ProjectType>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          // onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          // onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: PROJECT_SORT_FIELDS.name,
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table} title={t("table.name")} />
      ),
      cell: ({ row }) => (
        <Link
          href={getProjectDetailPath(row.original.id)}
          className="block font-medium"
        >
          {row.getValue(PROJECT_SORT_FIELDS.name)}
        </Link>
      ),
    },
    {
      accessorKey: "country",
      header: t("table.country"),
      cell: ({ row }) => (
        <Link href={getProjectDetailPath(row.original.id)} className="block">
          {row.getValue("country")}
        </Link>
      ),
    },
    {
      accessorKey: PROJECT_SORT_FIELDS.startDate,
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          table={table}
          title={t("table.start-date")}
          isNumeric
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue(PROJECT_SORT_FIELDS.startDate) as Date;
        return (
          <Link href={getProjectDetailPath(row.original.id)} className="block">
            <DateCell date={date} />
          </Link>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId));
        const dateB = new Date(rowB.getValue(columnId));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: PROJECT_SORT_FIELDS.createdAt,
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          table={table}
          title={t("table.created")}
          isNumeric
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue(PROJECT_SORT_FIELDS.createdAt) as Date;
        return (
          <Link href={getProjectDetailPath(row.original.id)} className="block">
            <DateCell date={date} />
          </Link>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId));
        const dateB = new Date(rowB.getValue(columnId));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: PROJECT_SORT_FIELDS.updatedAt,
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          table={table}
          title={t("table.updated")}
          isNumeric
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue(PROJECT_SORT_FIELDS.updatedAt) as Date;
        return (
          <Link href={getProjectDetailPath(row.original.id)} className="block">
            <DateCell date={date} />
          </Link>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId));
        const dateB = new Date(rowB.getValue(columnId));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original;
        return <ProjectActionsCell project={project} />;
      },
    },
  ];
}

function ProjectActionsCell({ project }: { project: ProjectType }) {
  const t = useTranslations("organization.projects");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const {
    canUpdate,
    canDelete,
    isPending: permissionsPending,
  } = useProjectPermissions();

  const { mutateAsync: deleteProjectMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: () =>
        orpc.projects.delete({
          id: project.id,
        }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success(t("form.delete.toast-success"));
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
        } else {
          toast.error(t("form.delete.toast-error"));
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || t("form.delete.toast-error-generic"));
      },
    });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: t("form.delete.confirm-title"),
      description: t("form.delete.confirm-description", {
        name: project.name,
      }),
      confirmText: t("form.delete.confirm-button"),
      cancelText: t("form.delete.cancel-button"),
      isDestructive: true,
    });

    if (confirmed) {
      try {
        await deleteProjectMutation();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sr-only">{t("table.open-menu")}</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("table.actions")}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={getProjectDetailPath(project.id)}>
              <EyeIcon className="mr-2 h-4 w-4" />
              {t("table.view-details")}
            </Link>
          </DropdownMenuItem>
          {canUpdate && (
            <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
              <Edit2Icon className="mr-2 h-4 w-4" />
              {t("table.edit-project")}
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting || permissionsPending}
                className="text-destructive"
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                {t("table.delete-project")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canUpdate && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("form.edit.title")}</DialogTitle>
            </DialogHeader>
            <EditProjectForm
              project={project}
              onSuccess={() => setIsEditModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialogComponent />
    </>
  );
}
