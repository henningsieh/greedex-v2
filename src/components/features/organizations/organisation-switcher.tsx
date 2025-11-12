"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Building2Icon,
  CheckIcon,
  ChevronsUpDownIcon,
  PlusIcon,
} from "lucide-react";
import * as React from "react";
import CreateOrganizationModal from "@/components/features/organizations/create-organization-modal";
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
import { orpcQuery } from "@/lib/orpc/orpc";
import { cn } from "@/lib/utils";

export function OrganizationSwitcher() {
  const queryClient = useQueryClient();
  const { setIsLoading } = useAppLoading();
  const {
    data: session,
    isPending: sessionIsPending,

    error: sessionError,
    // refetch: refetchSession,
  } = authClient.useSession();

  const {
    data: organizations,
    isPending: organizationsIsPending,
    error: organizationsError,
    // refetch: refetchOrganizations,
  } = authClient.useListOrganizations();

  const activeOrg =
    organizations?.find(
      (org) => org.id === session?.session?.activeOrganizationId,
    ) || organizations?.[0];

  const [activeOrganization, setActiveOrganization] = React.useState(activeOrg);

  React.useEffect(() => {
    setActiveOrganization(activeOrg);
  }, [activeOrg]);

  const { isMobile } = useSidebar();

  if (sessionError || organizationsError) {
    return <div>Error loading organizations</div>;
  }

  if (
    !session ||
    !activeOrganization ||
    !organizations ||
    sessionIsPending ||
    organizationsIsPending
  ) {
    return <OrganizationSwitcherSkeleton />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="border border-sidebar-accent/80 hover:bg-sidebar-accent/40 data-[state=open]:bg-sidebar-accent/30 data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2Icon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="">{activeOrganization.name}</span>
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
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onSelect={async () => {
                  setActiveOrganization(org);
                  setIsLoading(true);
                  await authClient.organization.setActive({
                    organizationId: org.id,
                  });
                  // Invalidate queries to refresh data after organization switch
                  // await queryClient.invalidateQueries({
                  //   queryKey: ["better-auth", "session"],
                  // });
                  // queryClient.invalidateQueries({
                  //   queryKey: ["better-auth", "organizations"],
                  // });
                  await queryClient.invalidateQueries({
                    queryKey: orpcQuery.project.list.queryKey(),
                  });

                  await queryClient.prefetchQuery(
                    orpcQuery.project.list.queryOptions(),
                  );

                  setIsLoading(false);
                }}
              >
                {org.name}
                {org.id === activeOrganization.id && (
                  <CheckIcon className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <CreateOrganizationModal
              label="Add Organization"
              triggerNode={
                <DropdownMenuItem
                  variant="default"
                  className="gap-2 p-2"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <PlusIcon className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Add Organization
                  </div>
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export const OrganizationSwitcherSkeleton = () => {
  const { open: isSidebarOpen } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Skeleton
          className={cn("w-full rounded-md", isSidebarOpen ? "h-12" : "h-8")}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
