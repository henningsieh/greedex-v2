"use client";

import { Check, ChevronsUpDown, GalleryVerticalEnd } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useLoading } from "@/components/providers/loading-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export function OrganizationSwitcher() {
  const router = useRouter();
  const { setIsLoading } = useLoading();
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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="">{activeOrganization.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
            side={isMobile ? "bottom" : "right"}
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
                  setIsLoading(false);
                  router.refresh();
                }}
              >
                {org.name}
                {org.id === activeOrganization.id && (
                  <Check className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export const OrganizationSwitcherSkeleton = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Skeleton className="h-12 w-full rounded-md" />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
