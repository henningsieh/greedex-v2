"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  Building2Icon,
  Edit2Icon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  SettingsIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { EditProjectForm } from "@/components/features/projects/edit-project-form";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
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
  PROJECTS_PATH,
  SETTINGS_PATH,
  TEAM_PATH,
} from "@/config/AppRoutes";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { Link, usePathname } from "@/lib/i18n/routing";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { cn } from "@/lib/utils";

/**
 * Route configuration with icons and translation keys.
 * This is the single source of truth for org-level routes.
 */
const ORG_ROUTES = {
  dashboard: {
    path: DASHBOARD_PATH,
    icon: LayoutDashboardIcon,
    translationKey: "dashboard",
  },
  projects: {
    path: PROJECTS_PATH,
    icon: PROJECT_ICONS.projects,
    translationKey: "projects",
  },
  team: {
    path: TEAM_PATH,
    icon: UsersIcon,
    translationKey: "team",
  },
  settings: {
    path: SETTINGS_PATH,
    icon: SettingsIcon,
    translationKey: "settings",
  },
  "create-project": {
    path: CREATE_PROJECT_PATH,
    icon: PlusCircleIcon,
    translationKey: "createproject",
  },
} as const;

type OrgRouteKey = keyof typeof ORG_ROUTES;

/**
 * Extract route information from pathname using path segments.
 */
function parsePathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  // Extract org segment (/org/...)
  if (segments[0] !== "org") {
    return null;
  }

  const section = segments[1] as OrgRouteKey | undefined;
  const projectId = section === "projects" ? segments[2] : null;

  return {
    section,
    projectId,
    isProjectDetail: section === "projects" && !!projectId,
    isKnownRoute: section ? section in ORG_ROUTES : false,
  };
}

/**
 * Render the application breadcrumb and right-aligned action toolbar.
 * Breadcrumbs reflect the current URL path only - no session or active project dependency.
 *
 * @returns The breadcrumb and action toolbar JSX element.
 */
export function AppBreadcrumb() {
  const pathname = usePathname();
  const pathInfo = parsePathname(pathname);
  const isProjectDetail = pathInfo?.isProjectDetail ?? false;

  // If we're on a project detail page, render with project data
  if (isProjectDetail && pathInfo?.projectId) {
    return <AppBreadcrumbWithProject projectId={pathInfo.projectId} />;
  }

  // Otherwise, render organization-level breadcrumb
  return <AppBreadcrumbOrgLevel pathname={pathname} pathInfo={pathInfo} />;
}

/**
 * Breadcrumb for organization-level routes (no project needed)
 */
function AppBreadcrumbOrgLevel({
  pathname,
  pathInfo,
}: {
  pathname: string;
  pathInfo: ReturnType<typeof parsePathname>;
}) {
  const t = useTranslations("app.sidebar");

  // Fetch active organization
  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  const { canCreate } = useProjectPermissions();

  // Get route configuration if we're on a known org route
  const routeConfig = pathInfo?.section ? ORG_ROUTES[pathInfo.section] : null;

  const primaryColorClasses = "text-primary hover:text-primary-foreground";
  const iconBgClasses = "bg-primary/40 text-primary-foreground";
  const separatorClasses = "text-primary/50";
  const pageColorClasses = "text-primary dark:text-primary-foreground";

  return (
    <div className="flex w-full items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Organization name */}
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

          {/* Current org route */}
          {routeConfig ? (
            <BreadcrumbItem>
              <BreadcrumbPage
                className={cn("flex items-center gap-2", pageColorClasses)}
              >
                <routeConfig.icon className="size-4" />
                <span className="font-semibold">
                  {t(`organization.${routeConfig.translationKey}`)}
                </span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage className={cn("font-semibold", pageColorClasses)}>
                {pathInfo?.section ?? pathname}
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Action toolbar */}
      <div className="flex items-center gap-2">
        {canCreate && pathInfo?.section !== "create-project" && (
          <CreateProjectButton
            className="hidden sm:inline-flex"
            variant="secondary"
            showIcon={true}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Breadcrumb for project detail routes (requires project data)
 */
function AppBreadcrumbWithProject({ projectId }: { projectId: string }) {
  const t = useTranslations("app.sidebar");

  // Fetch active organization
  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  // Fetch project data
  const { data: currentProject } = useSuspenseQuery(
    orpcQuery.projects.getById.queryOptions({
      input: { id: projectId },
    }),
  );

  // Permission helpers
  const {
    canUpdate,
    canDelete,
    isPending: permissionsPending,
  } = useProjectPermissions();

  const [open, setOpen] = useState(false);

  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteProjectMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: () =>
        orpc.projects.delete({
          id: currentProject.id,
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

  const primaryColorClasses = "text-secondary hover:text-secondary-foreground";
  const iconBgClasses = "bg-secondary/30 text-secondary-foreground";
  const separatorClasses = "text-secondary/50";
  const pageColorClasses = "text-secondary dark:text-secondary-foreground";

  return (
    <div className="flex w-full items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Organization name */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href={DASHBOARD_PATH}
                className={cn(
                  "flex items-center gap-2 transition-colors duration-300",
                  primaryColorClasses,
                )}
              >
                <span className={cn("rounded-md p-1.5", iconBgClasses)}>
                  <Building2Icon className="size-4" />
                </span>
                <span className="font-semibold text-base">
                  {activeOrganization?.name ?? "Organization"}
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className={separatorClasses} />

          {/* Projects */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href={PROJECTS_PATH}
                className={cn(
                  "flex items-center gap-2 transition-colors duration-300",
                  primaryColorClasses,
                )}
              >
                <PROJECT_ICONS.projects className="size-4" />
                <span className="font-semibold">
                  {t("organization.projects")}
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className={separatorClasses} />

          {/* Project name */}
          <BreadcrumbItem>
            <BreadcrumbPage
              className={cn("flex items-center gap-2", pageColorClasses)}
            >
              <PROJECT_ICONS.project className="size-4" />
              <span className="font-semibold">{currentProject.name}</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Action toolbar */}
      <div className="flex items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
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
            <EditProjectForm
              project={currentProject}
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Button
          size="sm"
          variant="destructive"
          onClick={async () => {
            const confirmed = await confirm({
              title: "Delete project",
              description: `Delete project ${currentProject.name}?`,
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
