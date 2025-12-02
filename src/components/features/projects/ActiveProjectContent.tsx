"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPinnedIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import ActiveProjectHeaderClient from "@/components/features/projects/ActiveProjectHeaderClient";
import ParticipationControlsClient from "@/components/features/projects/ParticipationControlsClient";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { orpcQuery } from "@/lib/orpc/orpc";

/**
 * Client component that renders the active project content
 * Uses useSuspenseQuery to leverage server-side prefetched data
 * without hydration mismatches
 *
 * Reactively updates when session query is invalidated (e.g., after setActiveProject)
 */
export default function ActiveProjectContent() {
  const t = useTranslations("organization.projects.activeProject");
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );

  const { data: projects } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions(),
  );

  const activeProjectId = session?.session.activeProjectId;
  const activeProject = projects?.find(
    (project) => project.id === activeProjectId,
  );

  return (
    <>
      {activeProject && activeProjectId ? (
        <>
          <ActiveProjectHeaderClient activeProject={activeProject} />
          <ParticipationControlsClient activeProjectId={activeProjectId} />
        </>
      ) : (
        <div className="rounded-md border border-secondary/70 bg-secondary/10 p-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="default">
                <MapPinnedIcon className="size-16 text-secondary-foreground" />
              </EmptyMedia>
              <EmptyTitle>{t("emptyState.title")}</EmptyTitle>
              <EmptyDescription>{t("emptyState.description")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </>
  );
}
