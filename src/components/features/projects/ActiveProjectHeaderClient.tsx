"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Edit2Icon, MapPinIcon, Trash2Icon } from "lucide-react";
import { useFormatter } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import EditProjectForm from "@/components/features/projects/edit-project-form";
import type { ProjectType } from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

interface ActiveProjectHeaderClientProps {
  activeProject: ProjectType;
}

export default function ActiveProjectHeaderClient({
  activeProject,
}: ActiveProjectHeaderClientProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const format = useFormatter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  // Get user permissions
  const {
    canUpdate,
    canDelete,
    isPending: permissionsPending,
  } = useProjectPermissions();

  // Delete mutation
  const { mutateAsync: deleteProjectMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: () => orpc.project.delete({ id: activeProject.id }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success("Project deleted successfully");
          queryClient.invalidateQueries({
            queryKey: orpcQuery.project.list.queryKey(),
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
      description: `This will permanently delete the project "${activeProject.name}". This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
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
      <div className="mb-8 space-y-4 rounded-md border border-secondary/70 bg-secondary/10 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <h1 className="font-bold text-3xl dark:text-secondary-foreground">
              {activeProject.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                {activeProject.location}, {activeProject.country}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {activeProject &&
                  format.dateTime(activeProject.startDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                -{" "}
                {activeProject &&
                  format.dateTime(activeProject.endDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canUpdate && (
              <Button
                variant="outline"
                disabled={permissionsPending}
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit2Icon className="h-4 w-4" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || permissionsPending}
              >
                <Trash2Icon className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {activeProject.welcomeMessage && (
          <p className="text-muted-foreground">
            {activeProject.welcomeMessage}
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {activeProject && canUpdate && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <EditProjectForm
              project={activeProject}
              onSuccess={() => setIsEditModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialogComponent />
    </>
  );
}

export function ActiveProjectHeaderClientSkeleton() {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="h-8 w-64 rounded-md bg-muted" />
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="h-5 w-48 rounded-md bg-muted" />
            <div className="h-5 w-48 rounded-md bg-muted" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-10 w-24 rounded-md bg-muted" />
          <div className="h-10 w-24 rounded-md bg-muted" />
        </div>
      </div>
      <div className="h-5 w-full max-w-3xl rounded-md bg-muted" />
    </div>
  );
}
