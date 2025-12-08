"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2Icon, EyeIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useFormatter } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { EditProjectForm } from "@/components/features/projects/edit-project-form";
import type { ProjectType } from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

interface ProjectDetailCardProps {
  project: ProjectType;
}

export function ProjectCard({ project }: ProjectDetailCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const format = useFormatter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  // Get user permissions
  const {
    // canCreate,
    // canRead,
    canUpdate,
    canDelete,
    // canShare,
    // role,
    isPending: permissionsPending,
  } = useProjectPermissions();

  // Delete mutation
  const { mutateAsync: deleteProjectMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: () =>
        orpc.projects.delete({
          id: project.id,
        }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success("Project deleted successfully");
          // Invalidate project list to refresh
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
        } else {
          toast.error("Failed to delete project");
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || "An error occurred while deleting the project");
      },
    });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Are you sure?",
      description: `This will permanently delete the project "${project.name}". This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      isDestructive: true,
    });

    if (confirmed) {
      try {
        await deleteProjectMutation();
      } catch (error) {
        // Error already handled in onError
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <Link href={getProjectDetailPath(project.id)} className="block">
          <Card key={project.id} className="transition-transform duration-150">
            <CardHeader>
              <div className="flex-1">
                <CardTitle className="truncate font-semibold text-lg leading-none">
                  {project.name}
                </CardTitle>
                <CardDescription className="truncate text-muted-foreground text-sm">
                  {project.location}, {project.country}
                </CardDescription>
              </div>

              <CardAction className="">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">Open actions</span>
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </CardAction>
            </CardHeader>

            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Start:</span>{" "}
                  {format.dateTime(project.startDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div>
                  <span className="font-medium">End:</span>{" "}
                  {format.dateTime(project.endDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link
              href={getProjectDetailPath(project.id)}
              className="flex items-center gap-2"
            >
              <EyeIcon className="mr-2 h-4 w-4" />
              <span>View Details</span>
            </Link>
          </DropdownMenuItem>
          {canUpdate && (
            <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
              <Edit2Icon className="mr-2 h-4 w-4" />
              Edit Project
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
                Delete Project
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canUpdate && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
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
