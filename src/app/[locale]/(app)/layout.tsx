import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CREATE_ORG_PATH, DASHBOARD_PATH } from "@/app/routes";
import {
  AppBreadcrumb,
  AppBreadcrumbSkeleton,
} from "@/components/app-breadcrumb";
import { AppSidebar, AppSidebarSkeleton } from "@/components/app-sidebar";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import {
  checkAuthAndOrgs,
  handleUnauthenticatedRedirect,
} from "@/features/authentication/utils";
import { redirect } from "@/lib/i18n/routing";
import { orpcQuery } from "@/lib/orpc/orpc";
import {
  getQueryClient,
  HydrateClient,
} from "@/lib/tanstack-react-query/hydration";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const { session, hasOrgs, rememberedPath } = await checkAuthAndOrgs();

  if (!session?.user) {
    const fallbackPath = DASHBOARD_PATH;
    const href = handleUnauthenticatedRedirect(rememberedPath, fallbackPath);
    redirect({
      href,
      locale,
    });
  }

  if (!hasOrgs) {
    redirect({
      href: CREATE_ORG_PATH,
      locale,
    });
  }

  const sidebarStateIsOpen =
    (await cookies()).get("sidebar_state")?.value === "true";

  // Prefetch all data needed by client components that use useSuspenseQuery.
  // Using await ensures data is in cache BEFORE dehydration, preventing hydration mismatches.
  // Components that need this data: AppBreadcrumb, AppSidebar (ProjectSwitcher, OrganizationSwitcher), Navbar (UserSession)
  const queryClient = getQueryClient();

  const prefetches = [
    queryClient.prefetchQuery(orpcQuery.betterauth.getSession.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.projects.list.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.list.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.getActive.queryOptions()),
  ];

  await Promise.all(prefetches);

  // Authenticated and has orgs -> allow rendering of the protected app
  return (
    <HydrateClient client={queryClient}>
      <LoadingProvider>
        <SidebarProvider
          className="flex h-screen"
          defaultOpen={sidebarStateIsOpen}
        >
          <ErrorBoundary fallback={<div>Failed to load sidebar.</div>}>
            <Suspense fallback={<AppSidebarSkeleton />}>
              <AppSidebar />
            </Suspense>
          </ErrorBoundary>
          <SidebarInset className="flex flex-col overflow-hidden">
            <div className="flex h-16 shrink-0 items-center gap-4 border-b px-4">
              <ErrorBoundary
                fallback={<div>Unable to load project breadcrumb</div>}
              >
                <Suspense fallback={<AppBreadcrumbSkeleton />}>
                  <AppBreadcrumb />
                </Suspense>
              </ErrorBoundary>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </LoadingProvider>

      <Toaster position="top-right" richColors />
    </HydrateClient>
  );
}
