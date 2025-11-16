"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  MapPinnedIcon,
  PlusIcon,
} from "lucide-react";
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
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { cn } from "@/lib/utils";

export function ProjectSwitcher() {
  const { setIsLoading } = useAppLoading();
  const queryClient = useQueryClient();

  // Use oRPC queries for stable SSR hydration
  // Prefetched in layout.tsx or parent component
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );

  const { data: projects } = useSuspenseQuery(
    orpcQuery.project.list.queryOptions(),
  );

  const activeProject = projects?.find(
    (project) => project.id === session?.session?.activeProjectId,
  );

  const setActiveProject = useMutation({
    mutationFn: (projectId: string | undefined) =>
      orpc.project.setActive({ projectId }),
    onSuccess: async () => {
      // Invalidate oRPC session cache (used throughout app)
      await queryClient.invalidateQueries(
        orpcQuery.betterauth.getSession.queryOptions(),
      );

      // Invalidate project list
      queryClient.invalidateQueries({
        queryKey: orpcQuery.project.list.queryKey(),
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
              className="border border-secondary/50 ring-secondary hover:bg-secondary/40 data-[state=open]:bg-secondary/30 data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary/70 text-secondary-foreground">
                <MapPinnedIcon className="size-6" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="">
                  {activeProject ? activeProject.name : "No active project"}
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
            <DropdownMenuItem
              className="flex justify-center focus:bg-secondary/50 focus:text-accent-foreground"
              onSelect={() => {
                // TODO: Open create project modal
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Project
            </DropdownMenuItem>
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
