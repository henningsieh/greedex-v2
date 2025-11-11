"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  MapPinnedIcon,
  PlusIcon,
} from "lucide-react";
import * as React from "react";
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

export function ProjectSwitcher() {
  const { setIsLoading } = useAppLoading();
  const queryClient = useQueryClient();

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

  const activeProject =
    projects?.find(
      (project) => project.id === session?.session?.activeProjectId,
    ) || projects?.[0];

  const [activeProjectState, setActiveProjectState] =
    React.useState(activeProject);

  React.useEffect(() => {
    setActiveProjectState(activeProject);
  }, [activeProject]);

  const setActiveProject = useMutation({
    mutationFn: (projectId: string | undefined) =>
      orpc.project.setActive({ projectId }),
    onSuccess: async () => {
      refetchSession();

      // queryClient.invalidateQueries({
      //   queryKey: orpcQuery.project.list.queryKey(),
      // });

      queryClient.invalidateQueries({
        queryKey: orpcQuery.project.list.queryKey(),
      });
    },
  });

  const { isMobile } = useSidebar();

  if (sessionError || projectsError) {
    return <div>Error loading projects</div>;
  }

  if (
    !session ||
    !activeProjectState ||
    !projects ||
    sessionIsPending ||
    projectsIsPending
  ) {
    return <ProjectSwitcherSkeleton />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="border border-input/50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <MapPinnedIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="">{activeProjectState.name}</span>
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
                  setActiveProjectState(project);
                  setIsLoading(true);
                  await setActiveProject.mutateAsync(project.id);
                  setIsLoading(false);
                }}
              >
                {project.name}
                {project.id === activeProjectState.id && (
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
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Skeleton className="h-12 w-full rounded-md" />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
