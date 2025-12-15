"use client";

import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Globe, MessageSquare, Users } from "lucide-react";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { notFound } from "next/navigation";
import { useFormatter, useTranslations, useLocale } from "next-intl";
import { getCountryData } from "@/lib/i18n/country-i18n";
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
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
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
  const locale = useLocale();

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
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Project Header with Statistics */}
      <Card className="shadow-md">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl sm:text-3xl">{project.name}</CardTitle>
            <CardDescription>
              <div className="inline-flex items-center gap-3 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {format.dateTime(project.startDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {" "}-{" "}
                  {format.dateTime(project.endDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </CardDescription>
          </div>

          <CardAction className="flex flex-col items-end gap-2">
            {/* Consolidated location badge: Flag + localized country name + city */}
            {(() => {
              const country = project.country ?? "";
              const countryData = getCountryData(country, locale);
              const Flag = countryData?.Flag;
              const countryName = countryData?.name ?? country;

              return (
                <Badge
                  variant="secondaryOutline"
                  className="inline-flex items-center gap-3 py-1.5 px-3"
                  title={`${countryName}${project.location ? ` | ${project.location}` : ""}`}>
                  {Flag ? (
                    <Flag className="h-5 w-5 rounded-sm flex-shrink-0" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}

                  <span className="flex items-baseline gap-2 whitespace-nowrap overflow-hidden">
                    <span className="text-sm font-medium text-muted-foreground truncate max-w-[10rem]">
                      {countryName}
                    </span>
                    {project.location && (
                      <span className="text-sm font-semibold text-muted-foreground truncate max-w-[8rem]">
                        {` | ${project.location}`}
                      </span>
                    )}
                  </span>
                </Badge>
              );
            })()}
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-6 p-6 sm:p-8">

          {/* Statistics Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                {t("statistics.participants")}
              </div>
              <div className="mt-2 font-semibold text-2xl text-foreground">
                {participantsCount}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <PROJECT_ICONS.activities className="h-4 w-4" />
                {t("statistics.activities")}
              </div>
              <div className="mt-2 font-semibold text-2xl text-foreground">
                {activitiesCount}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <PROJECT_ICONS.activities className="h-4 w-4" />
                {t("statistics.total-distance")}
              </div>
              <div className="mt-2 font-semibold text-2xl text-foreground">
                {totalDistance.toFixed(1)}{" "}
                <span className="font-normal text-base text-muted-foreground">
                  {t("statistics.km")}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                {t("statistics.duration")}
              </div>
              <div className="mt-2 font-semibold text-2xl text-foreground">
                {duration}{" "}
                <span className="font-normal text-base text-muted-foreground">
                  {t("statistics.days")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participation Link */}
                                    <ParticipantsLinkControls activeProjectId={id} />

      {/* Tabs Navigation */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 bg-transparent p-0">
          <TabsTrigger
            value="details"
            className="flex items-center justify-center gap-2 rounded-md border bg-card text-foreground shadow-sm data-[state=active]:border-primary data-[state=active]:shadow"
          >
            <PROJECT_ICONS.project className="h-4 w-4" />
            {t("tabs.details")}
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="flex items-center justify-center gap-2 rounded-md border bg-card text-foreground shadow-sm data-[state=active]:border-primary data-[state=active]:shadow"
          >
            <PROJECT_ICONS.activities className="h-4 w-4" />
            {t("tabs.activities")}
          </TabsTrigger>
          <TabsTrigger
            value="participants"
            className="flex items-center justify-center gap-2 rounded-md border bg-card text-foreground shadow-sm data-[state=active]:border-primary data-[state=active]:shadow"
          >
            <Users className="h-4 w-4" />
            {t("tabs.participants")}
          </TabsTrigger>
        </TabsList>

        {/* Project Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PROJECT_ICONS.project className="h-5 w-5 text-primary" />
                {t("title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <p className="font-medium text-sm">{t("welcome-message")}</p>
                  </div>
                  <blockquote className="border-l-4 border-primary/20 pl-4 text-muted-foreground italic">
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
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Project Header Skeleton */}
      <Card className="shadow-md">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl sm:text-3xl"><Skeleton className="h-6 w-44" /></CardTitle>
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-sm">
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
