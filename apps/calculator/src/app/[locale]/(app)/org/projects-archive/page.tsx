/**
 * @file Projects archive page
 *
 * Organization archived projects page
 */

import { getTranslations } from "@greendex/i18n";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ContentContainer } from "@/components/content-container";
import { PageHeader } from "@/components/page-header";
import {
  ArchivedProjects,
  ArchivedProjectsSkeleton,
} from "@/features/projects/components/dashboard/archived-projects";
import { PROJECT_ICONS } from "@/features/projects/components/project-icons";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/tanstack-react-query/hydration";

export default async function ProjectsArchivePage() {
  const t = await getTranslations("organization.projectsArchive");

  // Prefetch the projects data on the server
  // Using await ensures data is in cache BEFORE dehydration
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    orpcQuery.projects.list.queryOptions({
      input: {
        sort_by: "createdAt",
      },
    }),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<PROJECT_ICONS.archive />}
        title={t("title")}
        description={t("description")}
      />
      <ContentContainer width="lg">
        <Suspense fallback={<ArchivedProjectsSkeleton />}>
          <ErrorBoundary fallback={<div>{t("error-message")}</div>}>
            <ArchivedProjects />
          </ErrorBoundary>
        </Suspense>
      </ContentContainer>
    </div>
  );
}
