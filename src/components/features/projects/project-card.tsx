import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2Icon, EyeIcon, Trash2Icon } from "lucide-react";
import { useFormatter } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import type { ProjectType } from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { Link } from "@/lib/i18n/navigation";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import EditProjectForm from "./edit-project-form";

interface ProjectDetailCardProps {
  project: ProjectType;
}

function ProjectCard({ project }: ProjectDetailCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const format = useFormatter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  // Get user permissions
  const { canDelete } = useProjectPermissions();

  // Delete mutation
  const { mutateAsync: deleteProjectMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: () => orpc.project.delete({ id: project.id }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success("Project deleted successfully");
          // Invalidate project list to refresh
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
      <Card
        key={project.id}
        className="transition-transform duration-150 hover:scale-[1.01] hover:bg-accent/10 hover:text-accent dark:hover:text-accent-foreground"
      >
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>
            {project.location}, {project.country}
          </CardDescription>
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
        <CardFooter className="w-full">
          <div className="w-full flex-col gap-2 sm:flex">
            <Button
              className="flex-1 gap-4"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditModalOpen(true);
              }}
            >
              <Edit2Icon />
              Edit Project
            </Button>
            <Button
              asChild
              className="flex-1 gap-4"
              variant="outline"
              size="sm"
            >
              <Link href={`/org/projects/${project.id}`}>
                <EyeIcon />
                View Details
              </Link>
            </Button>
            {canDelete && (
              <Button
                className="flex-1 gap-4"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2Icon />
                Delete Project
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
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

      <ConfirmDialogComponent />
    </>
  );
}

export default ProjectCard;
