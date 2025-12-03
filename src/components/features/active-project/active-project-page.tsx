"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPinnedIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import ActiveProjectHeader from "@/components/features/active-project/active-project-header";
import ParticipantsLinkControls from "@/components/features/participants/participants-link-controls";
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
export default function ActiveProjectPage() {
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
          <ActiveProjectHeader activeProject={activeProject} />
          <ParticipantsLinkControls activeProjectId={activeProjectId} />
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
