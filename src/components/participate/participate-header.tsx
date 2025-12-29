"use client";

import { Factory, LeafIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Project } from "@/components/participate/questionnaire-types";
import { ProjectLocation } from "@/components/project-location";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { calculateActivitiesCO2 } from "@/lib/utils/project-utils";

interface ParticipateHeaderProps {
  project: Project;
}

/**
 * Render the participation header for a project, showing title, badge, project name and optional location, and an activities CO₂ baseline when applicable.
 *
 * @param project - Project object to display; uses `project.name`, `project.location`, `project.country`, and `project.activities`
 * @returns A header JSX element containing the badge, translated titles, project name/location, and — if the calculated activities CO₂ is greater than zero — a card showing the baseline CO₂ value formatted with one decimal place (prefixed with `+` and suffixed with `kg CO₂`).
 */
export function ParticipateHeader({ project }: ParticipateHeaderProps) {
  const tActivities = useTranslations("project.activities");
  const t = useTranslations("participation.questionnaire");
  const locale = useLocale();
  const projectActivitiesCO2 = calculateActivitiesCO2(project.activities);

  return (
    <div className="pb-8">
      {/* Header Group */}
      <div className="flex flex-col items-center text-center">
        {/* Badge & System Title - Reduced prominence */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5">
            <LeafIcon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span className="font-medium text-[10px] text-teal-600 uppercase tracking-wider dark:text-teal-400">
              {t("header.badge")}
            </span>
          </div>
          <h2 className="font-medium text-lg text-muted-foreground">
            {t("header.title")} <span className="mx-1 opacity-30">|</span>{" "}
            {t("header.subtitle")}
          </h2>
        </div>
      </div>

      <Card className="flex w-full flex-col gap-0 overflow-hidden py-0 md:flex-row md:py-6">
        {/* Left Side: Project Name */}
        <div className="flex flex-1 items-center justify-start p-6">
          <h1 className="text-center font-bold text-2xl text-foreground leading-tight tracking-tight sm:text-3xl md:text-4xl">
            {project.name}
            <h1 className="text-center font-bold text-2xl text-foreground leading-tight tracking-tight sm:text-3xl md:text-4xl">
              {project.name}
              <h1 className="text-center font-bold text-2xl text-foreground leading-tight tracking-tight sm:text-3xl md:text-4xl">
                {project.name}
                {project.location && (
                  <ProjectLocation
                    className="ml-2 md:hidden"
                    locale={locale}
                    project={project}
                    showFlag
                    variant="inline"
                  />
                )}
              </h1>
            </h1>
          </h1>
        </div>

        {/* Right Side: Location & Emissions */}
        <div className="hidden min-h-[200px] flex-col justify-between border-t bg-muted/20 py-3 md:flex md:w-[40%] md:border-t-0 md:border-l lg:w-[35%]">
          <CardHeader>
            <div className="flex justify-end">
              {project.location && (
                <ProjectLocation
                  locale={locale}
                  project={project}
                  showFlag
                  variant="badge"
                />
              )}
            </div>
          </CardHeader>

          <CardFooter>
            {projectActivitiesCO2 > 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full space-y-4 rounded-lg border border-border/40 bg-background/50 px-4 py-3 text-center transition-colors hover:bg-secondary/10">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-2 text-muted-foreground/80">
                        <Factory className="h-3.5 w-3.5" />
                        <span className="font-medium text-sm">
                          {t("project-activities.title")}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="font-bold font-mono text-foreground/90 text-lg">
                          +{projectActivitiesCO2.toFixed(1)} kg CO₂
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 font-medium text-[10px] text-muted-foreground/60 uppercase tracking-wide">
                      {t("project-activities.note")}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="mb-2 font-medium">{tActivities("title")}</p>
                    <div className="space-y-1">
                      {project.activities.map((activity) => (
                        <div
                          className="flex justify-between text-sm"
                          key={activity.id}
                        >
                          <span>
                            {tActivities(`types.${activity.activityType}`)}
                          </span>
                          <span>{activity.distanceKm} km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="w-full origin-bottom scale-90 opacity-70">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle className="text-sm">
                      {t("project-activities.empty.title")}
                    </EmptyTitle>
                    <EmptyDescription className="text-xs">
                      {t("project-activities.empty.description")}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}
