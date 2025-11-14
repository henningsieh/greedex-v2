import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ProjectsGrid } from "@/components/features/projects/projects-grid";
import { Link } from "@/lib/i18n/navigation";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function ProjectsPage() {
  // Prefetch the projects data on the server
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <ProjectsGrid />
        <Link href="/create-project">Create New Project</Link>
      </ErrorBoundary>
    </Suspense>
  );
}
