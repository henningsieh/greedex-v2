"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  MapPinnedIcon,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { authClient } from "@/lib/better-auth/auth-client";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { cn } from "@/lib/utils";

export function ProjectSwitcher() {
  const { setIsLoading } = useAppLoading();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const {
    data: session,
    isPending: sessionIsPending,
    error: sessionError,
    refetch: refetchSession,
  } = authClient.useSession();

  const {
    data: projects,
    isPending: projectsIsPending,
    error: projectsError,
  } = useQuery(orpcQuery.project.list.queryOptions());

  const activeProject = projects?.find(
    (project) => project.id === session?.session?.activeProjectId,
  );

  const setActiveProject = useMutation({
    mutationFn: (projectId: string | undefined) =>
      orpc.project.setActive({ projectId }),
    onSuccess: async () => {
      // Step 1: Invalidate the session query cache
      await queryClient.invalidateQueries({
        queryKey: ["auth", "session"],
      });

      // Step 2: Wait for the refetch to complete
      // await queryClient.refetchQueries({
      //   queryKey: ["auth", "session"],
      // });

      // Step 3: Invalidate project list
      queryClient.invalidateQueries({
        queryKey: orpcQuery.project.list.queryKey(),
      });
      refetchSession();
    },
  });

  const { isMobile } = useSidebar();

  // Fix hydration by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || sessionError || projectsError) {
    return <ProjectSwitcherSkeleton />;
  }

  if (!session || !projects || sessionIsPending || projectsIsPending) {
    return <ProjectSwitcherSkeleton />;
  }

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
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
            side={isMobile ? undefined : "right"}
            sideOffset={4}
          >
            {projects.map((project) => (
              <DropdownMenuItem
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
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
