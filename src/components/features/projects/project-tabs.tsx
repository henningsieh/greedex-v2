"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Calendar, Globe, Leaf, Users } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ParticipantsLinkControls } from "@/components/features/participants/participants-link-controls";
import { ParticipantsList } from "@/components/features/participants/participants-list";
import { ProjectActivitiesList } from "@/components/features/project-activities/project-activities-list";
import { ProjectDetails } from "@/components/features/projects/project-details";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { getCountryData } from "@/lib/i18n/country-i18n";
import { orpcQuery } from "@/lib/orpc/orpc";
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
  const t = useTranslations("project.details");
  const { canUpdate } = useProjectPermissions();
  const format = useFormatter();
  const locale = useLocale();

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
      !Number.isFinite(startDate.getTime()) ||
      !Number.isFinite(endDate.getTime())
    ) {
      return 0;
    }
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(diffInMs / MILLISECONDS_PER_DAY));
  })();

  // Calculate CO2 emissions from project activities
  const projectActivitiesCO2 = calculateActivitiesCO2(activities);

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
                  })}{" "}
                  -{" "}
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
              const countryData = getCountryData(project.country, locale);
              const Flag = countryData?.Flag;
              const countryName = countryData?.name ?? project.country;

              return (
                <Badge
                  variant="secondaryoutline"
                  title={`${countryName}${project.location ? ` | ${project.location}` : ""}`}
                >
                  <div className="flex h-8 items-center gap-3 overflow-hidden whitespace-nowrap">
                    <span className="truncate font-semibold text-muted-foreground text-sm">
                      {project.location}
                    </span>
                    {/* <span>{` | `}</span> */}
                    <div className="flex items-center gap-1.5">
                      {Flag ? (
                        <Flag className="size-6 shrink-0 rounded-sm" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                      <span className="truncate font-medium text-muted-foreground text-sm">
                        {countryName}
                      </span>
                    </div>
                  </div>
                </Badge>
              );
            })()}
          </CardAction>
        </CardHeader>

        <CardContent>
          {/* Statistics Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Project Duration */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
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
            {/* Participants Count */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
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
                <Leaf className="h-4 w-4" />
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
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 gap-2 bg-transparent p-0 sm:w-fit sm:grid-cols-3">
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
          <ProjectDetails project={project} />
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
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
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
