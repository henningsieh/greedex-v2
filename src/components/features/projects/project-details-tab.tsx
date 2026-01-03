import { MessageSquareIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Blockquote, BlockquoteAuthor } from "@/components/block-quote";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectType } from "@/features/projects";

interface ProjectDetailsProps {
  project: ProjectType;
}

/**
 * Render a card showing key details for a project.
 *
 * @param project - The project object whose details will be displayed
 * @returns A card element containing the project's start and end dates, country, optional location, and optional welcome message
 */
export function ProjectDetailsTab({ project }: ProjectDetailsProps) {
  const t = useTranslations("project.details");
  const format = useFormatter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PROJECT_ICONS.project className="h-5 w-5 text-secondary" />
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
              <p className="font-semibold text-base">{project.location}</p>
            </div>
          )}
        </div>

        {project.welcomeMessage && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MessageSquareIcon className="h-4 w-4 text-secondary" />
              <p className="font-medium text-sm">{t("welcome-message")}</p>
            </div>
            <Blockquote>
              {project.welcomeMessage}
              <BlockquoteAuthor>— {project.responsibleUserId}</BlockquoteAuthor>
            </Blockquote>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
