import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { ProjectsTab } from "@/components/features/projects/dashboard/projects-tab";
import { ProjectsTabSkeleton } from "@/components/features/projects/dashboard/projects-table";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { DEFAULT_PROJECT_SORT } from "@/config/projects";
import { auth } from "@/lib/better-auth";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/tanstack-react-query/hydration";

/**
 * Render the Projects page with server-side data prefetching and permission-aware UI.
 *
 * Prefetches the projects list, active organization, and organization role data into the query cache
 * and checks whether the current request has permission to create projects; the UI shows a
 * conditional CreateProjectButton when creation is allowed. The main content renders the ProjectsTab
 * wrapped in Suspense with an error boundary.
 *
 * @returns A React element representing the projects page layout (header, description, conditional create button, and the ProjectsTab content).
 */
export default async function ProjectsPage() {
  const t = await getTranslations("organization.projects");

  // Prefetch all required data on the server to prevent multiple Suspense triggers
  // Using await ensures data is in cache BEFORE dehydration
  const queryClient = getQueryClient();

  // Prefetch in parallel for better performance
  // IMPORTANT: Query options must match EXACTLY what ProjectsTab uses
  await Promise.all([
    queryClient.prefetchQuery(
      orpcQuery.projects.list.queryOptions({
        input: {
          sort_by: DEFAULT_PROJECT_SORT.column,
        },
      }),
    ),
    queryClient.prefetchQuery(orpcQuery.organizations.getActive.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.getRole.queryOptions()),
  ]);

  const { success: canCreate } = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        project: ["create"],
      },
    },
  });

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-3">
          <div className="flex items-center justify-start gap-3">
            <PROJECT_ICONS.projects className="size-8 sm:size-9 md:size-10" />
            <h2 className="font-bold font-sans text-2xl sm:text-3xl md:text-4xl">
              {t("title")}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            {t("description")}
          </p>
        </div>

        {canCreate && (
          <CreateProjectButton
            // className="hidden sm:inline-flex"
            showIcon={true}
            variant="secondary"
          />
        )}
      </div>
      <Suspense fallback={<ProjectsTabSkeleton />}>
        <ErrorBoundary fallback={<div>{t("error-message")}</div>}>
          <ProjectsTab />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}