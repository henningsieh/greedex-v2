"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPinnedIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/better-auth/auth-client";
import { orpcQuery } from "@/lib/orpc/orpc";

export function ActiveProjectBreadcrumb() {
  const { data: session } = authClient.useSession();
  const { data: projects } = useSuspenseQuery(
    orpcQuery.project.list.queryOptions(),
  );

  const activeProject = projects?.find(
    (project) => project.id === session?.session?.activeProjectId,
  );

  if (!activeProject) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href={`/projects/${activeProject.id}`}
            className="flex items-center gap-2 text-secondary transition-colors hover:text-sidebar-accent-foreground"
          >
            <MapPinnedIcon className="size-4" />
            <span className="font-medium">{activeProject.name}</span>
          </BreadcrumbLink>
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
