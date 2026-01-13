"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { EditIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProjectActivityType } from "@/features/project-activities/types";
import { getProjectActivityIcon } from "@/features/projects/utils";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { ProjectActivityDialog } from "./project-activity-dialog";

interface ProjectActivitiesTableProps {
  projectId: string;
  canEdit?: boolean;
}
/**
 * Render a card showing a project's activities, with optional UI for adding, editing, and deleting items.
 *
 * Displays a loading skeleton while fetching, an error card on fetch failure, an empty state when there are no activities,
 * and a table of activities when data is available. When `canEdit` is true, in-card forms for creating/editing and a
 * delete confirmation dialog are provided. Successful deletions and form submissions refresh the list; delete operations
 * also surface success/error toasts.
 *
 * @param projectId - ID of the project whose activities should be displayed
 * @param canEdit - When true, show controls for adding, editing, and deleting activities
 * @returns A React element containing the activities list card for the specified project
 */
export function ProjectActivitiesTable({
  projectId,
  canEdit = false,
}: ProjectActivitiesTableProps) {
  const t = useTranslations("project.activities");
  const format = useFormatter();
  const queryClient = useQueryClient();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<
    ProjectActivityType | undefined
  >(undefined);
  const [deletingActivityId, setDeletingActivityId] = useState<
    string | undefined
  >(undefined);

  const { data: activities } = useSuspenseQuery(
    orpcQuery.projectActivities.list.queryOptions({
      input: { projectId },
    }),
  );

  const deleteActivityMutation = useMutation({
    mutationFn: (id: string) => orpc.projectActivities.delete({ id }),
    onSuccess: () => {
      toast.success(t("toast.delete-success"));
      queryClient.invalidateQueries({
        queryKey: orpcQuery.projectActivities.list.queryKey({
          input: { projectId },
        }),
      });
      setDeletingActivityId(undefined);
    },
    onError: () => {
      toast.error(t("toast.delete-error"));
    },
  });

  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setEditingActivity(undefined);
    queryClient.invalidateQueries({
      queryKey: orpcQuery.projectActivities.list.queryKey({
        input: { projectId },
      }),
    });
  };

  const hasActivities = activities && activities.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PROJECT_ICONS.activities className="h-5 w-5 text-secondary" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        {canEdit && (
          <CardAction>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              variant="secondaryoutline"
            >
              <PlusIcon className="h-4 w-4" />
              <p className="hidden sm:inline-flex">{t("form.title")}</p>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {hasActivities ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.type")}</TableHead>
                  <TableHead>{t("table.distance")}</TableHead>
                  <TableHead>{t("table.description")}</TableHead>
                  <TableHead>{t("table.date")}</TableHead>
                  {canEdit && (
                    <TableHead className="w-25">{t("table.actions")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getProjectActivityIcon(activity.activityType)}
                        <span>{t(`types.${activity.activityType}`)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.distanceKm} {t("table.km")}
                    </TableCell>
                    <TableCell className="max-w-50 truncate">
                      {activity.description || "-"}
                    </TableCell>
                    <TableCell>
                      {activity.activityDate
                        ? format.dateTime(new Date(activity.activityDate), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => setEditingActivity(activity)}
                            size="icon"
                            title={t("table.edit")}
                            variant="ghost"
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setDeletingActivityId(activity.id)}
                            size="icon"
                            title={t("table.delete")}
                            variant="ghost"
                          >
                            <Trash2Icon className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PROJECT_ICONS.activities className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty.title")}</EmptyTitle>
              <EmptyDescription>{t("empty.description")}</EmptyDescription>
            </EmptyHeader>
            {canEdit && (
              <EmptyContent>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  size="sm"
                  variant="outline"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  {t("form.title")}
                </Button>
              </EmptyContent>
            )}
          </Empty>
        )}

        {/* Add Activity Dialog */}
        <ProjectActivityDialog
          onOpenChange={setIsAddDialogOpen}
          onSuccess={handleFormSuccess}
          open={isAddDialogOpen}
          projectId={projectId}
        />

        {/* Edit Activity Dialog */}
        <ProjectActivityDialog
          activity={editingActivity}
          onOpenChange={(open) => !open && setEditingActivity(undefined)}
          onSuccess={handleFormSuccess}
          open={!!editingActivity}
          projectId={projectId}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          onOpenChange={(open) => !open && setDeletingActivityId(undefined)}
          open={!!deletingActivityId}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("delete.confirm-title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("delete.confirm-description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("delete.cancel-button")}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() =>
                  deletingActivityId &&
                  deleteActivityMutation.mutate(deletingActivityId)
                }
              >
                {t("delete.confirm-button")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

export function ProjectActivitiesListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-1 h-4 w-60" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
