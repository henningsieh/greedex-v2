"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, usePathname } from "@/lib/i18n/routing";
import { orpcQuery } from "@/lib/orpc/orpc";

export function ActiveProjectBreadcrumb() {
  const t = useTranslations("organization.projects");

  // Use oRPC queries instead of authClient.useSession() to enable:
  // 1. Server-side prefetching for optimal performance
  // 2. Stable hydration (no SSR/client mismatch)
  // 3. Server-side Suspense boundaries without errors
  const pathname = usePathname();
  const projectIdFromPath = (() => {
    const match = pathname.match(/\/org\/projects\/([^/]+)/);
    return match?.[1] ?? null;
  })();

  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  const { data: projects } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions(),
  );

  const { data: projectFromPath } = useQuery({
    ...orpcQuery.projects.getById.queryOptions({
      input: { id: projectIdFromPath ?? "" },
    }),
    enabled: Boolean(projectIdFromPath),
  });

  const activeProject = projects?.find(
    (project) => project.id === session?.session.activeProjectId,
  );

  const project = projectFromPath ?? activeProject;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {project ? (
            <BreadcrumbLink
              asChild
              className="flex items-center gap-2 transition-colors duration-300 hover:text-secondary-foreground"
            >
              <Link href={`/org/projects/${project.id}` as "/org/projects/[id]"}>
                <span className="flex items-center gap-2">
                  <PROJECT_ICONS.project className="size-5" />
                  <span className="font-bold text-lg">{project.name}</span>
                </span>
              </Link>
            </BreadcrumbLink>
          ) : (
            <span className="flex items-center gap-2 text-rose-500/80">
              <TriangleAlertIcon className="size-4" />
              <span className="font-bold italic">
                {t("activeProject.header.noSelection")}
              </span>
            </span>
          )}
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-sidebar-border" />
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export const BreadcrumbSkeleton = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
      <Skeleton className="h-4 w-6 rounded-md" />
      <Skeleton className="h-4 w-20 rounded-md" />
    </div>
  );
};
