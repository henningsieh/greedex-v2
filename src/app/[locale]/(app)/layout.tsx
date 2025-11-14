import { cookies, headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ActiveProjectBreadcrumb,
  BreadcrumbSkeleton,
} from "@/components/active-project-breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/navbar";
import { LoadingProvider } from "@/components/providers/loading-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/better-auth";
import { redirect } from "@/lib/i18n/navigation";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/react-query/hydration";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  // Ensure the user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    // Not authenticated -> send to login (auth group).
    // The (auth) directory is a route group, its login page is at '/login'.
    redirect({ href: "/login", locale });
  }

  // If authenticated, ensure they have an organization
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const hasOrgs = Array.isArray(organizations) && organizations.length > 0;

  if (!hasOrgs) {
    // Authenticated but no orgs -> create one
    redirect({ href: "/org/create", locale });
  }

  // Prefetch data on the server
  const queryClient = getQueryClient();

  // Prefetch session data - this is critical for hydration!
  // Better Auth's useSession hook will use this prefetched data on the client
  await queryClient.prefetchQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => session,
  });

  // Prefetch projects
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // Authenticated and has orgs -> allow rendering of the protected app
  return (
    <HydrateClient client={queryClient}>
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <LoadingProvider>
          <SidebarProvider
            defaultOpen={defaultOpen}
            className="min-h-[calc(svh-4rem)]"
          >
            <ErrorBoundary fallback={<div>Failed to load sidebar.</div>}>
              <Suspense fallback="loading sidebar...">
                <AppSidebar />
              </Suspense>
            </ErrorBoundary>
            <SidebarInset>
              <main className="flex-1 flex-col">
                <div className="flex items-center gap-4 border-b p-2 pl-0">
                  <SidebarTrigger />
                  <Suspense fallback={<BreadcrumbSkeleton />}>
                    <ActiveProjectBreadcrumb />
                  </Suspense>
                </div>
                <div className="p-2 md:p-4 lg:p-6 xl:p-8">{children}</div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </LoadingProvider>

        <Toaster richColors position="top-right" />
      </div>
    </HydrateClient>
  );
}
