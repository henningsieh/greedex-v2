import { cookies, headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ActiveProjectBreadcrumb,
  BreadcrumbSkeleton,
} from "@/components/active-project-breadcrumb";
import { AppSidebar, AppSidebarSkeleton } from "@/components/app-sidebar";
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
import { cn } from "@/lib/utils";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const requestHeaders = await headers();
  const rememberedPath =
    requestHeaders.get("x-org-requested-path") ?? undefined;
  console.debug("Remembered path from header:", rememberedPath);
  // Ensure the user is authenticated
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    // Not authenticated -> send to login (auth group).
    // The (auth) directory is a route group, its login page is at '/login'.
    const fallbackPath = `/${locale}/org/dashboard`;
    const nextPageUrl = rememberedPath ?? fallbackPath;
    redirect({
      href: `/login?nextPageUrl=${encodeURIComponent(nextPageUrl)}`,
      locale,
    });
  }

  // If authenticated, ensure they have an organization
  let hasOrgs = false;
  try {
    const organizations = await auth.api.listOrganizations({
      headers: await headers(),
    });
    hasOrgs = Array.isArray(organizations) && organizations.length > 0;
  } catch (err) {
    hasOrgs = false;
    console.error("Session creation without having organizations:", err);
  }

  if (!hasOrgs) {
    // Authenticated but no orgs -> send to org setup flow (different route group)
    redirect({ href: "/org/create", locale });
  }

  // Prefetch data for all suspended client components
  // This enables server-side Suspense without hydration errors
  // Components using these queries: ActiveProjectBreadcrumb, DashboardHeader, ProjectSwitcher, OrganizationSwitcher
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  void queryClient.prefetchQuery(orpcQuery.organization.list.queryOptions());
  void queryClient.prefetchQuery(orpcQuery.project.list.queryOptions());

  const defaultOpen = (await cookies()).get("sidebar_state")?.value === "true";

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
              <Suspense fallback={<AppSidebarSkeleton />}>
                <AppSidebar />
              </Suspense>
            </ErrorBoundary>
            <SidebarInset>
              <main className="flex-1 flex-col">
                <div className="flex h-16 items-center gap-4 border-b py-2 pl-2 md:pl-4 lg:pl-6">
                  <SidebarTrigger
                    className={cn(
                      "size-11 border border-secondary/50 ring-secondary transition-colors duration-200",
                      "hover:bg-secondary hover:text-secondary-foreground dark:hover:bg-secondary/50",
                    )}
                  />
                  <Suspense fallback={<BreadcrumbSkeleton />}>
                    <ActiveProjectBreadcrumb />
                  </Suspense>
                </div>
                <div className="space-y-8 p-2 md:p-4 lg:p-6 xl:p-8">
                  {children}
                </div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </LoadingProvider>

        <Toaster richColors position="top-right" />
      </div>
    </HydrateClient>
  );
}
