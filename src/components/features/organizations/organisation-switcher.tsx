"use client";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  Building2Icon,
  CheckIcon,
  ChevronsUpDownIcon,
  PlusIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateOrganizationModal } from "@/components/features/organizations/create-organization-modal";
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
import { useRouter } from "@/lib/i18n/routing";
import { orpcQuery } from "@/lib/orpc/orpc";
import { cn } from "@/lib/utils";

export function OrganizationSwitcher() {
  const t = useTranslations("app.loading");
  const { startLoading, stopLoading } = useAppLoading({
    message: t("switchingOrganization"),
    mode: "organization",
  });
  const queryClient = useQueryClient();
  const router = useRouter();

  // Use oRPC queries for consistency
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );

  const { data: organizations } = useSuspenseQuery(
    orpcQuery.organizations.list.queryOptions(),
  );

  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  const { isMobile, state } = useSidebar();

  if (!session || !activeOrganization || !organizations) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "border border-sidebar-accent/60 ring-sidebar-accent",
                "hover:bg-sidebar-primary/40 hover:text-sidebar-foreground",
                "data-[state=open]:bg-sidebar-primary/30 data-[state=open]:text-sidebar-foreground/60",
              )}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary">
                <Building2Icon className="size-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-nowrap">{activeOrganization.name}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              "border border-sidebar-accent/50 bg-background/80 backdrop-blur-md",
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
                  startLoading();

                  try {
                    // 1. Switch organization on the server (this should trigger your hook)
                    await authClient.organization.setActive({
                      organizationId: org.id,
                    });

                    // Invalidate session / projects / active organization
                    // Run invalidations in parallel to avoid sequential delays
                    await Promise.all([
                      queryClient.invalidateQueries(
                        orpcQuery.betterauth.getSession.queryOptions(),
                      ),
                      queryClient.invalidateQueries(
                        orpcQuery.projects.list.queryOptions(),
                      ),
                      queryClient.invalidateQueries(
                        orpcQuery.organizations.getActive.queryOptions(),
                      ),
                    ]);
                    router.refresh(); // Force immediate refresh to ensure navigation completes
                  } catch (error) {
                    console.error("Failed to switch organization:", error);
                  } finally {
                    stopLoading();
                  }
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
