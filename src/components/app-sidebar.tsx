"use client";

import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import {
  DASHBOARD_PATH,
  PARTICIPANTS_PATH,
  PROJECTS_ARCHIVE_PATH,
  PROJECTS_PATH,
  SETTINGS_PATH,
  TEAM_PATH,
} from "@/app/routes";
import {
  UserMenu,
  UserMenuSkeleton,
} from "@/components/features/authentication/user-menu";
import { ORGANIZATION_ICONS } from "@/components/features/organizations/organization-icons";
import {
  OrganizationSwitcher,
  OrganizationSwitcherSkeleton,
} from "@/components/features/organizations/organization-switcher";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/lib/i18n/routing";

/**
 * Renders the application sidebar containing organization and project navigation.
 *
 * The sidebar groups menu items into "Organization" (Dashboard, Team, Settings)
 * and "Projects" (Projects list, Participants, Archive), highlights the active
 * item based on the current pathname, and provides a collapse toggle in the footer.
 *
 * @returns The Sidebar element with grouped navigation menus, a collapse toggle,
 * and an OrganizationSwitcher wrapped with a skeleton fallback.
 */
export function AppSidebar() {
  const pathname = usePathname();

  const { state, setOpen } = useSidebar();
  const t = useTranslations("app.sidebar");

  const projectsMenuItems = [
    {
      title: t("projects.projects"),
      icon: PROJECT_ICONS.projects,
      url: PROJECTS_PATH,
    },
    {
      title: t("projects.participants"),
      icon: PROJECT_ICONS.participants,
      url: PARTICIPANTS_PATH,
    },
    // {
    //   title: t("projects.archive"),
    //   icon: PROJECT_ICONS.archive,
    //   url: PROJECTS_ARCHIVE_PATH,
    // },
  ] as const;

  const projectsArchiveItem = [
    {
      title: t("projects.archive"),
      icon: PROJECT_ICONS.archive,
      url: PROJECTS_ARCHIVE_PATH,
    },
  ] as const;

  const organizationMenuItems = [
    {
      title: t("organization.dashboard"),
      icon: ORGANIZATION_ICONS.dashboard,
      url: DASHBOARD_PATH,
    },
    {
      title: t("organization.team"),
      icon: ORGANIZATION_ICONS.team,
      url: TEAM_PATH,
    },
    {
      title: t("organization.settings"),
      icon: ORGANIZATION_ICONS.settings,
      url: SETTINGS_PATH,
    },
  ] as const;

  const sidebarGroups = [
    {
      items: projectsMenuItems,
      label: t("projects.groupLabel"),
    },
    {
      items: projectsArchiveItem,
      label: t("projects.archiveLabel"),
    },
    {
      items: organizationMenuItems,
      label: t("organization.groupLabel"),
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <Suspense fallback={<OrganizationSwitcherSkeleton />}>
          <OrganizationSwitcher />
        </Suspense>
      </SidebarHeader>
      <SidebarContent>
        {sidebarGroups.map((group) => (
          <div key={group.label}>
            <SidebarGroup className="overflow-x-hidden">
              <SidebarGroupLabel className="text-nowrap">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="hover:bg-secondary hover:text-secondary-foreground active:bg-secondary active:text-secondary-foreground data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground data-[state=open]:hover:bg-secondary data-[state=open]:hover:text-secondary-foreground"
                      >
                        <Link
                          data-active={pathname === item.url}
                          href={item.url}
                        >
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="mx-0" />
          </div>
        ))}

        {/* <SidebarGroup className="overflow-x-hidden">
          <SidebarGroupLabel className="text-nowrap">
            {t("projects.groupLabel")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-secondary hover:text-secondary-foreground active:bg-secondary active:text-secondary-foreground data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground data-[state=open]:hover:bg-secondary data-[state=open]:hover:text-secondary-foreground"
                  >
                    <Link data-active={pathname === item.url} href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        <SidebarGroup className="overflow-x-hidden">
          <SidebarGroupLabel className="text-nowrap">
            {t("organization.groupLabel")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {organizationMenuItems.map((item) => (
                <SidebarMenuItem key={item.title} title={item.title}>
                  <SidebarMenuButton asChild>
                    <Link data-active={pathname === item.url} href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <SidebarMenu>
          <SidebarMenuItem
            onClick={() => setOpen(!state || state === "collapsed")}
          >
            <SidebarMenuButton
              className="text-nowrap [&>svg]:size-4"
              variant="outline"
            >
              {state === "expanded" && <PanelRightOpenIcon />}
              {state === "collapsed" && <PanelRightCloseIcon />}
              {t("collapse")}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="mx-0" />
        <Suspense fallback={<UserMenuSkeleton />}>
          <UserMenu />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebarSkeleton() {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="mb-2 h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
          </div>
        </SidebarGroup>
        <div className="grow" />
        <SidebarGroup>
          <div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
      </SidebarFooter>
    </Sidebar>
  );
}
