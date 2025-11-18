import { headers } from "next/headers";
import { Suspense } from "react";
import ActiveProjectHeaderClient, {
  ActiveProjectHeaderClientSkeleton,
} from "@/components/features/projects/ActiveProjectHeaderClient";
import { auth } from "@/lib/better-auth";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient } from "@/lib/react-query/hydration";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  // Resolve session and active project on the server so the client header
  // receives a required `activeProject` prop (stable for SSR hydration).
  const session = await auth.api.getSession({ headers: await headers() });
  const projects = await orpc.project.list();
  const activeProjectId = session?.session.activeProjectId;
  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  // Prefetch data used by suspended client components (keeps hydration stable)
  void queryClient.prefetchQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  return (
    <>
      <Suspense fallback={<ActiveProjectHeaderClientSkeleton />}>
        {activeProject ? (
          <ActiveProjectHeaderClient activeProject={activeProject} />
        ) : (
          <ActiveProjectHeaderClientSkeleton />
        )}
      </Suspense>
      {children}
    </>
  );
}
