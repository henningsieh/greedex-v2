"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3Icon,
  Building2Icon,
  Edit2Icon,
  LayoutDashboardIcon,
  MapPinnedIcon,
  SettingsIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { EditProjectForm } from "@/components/features/projects/edit-project-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CREATE_PROJECT_PATH,
  DASHBOARD_PATH,
  LIVE_VIEW_PATH,
  PROJECTS_PATH,
  SETTINGS_PATH,
  TEAM_PATH,
} from "@/config/AppRoutes";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { Link, usePathname } from "@/lib/i18n/routing";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { cn } from "@/lib/utils";

/**
 * Direct mapping from route translation keys to icons.
 * This avoids complex nested lookups.
 */
const orgRouteKeyToIcon: Record<
  "dashboard" | "projects" | "team" | "settings",
  LucideIcon
> = {
  dashboard: LayoutDashboardIcon,
  projects: MapPinnedIcon,
  team: UsersIcon,
  settings: SettingsIcon,
};

/**
 * Determines the breadcrumb context level based on pathname.
 */
type BreadcrumbLevel = "organization" | "project";

function getBreadcrumbLevel(pathname: string): BreadcrumbLevel {
  // Liveview route is project-specific
  if (pathname === LIVE_VIEW_PATH || pathname.startsWith("/org/activeproject/liveview")) {
    return "project";
  }
  return "organization";
}

/**
 * Gets the organization route translation key based on pathname.
 */
