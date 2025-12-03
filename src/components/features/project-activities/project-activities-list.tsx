"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BusIcon,
  CarIcon,
  EditIcon,
  PlusIcon,
  ShipIcon,
  TrainIcon,
  Trash2Icon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import type {
  ActivityType,
  ProjectActivityType,
} from "@/components/features/project-activities/types";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { ProjectActivityForm } from "./project-activity-form";

interface ProjectActivitiesListProps {
  projectId: string;
  canEdit?: boolean;
}

// Helper function to get icon for activity type
function getActivityIcon(type: ActivityType) {
  const exhaustiveCheck = (_: never): never => {
    throw new Error(`Unhandled activity type: ${_}`);
  };

  switch (type) {
    case "boat":
      return <ShipIcon className="h-4 w-4" />;
    case "bus":
      return <BusIcon className="h-4 w-4" />;
    case "train":
      return <TrainIcon className="h-4 w-4" />;
    case "car":
      return <CarIcon className="h-4 w-4" />;
    default:
      return exhaustiveCheck(type);
  }
}

export function ProjectActivitiesList({
  projectId,
  canEdit = false,
}: ProjectActivitiesListProps) {
  const t = useTranslations("project.activities");
  const format = useFormatter();
  const queryClient = useQueryClient();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivity, setEditingActivity] =
    useState<ProjectActivityType | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(
    null,
  );

  const {
    data: activities,
    isLoading,
    error,
  } = useQuery(
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
      setDeletingActivityId(null);
    },
    onError: () => {
      toast.error(t("toast.delete-error"));
    },
  });

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingActivity(null);
    queryClient.invalidateQueries({
      queryKey: orpcQuery.projectActivities.list.queryKey({
        input: { projectId },
      }),
    });
  };

  if (isLoading) {
    return <ProjectActivitiesListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{t("error.load-failed")}</p>
        </CardContent>
      </Card>
    );
  }

  const hasActivities = activities && activities.length > 0;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShipIcon className="h-5 w-5" />
              {t("title")}
            </CardTitle>
            <p className="mt-1 text-muted-foreground text-sm">
              {t("description")}
            </p>
          </div>
          {canEdit && !showAddForm && !editingActivity && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              {t("form.title")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-6 rounded-lg border p-4">
            <h3 className="mb-4 font-medium">{t("form.title")}</h3>
            <ProjectActivityForm
              projectId={projectId}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {editingActivity && (
          <div className="mb-6 rounded-lg border p-4">
            <h3 className="mb-4 font-medium">{t("form.edit-title")}</h3>
            <ProjectActivityForm
              projectId={projectId}
              activity={editingActivity}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingActivity(null)}
            />
          </div>
        )}

        {!hasActivities && !showAddForm ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShipIcon className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty.title")}</EmptyTitle>
              <EmptyDescription>{t("empty.description")}</EmptyDescription>
            </EmptyHeader>
            {canEdit && (
              <EmptyContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  {t("form.title")}
                </Button>
              </EmptyContent>
            )}
          </Empty>
        ) : hasActivities ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.type")}</TableHead>
                  <TableHead>{t("table.distance")}</TableHead>
                  <TableHead>{t("table.description")}</TableHead>
                  <TableHead>{t("table.date")}</TableHead>
                  {canEdit && (
                    <TableHead className="w-[100px]">
                      {t("table.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.activityType)}
                        <span>{t(`types.${activity.activityType}`)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.distanceKm} {t("table.km")}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
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
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingActivity(activity)}
                            title={t("table.edit")}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingActivityId(activity.id)}
                            title={t("table.delete")}
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
        ) : null}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deletingActivityId}
          onOpenChange={(open) => !open && setDeletingActivityId(null)}
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
                onClick={() =>
                  deletingActivityId &&
                  deleteActivityMutation.mutate(deletingActivityId)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
    <Card className="shadow-lg">
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
