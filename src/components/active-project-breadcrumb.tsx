"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPinnedIcon, TriangleAlertIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { orpcQuery } from "@/lib/orpc/orpc";

export function ActiveProjectBreadcrumb() {
  // Use oRPC queries instead of authClient.useSession() to enable:
  // 1. Server-side prefetching for optimal performance
  // 2. Stable hydration (no SSR/client mismatch)
  // 3. Server-side Suspense boundaries without errors
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  const { data: projects } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions(),
  );

  const activeProject = projects?.find(
    (project) => project.id === session?.session.activeProjectId,
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {activeProject ? (
            <BreadcrumbLink
              href={`/projects/${activeProject.id}`}
              className="flex items-center gap-2 transition-colors duration-300 hover:text-secondary-foreground"
            >
              <MapPinnedIcon className="size-5" />
              <span className="font-bold text-lg">{activeProject.name}</span>
            </BreadcrumbLink>
          ) : (
            <span className="flex items-center gap-2 text-rose-500/80">
              <TriangleAlertIcon className="size-4" />
              <span className="font-bold italic">
                You have not selected an project
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
