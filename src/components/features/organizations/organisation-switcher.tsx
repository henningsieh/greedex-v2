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
import type { OrganizationType } from "@/components/features/organizations/types";
// import type { OrganizationType } from "@/components/features/organizations/types";
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
  const [activeOrganization, setActiveOrganization] = React.useState<
    OrganizationType | undefined
  >(undefined);
  const { setIsLoading } = useAppLoading();
  const queryClient = useQueryClient();

  // Use oRPC queries for consistency
  const {
    data: session,
    isPending: sessionIsPending,
    error: sessionError,
  } = authClient.useSession();

  const {
    data: organizations,
    isPending: organizationsIsPending,
    error: organizationsError,
  } = authClient.useListOrganizations();

  const activeOrg =
    organizations?.find(
      (org) => org.id === session?.session?.activeOrganizationId,
    ) || organizations?.[0];

  React.useEffect(() => {
    setActiveOrganization(activeOrg);
  }, [activeOrg]);

  const { isMobile, state } = useSidebar();

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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary">
                <Building2Icon className="size-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="">{activeOrganization.name}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              // "border border-secondary/50 bg-background/80 backdrop-blur-md",
              state === "expanded" && "w-(--radix-dropdown-menu-trigger-width)",
              state === "collapsed" && "w-72",
            )}
            align="end"
            side={isMobile ? undefined : "right"}
            sideOffset={4}
          >
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onSelect={async () => {
                  setIsLoading(true);

                  await authClient.organization.setActive({
                    organizationId: org.id,
                  });

                  await Promise.all([
                    // Invalidate oRPC queries to refresh data after organization switch
                    queryClient.invalidateQueries(
                      orpcQuery.betterauth.getSession.queryOptions(),
                    ),
                    queryClient.invalidateQueries(
                      orpcQuery.project.list.queryOptions(),
                    ),

                    // Prefetch fresh projects data for the new organization
                    queryClient.prefetchQuery(
                      orpcQuery.betterauth.getSession.queryOptions(),
                    ),
                    queryClient.prefetchQuery(
                      orpcQuery.project.list.queryOptions(),
                    ),
                  ]);

                  setActiveOrganization(org);
                  setIsLoading(false);
                }}
              >
                {org.name}
                {org.id === activeOrganization.id && (
                  <CheckIcon className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
            {organizations && organizations.length > 0 && (
              <DropdownMenuSeparator />
            )}
            <CreateOrganizationModal
              label="Add Organization"
              triggerNode={
                <DropdownMenuItem
                  variant="default"
                  className="flex justify-center"
                  onSelect={(e) => e.preventDefault()}
                >
                  <PlusIcon className="size-4" />
                  Add Organization
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