function getOrganizationRouteKey(
  pathname: string,
): "dashboard" | "projects" | "team" | "settings" | null {
  if (pathname === DASHBOARD_PATH || pathname.startsWith("/org/dashboard")) {
    return "dashboard";
  }
  if (pathname === PROJECTS_PATH || pathname.startsWith("/org/projects")) {
    return "projects";
  }
  if (pathname === TEAM_PATH || pathname.startsWith("/org/team")) {
    return "team";
  }
  if (pathname === SETTINGS_PATH || pathname.startsWith("/org/settings")) {
    return "settings";
  }
  return null;
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("app.sidebar");

  const level = getBreadcrumbLevel(pathname);
  const isProjectLevel = level === "project";

  // Fetch active organization
  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  // Fetch session and projects for active project info
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  const { data: projects } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions(),
  );

  const activeProject = projects?.find(
    (project) => project.id === session?.session.activeProjectId,
  );

  // Permission helpers for project level actions
  const {
    canCreate,
    canUpdate,
    canDelete,
    isPending: permissionsPending,
  } = useProjectPermissions();

  console.debug("project permissions", {
    canUpdate,
    canDelete,
    permissionsPending,
  });

  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteProjectMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: () =>
        orpc.projects.delete({
          id: activeProject?.id ?? "",
        }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success("Project deleted");
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
        } else {
          toast.error("Unable to delete project");
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || "Unable to delete project");
      },
    });

  // Determine which organization route we're on and get its icon
  const orgRouteKey = getOrganizationRouteKey(pathname);
  const OrgRouteIcon = orgRouteKey ? orgRouteKeyToIcon[orgRouteKey] : null;

  // Determine if we're on liveview page
  const isLiveView = pathname === LIVE_VIEW_PATH;

  // Color classes based on level
  const primaryColorClasses = isProjectLevel
    ? "text-secondary hover:text-secondary-foreground"
    : "text-primary hover:text-primary-foreground";

  const iconBgClasses = isProjectLevel
    ? "bg-secondary/30 text-secondary-foreground"
    : "bg-primary/40 text-primary-foreground";

  const separatorClasses = isProjectLevel
    ? "text-secondary/50"
    : "text-primary/50";

  const pageColorClasses = isProjectLevel
    ? "text-secondary dark:text-secondary-foreground"
    : "text-primary dark:text-primary-foreground";

  return (
    <div className="flex w-full items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          {/* First breadcrumb: Organization name */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href={DASHBOARD_PATH}
                className={cn(
                  "flex items-center gap-2 transition-colors duration-300",
                  primaryColorClasses,
                )}
              >
                <span className={cn("rounded-full p-1.5", iconBgClasses)}>
                  <Building2Icon className="size-4" />
                </span>
                <span className="font-semibold text-base">
                  {activeOrganization?.name ?? "Organization"}
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className={separatorClasses} />

          {/* Second breadcrumb: Route or Project name */}
          {isProjectLevel ? (
            // Project level: show project name
            <>
              <BreadcrumbItem>
                {activeProject ? (
                  isLiveView ? (
                    // If on liveview, project name is a link to project details
                    <BreadcrumbLink asChild>
                      <Link
                        href={`/org/projects/${activeProject.id}` as "/org/projects/[id]"}
                        className={cn(
                          "flex items-center gap-2 transition-colors duration-300",
                          primaryColorClasses,
                        )}
                      >
                        <MapPinnedIcon className="size-4" />
                        <span className="font-semibold">
                          {activeProject.name}
                        </span>
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    // Project name as current page (shouldn't happen anymore, but keeping as fallback)
                    <BreadcrumbPage
                      className={cn("flex items-center gap-2", pageColorClasses)}
                    >
                      <MapPinnedIcon className="size-4" />
                      <span className="font-semibold">{activeProject.name}</span>
                    </BreadcrumbPage>
                  )
                ) : (
                  <span className="flex items-center gap-2 text-rose-500/80">
                    <TriangleAlertIcon className="size-4" />
                    <span className="font-semibold italic">
                      No project selected
                    </span>
                  </span>
                )}
              </BreadcrumbItem>

              {/* Third breadcrumb: Liveview (only if on liveview page) */}
              {isLiveView && activeProject && (
                <>
                  <BreadcrumbSeparator className={separatorClasses} />
                  <BreadcrumbItem>
                    <BreadcrumbPage
                      className={cn("flex items-center gap-2", pageColorClasses)}
                    >
                      <BarChart3Icon className="size-4" />
                      <span className="font-semibold">
                        {t("projects.liveView")}
                      </span>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </>
          ) : (
            // Organization level: show current route
            <BreadcrumbItem>
              {orgRouteKey && OrgRouteIcon ? (
                <BreadcrumbPage
                  className={cn("flex items-center gap-2", pageColorClasses)}
                >
                  <OrgRouteIcon className="size-4" />
                  <span className="font-semibold">
                    {t(`organization.${orgRouteKey}`)}
                  </span>
                </BreadcrumbPage>
              ) : (
                <BreadcrumbPage className={cn("font-semibold", pageColorClasses)}>
                  {pathname}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Action toolbar right-aligned */}
      <div className="flex items-center gap-2">
        {isProjectLevel ? (
          // Project-level actions (Edit / Delete)
          activeProject ? (
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondaryghost"
                    className="border-secondary/40 text-secondary"
                    disabled={!canUpdate || permissionsPending}
                  >
                    <Edit2Icon className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Edit</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit project</DialogTitle>
                  </DialogHeader>
                  <EditProjectForm project={activeProject} onSuccess={() => {}} />
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  const confirmed = await confirm({
                    title: "Delete project",
                    description: `Delete project ${activeProject?.name}?`,
                    confirmText: "Delete",
                    cancelText: "Cancel",
                    isDestructive: true,
                  });
                  if (confirmed) {
                    try {
                      await deleteProjectMutation();
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }}
                disabled={!canDelete || isDeleting || permissionsPending}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
              <ConfirmDialogComponent />
            </div>
          ) : null
        ) : (
          // Organization-level actions
          canCreate &&
          pathname !== CREATE_PROJECT_PATH && (
            <CreateProjectButton
              className="hidden sm:inline-flex"
              variant="secondary"
              showIcon={true}
            />
          )
        )}
      </div>
    </div>
  );
}

export function AppBreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="size-7 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
      <Skeleton className="h-4 w-4 rounded-md" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
    </div>
  );
}
