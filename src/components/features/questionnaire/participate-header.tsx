"use client";

import { Location } from "@/components/location";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateActivitiesCO2 } from "@/features/projects/utils";
import type { Project } from "@/features/questionnaire/types";
import { Factory, LeafIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface ParticipateHeaderProps {
  project: Project;
}

/**
 * Render the participation header for a project, showing a badge, localized titles, the project name with optional location, and an activities CO₂ baseline when present.
 *
 * @param project - Project to display; this component reads `project.name`, optional `project.location`, and `project.activities` to compute and present the emissions baseline.
 * @returns The header JSX element containing the badge, title/subtitle, project name (and inline or badge location) and, when activities produce CO₂, a card showing the calculated baseline value and per-activity breakdown.
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
            <span className="text-[10px] font-medium tracking-wider text-teal-600 uppercase dark:text-teal-400">
              {t("header.badge")}
            </span>
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            {t("header.title")} <span className="mx-1 opacity-30"> | </span>{" "}
            {t("header.subtitle")}
          </p>
        </div>
      </div>

      <Card className="flex w-full flex-col gap-0 overflow-hidden py-0 md:flex-row md:py-6">
        {/* Left Side: Project Name */}
        <div className="flex flex-1 items-center justify-start p-6">
          <h1 className="text-center text-2xl leading-tight font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {project.name}
            {project.location && (
              <Location
                className="ml-2 md:hidden"
                countryCode={project.country}
                locale={locale}
                location={project.location}
                showFlag
              />
            )}{" "}
          </h1>
        </div>

        {/* Right Side: Location & Emissions */}
        <div className="hidden min-h-50 flex-col justify-between border-t bg-muted/20 py-3 md:flex md:w-[40%] md:border-t-0 md:border-l lg:w-[35%]">
          <CardHeader>
            <div className="flex justify-end">
              {project.location && (
                <Location
                  countryCode={project.country}
                  locale={locale}
                  location={project.location}
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
                        <span className="text-sm font-medium">
                          {t("project-activities.title")}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-lg font-bold text-foreground/90">
                          +{projectActivitiesCO2.toFixed(1)} kg CO₂
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[10px] font-medium tracking-wide text-muted-foreground/60 uppercase">
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
