"use client";

import { Factory, Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Project } from "@/components/participate/questionnaire-types";
import { Card } from "@/components/ui/card";
import { calculateActivitiesCO2 } from "@/lib/utils/project-utils";

interface ParticipateHeaderProps {
  project: Project;
}

export function ParticipateHeader({ project }: ParticipateHeaderProps) {
  const t = useTranslations("participation.questionnaire");
  const projectActivitiesCO2 = calculateActivitiesCO2(project.activities);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 px-6 py-2">
          <Leaf className="h-5 w-5 text-teal-400" />
          <span className="font-semibold text-sm text-teal-400">
            {t("header.badge")}
          </span>
        </div>
        <h1 className="mb-1 font-bold text-4xl text-foreground sm:text-4xl md:text-3xl lg:text-4xl">
          {t("header.title")}
        </h1>
        <h1 className="mb-2 font-bold text-foreground text-xl sm:text-3xl md:text-2xl lg:text-3xl">
          {t("header.subtitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{project.name}</p>
        {project.location && (
          <p className="text-muted-foreground text-sm">
            {project.location}, {project.country}
          </p>
        )}
      </div>

      {/* Project Activities Baseline Info */}
      {projectActivitiesCO2 > 0 && (
        <Card className="mx-auto max-w-2xl border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4">
          <div className="space-y-2 text-center">
            <h3 className="font-semibold text-foreground text-lg">
              {t("project-activities.title")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("project-activities.description")}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Factory className="h-5 w-5 text-blue-400" />
              <span className="font-bold font-mono text-2xl text-blue-400">
                +{projectActivitiesCO2.toFixed(1)} kg CO₂
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              {t("project-activities.note")}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
