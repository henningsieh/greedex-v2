import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ProjectsGrid } from "@/components/features/projects/projects-grid";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function ProjectsPage() {
  // Prefetch the projects data on the server
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-bold text-4xl">All Projects</h2>
        <p className="text-muted-foreground">
          List of projects of your organization.
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Something went wrong.</div>}>
          <ProjectsGrid />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
