"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, MapPinnedIcon, Users } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { orpcQuery } from "@/lib/orpc/orpc";

interface ProjectDetailsProps {
  id: string;
}

function ProjectDetails({ id }: ProjectDetailsProps) {
  const t = useTranslations("project.details");
  const { data } = useSuspenseQuery(
    orpcQuery.project.getById.queryOptions({
      input: {
        id,
      },
    }),
  );
  const format = useFormatter();

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="rounded-lg bg-gradient-to-tl from-primary/60 to-accent p-8 shadow-lg">
        <h1 className="mb-2 font-bold text-3xl">{data.name}</h1>
        <p className="text-lg">{data.country}</p>
      </div>

      {/* Project Details Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinnedIcon className="h-5 w-5" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-medium text-gray-600 text-sm">
                {t("start-date")}
              </Label>
              <p className="font-semibold text-lg">
                {format.dateTime(data.startDate, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-gray-600 text-sm">
                {t("end-date")}
              </Label>
              <p className="font-semibold text-lg">
                {format.dateTime(data.endDate, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {data.location && (
            <div className="space-y-2">
              <Label className="font-medium text-gray-600 text-sm">
                {t("location")}
              </Label>
              <p className="text-lg">{data.location}</p>
            </div>
          )}

          {data.welcomeMessage && (
            <div className="space-y-2">
              <Label className="font-medium text-gray-600 text-sm">
                {t("welcome-message")}
              </Label>
              <p className="rounded-md bg-muted p-4 text-lg italic">
                {data.welcomeMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for future features */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("participants")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">{t("participants-description")}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("activities")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">{t("activities-description")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProjectDetails;
