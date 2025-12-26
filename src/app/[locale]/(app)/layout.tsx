import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  AppBreadcrumb,
  AppBreadcrumbSkeleton,
} from "@/components/app-breadcrumb";
import { AppSidebar, AppSidebarSkeleton } from "@/components/app-sidebar";
import { Navbar } from "@/components/navbar";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { CREATE_ORG_PATH, DASHBOARD_PATH } from "@/config/app-routes";
import { redirect } from "@/lib/i18n/routing";
import { orpcQuery } from "@/lib/orpc/orpc";
import {
  getQueryClient,
  HydrateClient,
} from "@/lib/tanstack-react-query/hydration";
import {
  checkAuthAndOrgs,
  handleUnauthenticatedRedirect,
} from "@/lib/utils/auth-utils";

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
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <LoadingProvider>
          <SidebarProvider
            className="min-h-[calc(svh-4rem)]"
            defaultOpen={sidebarStateIsOpen}
          >
            <ErrorBoundary fallback={<div>Failed to load sidebar.</div>}>
              <Suspense fallback={<AppSidebarSkeleton />}>
                <AppSidebar />
              </Suspense>
            </ErrorBoundary>
            <SidebarInset>
              <main className="flex-1 flex-col">
                <div className="flex h-16 items-center gap-4 border-b py-2 pr-4 pl-2 md:pl-4 lg:pl-6 xl:pl-8">
                  {/* <SidebarTrigger
                    className={cn(
                      "size-11 border border-secondary/50 ring-secondary transition-colors duration-200",
                      "hover:bg-secondary hover:text-secondary-foreground dark:hover:bg-secondary/50",
                    )}
                  /> */}
                  <ErrorBoundary
                    fallback={<div>Unable to load project breadcrumb</div>}
                  >
                    <Suspense fallback={<AppBreadcrumbSkeleton />}>
                      <AppBreadcrumb />
                    </Suspense>
                  </ErrorBoundary>
                </div>
                <div className="space-y-8 p-2 md:p-4 lg:p-6 xl:p-8">
                  {children}
                </div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </LoadingProvider>

        <Toaster position="top-right" richColors />
      </div>
    </HydrateClient>
  );
}
