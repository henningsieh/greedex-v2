"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { CheckIcon, ChevronsUpDownIcon, MapPinnedIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import { useAppLoading } from "@/components/providers/loading-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { cn } from "@/lib/utils";

export function ProjectSwitcher() {
  // Get user permissions
  const {
    canCreate,
    // canRead,
    // canUpdate,
    // canDelete,
    // canShare,
    // role,
    // isPending: permissionsPending,
  } = useProjectPermissions();

  const t = useTranslations("organization.projects.activeProject");

  const { setIsLoading } = useAppLoading();
  const queryClient = useQueryClient();

  // Use oRPC queries for stable SSR hydration
  // Prefetched in layout.tsx or parent component
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );

  const { data: projects } = useSuspenseQuery(
    orpcQuery.projects.list.queryOptions(),
  );

  const activeProject = projects?.find(
    (project) => project.id === session?.session?.activeProjectId,
  );

  const setActiveProject = useMutation({
    mutationFn: (projectId: string | undefined) =>
      orpc.projects.setActive({
        projectId,
      }),
    onSuccess: async () => {
      // Invalidate oRPC session cache (used throughout app)
      await queryClient.invalidateQueries(
        orpcQuery.betterauth.getSession.queryOptions(),
      );

      // Invalidate project list
      queryClient.invalidateQueries({
        queryKey: orpcQuery.projects.list.queryKey(),
      });
    },
  });

  const { isMobile, state } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="border border-secondary">
            <SidebarMenuButton
              size="lg"
              variant="default"
              className={cn(
                "border border-secondary/60 ring-secondary",
                "hover:bg-secondary/20 hover:text-sidebar-foreground",
                "data-[state=open]:bg-secondary/10 data-[state=open]:text-sidebar-foreground/60",
              )}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary/70 text-secondary-foreground">
                <MapPinnedIcon className="size-6" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-nowrap">
                  {activeProject ? activeProject.name : t("emptyState.title")}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              "border border-secondary/50 bg-background/80 backdrop-blur-md",
              state === "expanded" && "w-(--radix-dropdown-menu-trigger-width)",
              state === "collapsed" && "w-48",
            )}
            align="start"
            side={isMobile ? undefined : "right"}
            sideOffset={4}
          >
            {projects.map((project) => (
              <DropdownMenuItem
                className="focus:bg-secondary/50 focus:text-accent-foreground"
                key={project.id}
                onSelect={async () => {
                  setIsLoading(true);
                  await setActiveProject.mutateAsync(project.id);
                  setIsLoading(false);
                }}
              >
                {project.name}
                {activeProject && project.id === activeProject.id && (
                  <CheckIcon className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
            {projects && projects.length > 0 && <DropdownMenuSeparator />}
            {canCreate && <CreateProjectButton className="w-full" />}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export const ProjectSwitcherSkeleton = () => {
  const { open: isSidebarOpen } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Skeleton
          className={cn(
            "w-full rounded-md bg-secondary/70",
            isSidebarOpen ? "h-12" : "h-8",
          )}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
