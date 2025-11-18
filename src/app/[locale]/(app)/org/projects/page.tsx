import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ProjectsGrid } from "@/components/features/projects/projects-grid";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function ProjectsPage() {
  const t = await getTranslations("organization.projects");

  // Prefetch the projects data on the server
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    orpcQuery.project.list.queryOptions({ input: { sort_by: "createdAt" } }),
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-bold font-sans text-4xl">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Suspense fallback={<div>{t("suspense-loading")}</div>}>
        <ErrorBoundary fallback={<div>{t("error-message")}</div>}>
          <ProjectsGrid />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
