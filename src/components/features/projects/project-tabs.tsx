"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  ArchiveIcon,
  CalendarDaysIcon,
  Edit2Icon,
  LeafIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ParticipantsLinkControls } from "@/components/features/participants/participants-link-controls";
import { ParticipantsList } from "@/components/features/participants/participants-list";
import { ProjectActivitiesList } from "@/components/features/project-activities/project-activities-list";
import { EditProjectForm } from "@/components/features/projects/edit-project-form";
import { ProjectDetails } from "@/components/features/projects/project-details";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { ProjectLocation } from "@/components/project-location";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import {
  calculateActivitiesCO2,
  MILLISECONDS_PER_DAY,
} from "@/lib/utils/project-utils";

interface ProjectDetailsProps {
  id: string;
}

/**
 * Renders a tabbed project overview with header, statistics, participation controls, and three tabbed sections (details, activities, participants).
 *
 * @param id - The project identifier used to fetch project details, participants, and activities
 * @returns The rendered project overview UI containing the header, statistics grid, participation controls, and tabs
 */
export function ProjectTabs({ id }: ProjectDetailsProps) {
  const tProject = useTranslations("organization.projects");
  const t = useTranslations("project.details");
  const {
    canUpdate,
    canDelete,
    canArchive,
    isPending: permissionsPending,
  } = useProjectPermissions();
  const format = useFormatter();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch project details
  const { data: project } = useSuspenseQuery(
    orpcQuery.projects.getById.queryOptions({
      input: { id },
    }),
  );

  // Fetch participants
  const { data: participants } = useSuspenseQuery(
    orpcQuery.projects.getParticipants.queryOptions({
      input: { projectId: id },
    }),
  );

  // Fetch activities
  const { data: activities } = useSuspenseQuery(
    orpcQuery.projectActivities.list.queryOptions({
      input: { projectId: id },
    }),
  );

  // Calculate statistics
  const participantsCount = participants?.length ?? 0;
  const activitiesCount = activities?.length ?? 0;
  const totalDistance =
    activities?.reduce((sum, activity) => {
      const distanceAsNumber = Number.parseFloat(activity.distanceKm);
      return sum + (Number.isFinite(distanceAsNumber) ? distanceAsNumber : 0);
    }, 0) ?? 0;
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const duration = (() => {
    if (
      !(
        Number.isFinite(startDate.getTime()) &&
        Number.isFinite(endDate.getTime())
      )
    ) {
      return 0;
    }
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(diffInMs / MILLISECONDS_PER_DAY));
  })();

  // Calculate CO2 emissions from project activities
  const projectActivitiesCO2 = calculateActivitiesCO2(activities);

  // Delete project mutation
  const { mutateAsync: deleteProjectMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: () =>
        orpc.projects.delete({
          id: project.id,
        }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success(tProject("form.delete.toast-success"));
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
        } else {
          toast.error(tProject("form.delete.toast-error"));
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || tProject("form.delete.toast-error-generic"));
      },
    });

  // Archive project mutation
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
              ? tProject("form.archive.toast-success")
              : tProject("form.archive.toast-unarchive-success"),
          );
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.getById.queryKey({
              input: { id: project.id },
            }),
          });
        } else {
          toast.error(tProject("form.archive.toast-error"));
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || tProject("form.archive.toast-error-generic"));
      },
    });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Project Header with Statistics */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">{project.name}</CardTitle>
          <CardDescription>
            <div className="flex justify-between">
              <div className="inline-flex items-center gap-3 text-muted-foreground text-sm">
                <CalendarDaysIcon className="h-4 w-4" />
                <span>
                  {format.dateTime(project.startDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {" - "}
                  {format.dateTime(project.endDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardDescription>

          <CardAction className="flex flex-col items-end gap-2">
            {/* Action buttons in dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondaryoutline">
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canUpdate && (
                  <DropdownMenuItem
                    disabled={permissionsPending}
                    onSelect={() => setIsEditModalOpen(true)}
                  >
                    <Edit2Icon className="mr-2 h-4 w-4" />
                    {tProject("table.edit-project")}
                  </DropdownMenuItem>
                )}
                {canArchive && (
                  <DropdownMenuItem
                    disabled={isArchiving || permissionsPending}
                    onSelect={async () => {
                      const isCurrentlyArchived = project.archived ?? false;
                      const confirmed = await confirm({
                        title: isCurrentlyArchived
                          ? tProject("form.archive.unarchive-title")
                          : tProject("form.archive.confirm-title"),
                        description: isCurrentlyArchived
                          ? tProject("form.archive.unarchive-description", {
                              name: project.name,
                            })
                          : tProject("form.archive.confirm-description", {
                              name: project.name,
                            }),
                        confirmText: isCurrentlyArchived
                          ? tProject("form.archive.unarchive-button")
                          : tProject("form.archive.confirm-button"),
                        cancelText: tProject("form.archive.cancel-button"),
                        isDestructive: false,
                      });
                      if (confirmed) {
                        try {
                          await archiveProjectMutation(!isCurrentlyArchived);
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                  >
                    <ArchiveIcon className="mr-2 h-4 w-4" />
                    {project.archived
                      ? tProject("form.archive.unarchive")
                      : tProject("form.archive.archive")}
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={isDeleting || permissionsPending}
                      onSelect={async () => {
                        const confirmed = await confirm({
                          title: tProject("form.delete.confirm-title"),
                          description: tProject(
                            "form.delete.confirm-description",
                            {
                              name: project.name,
                            },
                          ),
                          confirmText: tProject("form.delete.confirm-button"),
                          cancelText: tProject("form.delete.cancel-button"),
                          isDestructive: true,
                        });
                        if (confirmed) {
                          try {
                            await deleteProjectMutation();
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      variant="destructive"
                    >
                      <Trash2Icon className="mr-2 h-4 w-4" />
                      {tProject("table.delete-project")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <ProjectLocation
              locale={locale}
              project={project}
              showFlag
              variant="badge"
            />
          </CardAction>
        </CardHeader>

        <CardContent>
          {/* Statistics Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Project Duration */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CalendarDaysIcon className="h-4 w-4" />
                {t("statistics.duration")}
              </div>
              <div className="mt-2 font-semibold text-2xl text-foreground">
                {duration}{" "}
                <span className="font-normal text-base text-muted-foreground">
                  {t("statistics.days")}
                </span>
              </div>
            </div>
            {/* Participants Count */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <PROJECT_ICONS.participants className="h-4 w-4" />
                {t("statistics.participants")}
              </div>
              <div className="mt-2 font-semibold text-2xl text-foreground">
                {participantsCount}
              </div>
            </div>
            {/* Activities Count and Total Distance */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <PROJECT_ICONS.activities className="h-4 w-4" />
                {t("statistics.activities")}
              </div>
              <div className="flex items-end justify-start gap-4">
                <div className="mt-2 font-semibold text-2xl text-foreground">
                  {activitiesCount}
                </div>
                <div className="mt-1 text-muted-foreground text-sm">
                  ({totalDistance.toFixed(1)} {t("statistics.km")})
                </div>
              </div>
            </div>
            {/* CO2 Emissions by Project Activities */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <LeafIcon className="h-4 w-4" />
                {t("statistics.co2-emissions")}
              </div>
              <div className="mt-2 font-semibold text-2xl text-foreground">
                {projectActivitiesCO2.toFixed(1)}{" "}
                <span className="font-normal text-base text-muted-foreground">
                  kg CO₂
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {/* Participation Link */}
          <ParticipantsLinkControls activeProjectId={id} />
        </CardFooter>
      </Card>

      {/* Tabs Navigation */}
      <Tabs className="space-y-4" defaultValue="details">
        <TabsList className="grid w-full grid-cols-1 gap-2 bg-transparent p-0 sm:w-fit sm:grid-cols-3">
          <TabsTrigger
            className="flex items-center justify-center gap-2 rounded-md border bg-card text-foreground shadow-sm data-[state=active]:border-primary data-[state=active]:shadow"
            value="details"
          >
            <PROJECT_ICONS.project className="h-4 w-4" />
            {t("tabs.details")}
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center justify-center gap-2 rounded-md border bg-card text-foreground shadow-sm data-[state=active]:border-primary data-[state=active]:shadow"
            value="activities"
          >
            <PROJECT_ICONS.activities className="h-4 w-4" />
            {t("tabs.activities")}
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center justify-center gap-2 rounded-md border bg-card text-foreground shadow-sm data-[state=active]:border-primary data-[state=active]:shadow"
            value="participants"
          >
            <PROJECT_ICONS.participants className="h-4 w-4" />
            {t("tabs.participants")}
          </TabsTrigger>
        </TabsList>

        {/* Project Details Tab */}
        <TabsContent className="space-y-6" value="details">
          <ProjectDetails project={project} />
        </TabsContent>

        {/* Project Activities Tab */}
        <TabsContent value="activities">
          <ProjectActivitiesList canEdit={canUpdate} projectId={id} />
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants">
          <ParticipantsList activeProjectId={id} />
        </TabsContent>
      </Tabs>

      {/* Edit Project Dialog */}
      {canUpdate && (
        <Dialog onOpenChange={setIsEditModalOpen} open={isEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tProject("form.edit.title")}</DialogTitle>
            </DialogHeader>
            <EditProjectForm
              onSuccess={() => setIsEditModalOpen(false)}
              project={project}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Dialog Component */}
      <ConfirmDialogComponent />
    </div>
  );
}

/**
 * Renders a skeleton placeholder UI that mirrors the ProjectTabs layout for the project details view.
 *
 * @returns A JSX element containing skeleton placeholders for the header, statistics grid, participation controls, tabs, and tab content used while project data is loading.
 */
export function ProjectDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Project Header Skeleton */}
      <Card className="shadow-md">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl sm:text-3xl">
              <Skeleton className="h-6 w-44" />
            </CardTitle>
            <CardDescription>
              <div className="inline-flex items-center gap-3 text-muted-foreground text-sm">
                <Skeleton className="h-4 w-40" />
              </div>
            </CardDescription>
          </div>

          <CardAction className="flex flex-col items-end gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[...new Array(4)].map((_, i) => (
              <div
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
                key={i}
              >
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Participation Link Skeleton */}
      <Card className="shadow-sm">
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>

        {/* Content Skeleton */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <div className="space-y-2 border-t pt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
