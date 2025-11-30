"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Calendar,
  Globe,
  MapPinnedIcon,
  MessageSquare,
  Users,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import {
  ProjectActivitiesList,
  ProjectActivitiesListSkeleton,
} from "@/components/features/projects/project-activities-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { orpcQuery } from "@/lib/orpc/orpc";

interface ProjectDetailsProps {
  id: string;
}

export function ProjectDetails({ id }: ProjectDetailsProps) {
  const t = useTranslations("project.details");
  const { canUpdate } = useProjectPermissions();
  const { data } = useSuspenseQuery(
    orpcQuery.project.getById.queryOptions({
      input: {
        id,
      },
    }),
  );
  const format = useFormatter();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Project Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-primary/60 to-accent p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        <div className="relative z-10">
          <Badge
            variant="secondary"
            className="mb-4 bg-white/20 text-white hover:bg-white/30"
          >
            <Globe className="mr-1 h-3 w-3" />
            {data.country}
          </Badge>
          <h1 className="mb-4 font-bold text-3xl text-white md:text-4xl">
            {data.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format.dateTime(data.startDate, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {format.dateTime(data.endDate, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {data.location && (
              <div className="flex items-center gap-2">
                <MapPinnedIcon className="h-4 w-4" />
                <span>{data.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Project Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Info Card */}
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
                    {format.dateTime(data.startDate, {
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
                    {format.dateTime(data.endDate, {
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
                  <p className="font-semibold text-base">{data.country}</p>
                </div>
                {data.location && (
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      {t("location")}
                    </p>
                    <p className="font-semibold text-base">{data.location}</p>
                  </div>
                )}
              </div>

              {data.welcomeMessage && (
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-muted-foreground text-sm">
                      {t("welcome-message")}
                    </p>
                  </div>
                  <blockquote className="border-primary/20 border-l-4 pl-4 text-muted-foreground italic">
                    {data.welcomeMessage}
                  </blockquote>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Activities */}
          <ProjectActivitiesList projectId={id} canEdit={canUpdate} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Participants Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                {t("participants")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {t("participants-description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ProjectDetailsSkeleton() {
  const t = useTranslations("project.details");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Project Header Skeleton */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-primary/60 to-accent p-8 shadow-xl">
        <div className="relative z-10">
          <Skeleton className="mb-4 h-6 w-24 bg-white/20" />
          <Skeleton className="mb-4 h-10 w-3/4 bg-white/20">
            {t("loading")}
          </Skeleton>
          <div className="flex gap-4">
            <Skeleton className="h-5 w-48 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Project Info Card Skeleton */}
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

          {/* Activities Skeleton */}
          <ProjectActivitiesListSkeleton />
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-24" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
