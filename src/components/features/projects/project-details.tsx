"use client";

import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Globe,
  Link2Icon,
  MapPinnedIcon,
  MessageSquare,
  RouteIcon,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParticipantsLinkControls } from "@/components/features/participants/participants-link-controls";
import {
  ParticipantsList,
  ParticipantsListSkeleton,
} from "@/components/features/participants/participants-list";
import {
  ProjectActivitiesList,
  ProjectActivitiesListSkeleton,
} from "@/components/features/project-activities/project-activities-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROJECTS_PATH } from "@/config/AppRoutes";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { useRouter } from "@/lib/i18n/routing";
import { orpcQuery } from "@/lib/orpc/orpc";

interface ProjectDetailsProps {
  id: string;
}

export function ProjectDetails({ id }: ProjectDetailsProps) {
  const t = useTranslations("project.details");
  const router = useRouter();
  const { canUpdate } = useProjectPermissions();
  const format = useFormatter();

  // Fetch project details
  const { data: project, error: projectError } = useQuery(
    orpcQuery.projects.getById.queryOptions({
      input: { id },
    }),
  );

  // Fetch participants
  const { data: participants } = useQuery(
    orpcQuery.projects.getParticipants.queryOptions({
      input: { projectId: id },
    }),
  );

  // Fetch activities
  const { data: activities } = useQuery(
    orpcQuery.projectActivities.list.queryOptions({
      input: { projectId: id },
    }),
  );

  if (projectError && projectError instanceof ORPCError) {
    if (projectError.code === "NOT_FOUND") {
      notFound();
    } else if (projectError.code === "FORBIDDEN") {
      toast.error("You don't have access to this project");
      router.push(PROJECTS_PATH);
    }
    return null;
  }

  if (!project) {
    return <ProjectDetailsSkeleton />;
  }

  // Calculate statistics
  const participantsCount = participants?.length ?? 0;
  const activitiesCount = activities?.length ?? 0;
  const totalDistance =
    activities?.reduce((sum, activity) => {
      return sum + Number.parseFloat(activity.distanceKm);
    }, 0) ?? 0;
  const duration = Math.ceil(
    (new Date(project.endDate).getTime() -
      new Date(project.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Project Header with Statistics */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-primary/60 to-accent p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        <div className="relative z-10 space-y-6">
          <div>
            <Badge
              variant="secondary"
              className="mb-4 bg-white/20 text-white hover:bg-white/30"
            >
              <Globe className="mr-1 h-3 w-3" />
              {project.country}
            </Badge>
            <h1 className="mb-4 font-bold text-3xl text-white md:text-4xl">
              {project.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format.dateTime(project.startDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {format.dateTime(project.endDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {project.location && (
                <div className="flex items-center gap-2">
                  <MapPinnedIcon className="h-4 w-4" />
                  <span>{project.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Users className="h-4 w-4" />
                {t("statistics.participants")}
              </div>
              <div className="mt-2 font-bold text-2xl text-white">
                {participantsCount}
              </div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <RouteIcon className="h-4 w-4" />
                {t("statistics.activities")}
              </div>
              <div className="mt-2 font-bold text-2xl text-white">
                {activitiesCount}
              </div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <RouteIcon className="h-4 w-4" />
                {t("statistics.total-distance")}
              </div>
              <div className="mt-2 font-bold text-2xl text-white">
                {totalDistance.toFixed(1)}{" "}
                <span className="font-normal text-base">
                  {t("statistics.km")}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Calendar className="h-4 w-4" />
                {t("statistics.duration")}
              </div>
              <div className="mt-2 font-bold text-2xl text-white">
                {duration}{" "}
                <span className="font-normal text-base">
                  {t("statistics.days")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participation Link */}
      <ParticipantsLinkControls activeProjectId={id} />

      {/* Tabs Navigation */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">
            <MapPinnedIcon className="mr-2 h-4 w-4" />
            {t("tabs.details")}
          </TabsTrigger>
          <TabsTrigger value="activities">
            <RouteIcon className="mr-2 h-4 w-4" />
            {t("tabs.activities")}
          </TabsTrigger>
          <TabsTrigger value="participants">
            <Users className="mr-2 h-4 w-4" />
            {t("tabs.participants")}
          </TabsTrigger>
        </TabsList>

        {/* Project Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPinnedIcon className="h-5 w-5 text-primary" />
                {t("title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground text-sm">
                    {t("start-date")}
                  </p>
                  <p className="font-semibold text-base">
                    {format.dateTime(project.startDate, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground text-sm">
                    {t("end-date")}
                  </p>
                  <p className="font-semibold text-base">
                    {format.dateTime(project.endDate, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="font-medium text-muted-foreground text-sm">
                    {t("country")}
                  </p>
                  <p className="font-semibold text-base">{project.country}</p>
                </div>
                {project.location && (
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      {t("location")}
                    </p>
                    <p className="font-semibold text-base">
                      {project.location}
                    </p>
                  </div>
                )}
              </div>

              {project.welcomeMessage && (
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-muted-foreground text-sm">
                      {t("welcome-message")}
                    </p>
                  </div>
                  <blockquote className="border-primary/20 border-l-4 pl-4 text-muted-foreground italic">
                    {project.welcomeMessage}
                  </blockquote>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Activities Tab */}
        <TabsContent value="activities">
          <ProjectActivitiesList projectId={id} canEdit={canUpdate} />
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants">
          <ParticipantsList activeProjectId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function ProjectDetailsSkeleton() {
  const t = useTranslations("project.details");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Project Header Skeleton */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-primary/60 to-accent p-8 shadow-xl">
        <div className="relative z-10 space-y-6">
          <div>
            <Skeleton className="mb-4 h-6 w-24 bg-white/20" />
            <Skeleton className="mb-4 h-10 w-3/4 bg-white/20">
              {t("loading")}
            </Skeleton>
            <div className="flex gap-4">
              <Skeleton className="h-5 w-48 bg-white/20" />
            </div>
          </div>

          {/* Statistics Skeleton */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
              >
                <Skeleton className="mb-2 h-4 w-24 bg-white/20" />
                <Skeleton className="h-8 w-16 bg-white/20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Participation Link Skeleton */}
      <Card className="mb-8 border border-border/60 bg-card/80 shadow-sm">
        <CardHeader className="gap-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="mt-6 flex flex-wrap gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="grid h-9 w-full grid-cols-3 gap-1 rounded-lg bg-muted p-[3px]">
          <Skeleton className="h-full" />
          <Skeleton className="h-full" />
          <Skeleton className="h-full" />
        </div>

        {/* Content Skeleton */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
