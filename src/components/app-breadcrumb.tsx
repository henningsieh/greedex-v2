"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Building2Icon } from "lucide-react";

import { useTranslations } from "next-intl";
import {
  DASHBOARD_PATH,
  PARTICIPANTS_PATH,
  PROJECTS_ARCHIVE_PATH,
  PROJECTS_PATH,
  SETTINGS_PATH,
  TEAM_PATH,
} from "@/app/routes";
import { ORGANIZATION_ICONS } from "@/components/features/organizations/organization-icons";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, usePathname } from "@/lib/i18n/routing";
import { orpcQuery } from "@/lib/orpc/orpc";

/**
 * Get the current section info based on pathname
 */
function getCurrentSection(
  pathname: string,
  translate: (key: string) => string,
): { label: string; icon?: LucideIcon } | null {
  switch (pathname) {
    case DASHBOARD_PATH:
      return {
        label: translate("organization.dashboard"),
        icon: ORGANIZATION_ICONS.dashboard,
      };
    case TEAM_PATH:
      return {
        label: translate("organization.team"),
        icon: ORGANIZATION_ICONS.team,
      };
    case SETTINGS_PATH:
      return {
        label: translate("organization.settings"),
        icon: ORGANIZATION_ICONS.settings,
      };
    case PROJECTS_PATH:
      return {
        label: translate("projects.projects"),
        icon: PROJECT_ICONS.projects,
      };
    case PROJECTS_ARCHIVE_PATH:
      return {
        label: translate("projects.archive"),
        icon: PROJECT_ICONS.archive,
      };
    case PARTICIPANTS_PATH:
      return {
        label: translate("projects.participants"),
        icon: PROJECT_ICONS.participants,
      };
    default:
      return null;
  }
}

/**
 * Render the application breadcrumb navigation.
 * Shows organization > section > project hierarchy based on current URL.
 *
 * @returns The breadcrumb navigation JSX element.
 */
export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Check if we're on a project detail page (/org/projects/[id])
  const isProjectDetail =
    segments[0] === "org" && segments[1] === "projects" && segments[2];
  const projectId = isProjectDetail ? segments[2] : null;

  if (projectId) {
    return <ProjectBreadcrumb projectId={projectId} />;
  }

  return <OrgBreadcrumb />;
}

/**
 * Breadcrumb for organization-level routes (no project needed)
 */
function OrgBreadcrumb() {
  const t = useTranslations("app.sidebar");
  const pathname = usePathname();

  // Fetch active organization
  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  // Determine current section based on pathname
  const currentSection = getCurrentSection(pathname, t);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Organization name */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              className="flex items-center gap-2 text-primary transition-colors duration-300 hover:text-primary-foreground"
              href={DASHBOARD_PATH}
            >
              <span className="rounded-full bg-primary/40 p-1.5 text-primary-foreground">
                <Building2Icon className="size-4" />
              </span>
              <span className="font-semibold text-base">
                {activeOrganization?.name ?? "Organization"}
              </span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Current section */}
        {currentSection && (
          <>
            <BreadcrumbSeparator className="text-primary/50" />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2 text-primary dark:text-primary-foreground">
                {currentSection.icon && (
                  <currentSection.icon className="size-4" />
                )}
                <span className="font-semibold">{currentSection.label}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Breadcrumb for project detail routes (shows project hierarchy)
 */
function ProjectBreadcrumb({ projectId }: { projectId: string }) {
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

  return (
    <div className="flex w-full items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Organization name */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                className="flex items-center gap-2 text-secondary transition-colors duration-300 hover:text-secondary-foreground"
                href={DASHBOARD_PATH}
              >
                <span className="rounded-md bg-secondary/30 p-1.5 text-secondary-foreground">
                  <Building2Icon className="size-4" />
                </span>
                <span className="font-semibold text-base">
                  {activeOrganization?.name ?? "Organization"}
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className="text-secondary/50" />

          {/* Projects */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                className="flex items-center gap-2 text-secondary transition-colors duration-300 hover:text-secondary-foreground"
                href={PROJECTS_PATH}
              >
                <PROJECT_ICONS.projects className="size-4" />
                <span className="font-semibold">
                  {t("organization.projects")}
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className="text-secondary/50" />

          {/* Project name */}
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2 text-secondary dark:text-secondary-foreground">
              <PROJECT_ICONS.project className="size-4" />
              <span className="font-semibold">{currentProject.name}</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
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
