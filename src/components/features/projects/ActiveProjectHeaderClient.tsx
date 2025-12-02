"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2Icon,
  CalendarIcon,
  Edit2Icon,
  MapPinIcon,
  MapPinnedIcon,
  Trash2Icon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Blockquote, BlockquoteAuthor } from "@/components/block-quote";
import EditProjectForm from "@/components/features/projects/edit-project-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import type { Outputs } from "@/lib/orpc/router";

interface ActiveProjectHeaderClientProps {
  activeProject: Outputs["projects"]["getById"];
}

export default function ActiveProjectHeaderClient({
  activeProject,
}: ActiveProjectHeaderClientProps) {
  const t = useTranslations("organization.projects.activeProject");
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
      mutationFn: () =>
        orpc.projects.delete({
          id: activeProject.id,
        }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success(t("header.toast.deleteSuccess"));
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
        } else {
          toast.error(t("header.toast.deleteFailure"));
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || t("header.toast.deleteFailureGeneric"));
      },
    });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: t("header.deleteDialog.title"),
      description: t("header.deleteDialog.description", {
        name: activeProject.name,
      }),
      confirmText: t("header.deleteDialog.confirm"),
      cancelText: t("header.deleteDialog.cancel"),
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
      <Card className="space-y-4 border border-secondary/30 bg-secondary/10 shadow-sm backdrop-blur">
        <CardHeader className="gap-4">
          <CardTitle className="text-secondary text-sm">
            {t("header.contextLabel")}
          </CardTitle>
          {/* <CardHeader>
          <p className="font-medium text-secondary/80 text-xs uppercase tracking-[0.2em]">
          </p> */}
          <CardTitle>
            <CardDescription className="flex items-center gap-3 font-bold text-3xl text-secondary dark:text-secondary-foreground">
              <span className="rounded-full bg-secondary/30 p-2 text-secondary-foreground">
                <MapPinnedIcon className="size-5" />
              </span>
              <span>{activeProject.name}</span>
            </CardDescription>
          </CardTitle>
          <CardAction>
            <div className="flex flex-wrap gap-2">
              {/* Edit Modal */}
              {canUpdate && (
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={permissionsPending}
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Edit2Icon className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">
                        {t("header.edit")}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("header.edit")}</DialogTitle>
                    </DialogHeader>
                    <EditProjectForm
                      project={activeProject}
                      onSuccess={() => setIsEditModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
              {/* Delete Button */}
              {canDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || permissionsPending}
                >
                  <Trash2Icon className="h-4 w-4" />
                  {/* {t("header.delete")} */}
                </Button>
              )}
            </div>
          </CardAction>
          <CardDescription>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4 text-secondary" />
                {activeProject.location}, {activeProject.country}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-secondary" />
                {format.dateTime(activeProject.startDate, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {format.dateTime(activeProject.endDate, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </CardDescription>
        </CardHeader>

        {activeProject.welcomeMessage && (
          <CardFooter>
            <Blockquote className="w-full border-l-secondary/60 bg-secondary/10 text-secondary text-xl">
              {activeProject.welcomeMessage}
              <BlockquoteAuthor className="font-light font-serif text-muted-foreground/80 text-sm">
                <p className="inline-flex items-center gap-2">
                  {activeProject.responsibleUser.name}
                  <Building2Icon className="inline size-4 text-secondary" />
                  {activeProject.organization.name}
                </p>
              </BlockquoteAuthor>
            </Blockquote>
          </CardFooter>
        )}
      </Card>

      <ConfirmDialogComponent />
    </>
  );
}

export function ActiveProjectHeaderClientSkeleton() {
  return (
    <Card className="mb-8 space-y-4">
      <CardHeader>
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
      </CardHeader>
      <div className="h-5 w-full max-w-3xl rounded-md bg-muted" />
    </Card>
  );
}
