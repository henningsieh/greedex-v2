"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArchiveIcon,
  Columns3CogIcon,
  Edit2Icon,
  EllipsisVerticalIcon,
  EyeIcon,
  Trash2Icon,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { useConfirmDialog } from "@/components/confirm-dialog";
import {
  EditProjectForm,
  EditProjectFormSkeleton,
} from "@/components/features/projects/edit-project-form";
import { SortableHeader } from "@/components/features/projects/sortable-header";
import { ProjectLocation } from "@/components/project-location";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectType } from "@/features/projects/types";
import {
  getColumnDisplayName,
  getProjectDetailPath,
} from "@/features/projects/utils";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { Link } from "@/lib/i18n/routing";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

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

function CountryCell({ project }: { project: ProjectType }) {
  const locale = useLocale();
  return (
    <ProjectLocation
      countryFormat="code"
      layout="unified"
      locale={locale}
      project={{ location: project.location, country: project.country }}
      showFlag={true}
      variant="inline"
    />
  );
}

export function ProjectTableColumns(
  t: (key: string) => string,
): ColumnDef<ProjectType>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="pl-1">
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
        </div>
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          table={table}
          title={getColumnDisplayName(column.id, t)}
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "location",
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          table={table}
          title={getColumnDisplayName(column.id, t)}
        />
      ),
      cell: ({ row }) => <CountryCell project={row.original} />,
      sortingFn: (rowA, rowB, _columnId) => {
        const locationA = rowA.original.location;
        const locationB = rowB.original.location;
        return locationA.localeCompare(locationB);
      },
    },
    {
      accessorKey: "startDate",
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          isNumeric
          table={table}
          title={getColumnDisplayName(column.id, t)}
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue("startDate") as Date;
        return <DateCell date={date} />;
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId));
        const dateB = new Date(rowB.getValue(columnId));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          isNumeric
          table={table}
          title={getColumnDisplayName(column.id, t)}
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return <DateCell date={date} />;
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId));
        const dateB = new Date(rowB.getValue(columnId));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          isNumeric
          table={table}
          title={getColumnDisplayName(column.id, t)}
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as Date;
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
      header: ({ table }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="p-0" size="icon-sm" variant="secondaryghost">
              <Columns3CogIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-secondary">
            <DropdownMenuLabel className="text-xs">
              {t("table.columns")}
            </DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    className="capitalize focus:bg-secondary/40 focus:text-secondary-foreground"
                    key={column.id}
                    onCheckedChange={(value: boolean) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {getColumnDisplayName(column.id, t)}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
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
    canArchive,
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

  const { mutateAsync: archiveProjectMutation, isPending: isArchiving } =
    useMutation({
      mutationFn: (archived: boolean) =>
        orpc.projects.archive({
          id: project.id,
          archived,
        }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success(
            result.project.archived
              ? t("form.archive.toast-success")
              : t("form.archive.toast-unarchive-success"),
          );
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
        } else {
          toast.error(t("form.archive.toast-error"));
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || t("form.archive.toast-error-generic"));
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

  const handleArchive = async () => {
    const isCurrentlyArchived = project.archived ?? false;
    const confirmed = await confirm({
      title: isCurrentlyArchived
        ? t("form.archive.unarchive-title")
        : t("form.archive.confirm-title"),
      description: isCurrentlyArchived
        ? t("form.archive.unarchive-description", { name: project.name })
        : t("form.archive.confirm-description", { name: project.name }),
      confirmText: isCurrentlyArchived
        ? t("form.archive.unarchive-button")
        : t("form.archive.confirm-button"),
      cancelText: t("form.archive.cancel-button"),
      isDestructive: false,
    });

    if (confirmed) {
      try {
        await archiveProjectMutation(!isCurrentlyArchived);
      } catch (error) {
        console.error("Archive failed:", error);
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
            variant="secondaryghost"
          >
            <span className="sr-only">{t("table.open-menu")}</span>
            <EllipsisVerticalIcon className="h-4 w-4" />
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
          {canArchive && (
            <DropdownMenuItem
              disabled={isArchiving || permissionsPending}
              onClick={handleArchive}
            >
              <ArchiveIcon className="mr-2 h-4 w-4" />
              {project.archived
                ? t("form.archive.unarchive")
                : t("form.archive.archive")}
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                disabled={isDeleting || permissionsPending}
                onClick={handleDelete}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                {t("table.delete-project")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canUpdate && (
        <Dialog onOpenChange={setIsEditModalOpen} open={isEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("form.edit.title")}</DialogTitle>
            </DialogHeader>
            <Suspense fallback={<EditProjectFormSkeleton />}>
              <EditProjectForm
                onSuccess={() => setIsEditModalOpen(false)}
                project={project}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialogComponent />
    </>
  );
}
