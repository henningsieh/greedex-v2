"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2Icon, EyeIcon, MoreHorizontal, Trash2Icon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import type { ProjectType } from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
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
import { SortableHeader } from "@/components/ui/sortable-header";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { Link } from "@/lib/i18n/navigation";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import EditProjectForm from "./edit-project-form";
import { SORT_OPTIONS } from "./types";

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
      accessorKey: SORT_OPTIONS.name,
      header: ({ column, table }) => (
        <SortableHeader column={column} table={table} title={t("table.name")} />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue(SORT_OPTIONS.name)}</div>
      ),
    },
    {
      accessorKey: "country",
      header: t("table.country"),
    },
    {
      accessorKey: SORT_OPTIONS.startDate,
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          table={table}
          title={t("table.start-date")}
          isNumeric
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue(SORT_OPTIONS.startDate) as Date;
        return <DateCell date={date} />;
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId));
        const dateB = new Date(rowB.getValue(columnId));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: SORT_OPTIONS.createdAt,
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          table={table}
          title={t("table.created")}
          isNumeric
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue(SORT_OPTIONS.createdAt) as Date;
        return <DateCell date={date} />;
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId));
        const dateB = new Date(rowB.getValue(columnId));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: SORT_OPTIONS.updatedAt,
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          table={table}
          title={t("table.updated")}
          isNumeric
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue(SORT_OPTIONS.updatedAt) as Date;
        return <DateCell date={date} />;
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
  const t = useTranslations("project");
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
      mutationFn: () => orpc.project.delete({ id: project.id }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success(t("delete.toast-success"));
          queryClient.invalidateQueries({
            queryKey: orpcQuery.project.list.queryKey(),
          });
        } else {
          toast.error(t("delete.toast-error"));
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || t("delete.toast-error-generic"));
      },
    });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: t("delete.confirm-title"),
      description: t("delete.confirm-description", { name: project.name }),
      confirmText: t("delete.confirm-button"),
      cancelText: t("delete.cancel-button"),
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
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t("table.open-menu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("table.actions")}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/org/projects/${project.id}`}>
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
              <DialogTitle>{t("edit.title")}</DialogTitle>
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
