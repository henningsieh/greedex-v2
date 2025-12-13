"use client";

import {
  BarChart3Icon,
  CogIcon,
  LayoutDashboardIcon,
  MapPinnedIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import {
  OrganizationSwitcher,
  OrganizationSwitcherSkeleton,
} from "@/components/features/organizations/organisation-switcher";
import { ProjectSwitcher } from "@/components/features/projects/project-switcher";
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
import {
  ACTIVE_PROJECT_PATH,
  DASHBOARD_PATH,
  LIVE_VIEW_PATH,
  PROJECTS_PATH,
  SETTINGS_PATH,
  TEAM_PATH,
} from "@/config/AppRoutes";
import { Link, usePathname } from "@/lib/i18n/routing";

export function AppSidebar() {
  const pathname = usePathname();

  const { state, setOpen } = useSidebar();
  const t = useTranslations("app.sidebar");

  const projectsMenuItems = [
    {
      title: t("projects.control"),
      icon: CogIcon,
      url: ACTIVE_PROJECT_PATH,
    },
    {
      title: t("projects.liveView"),
      icon: BarChart3Icon,
      url: LIVE_VIEW_PATH,
    },
  ] as const;

  const organizationMenuItems = [
    {
      title: t("organization.dashboard"),
      icon: LayoutDashboardIcon,
      url: DASHBOARD_PATH,
    },
    {
      title: t("organization.projects"),
      icon: MapPinnedIcon,
      url: PROJECTS_PATH,
    },
    {
      title: t("organization.team"),
      icon: UsersIcon,
      url: TEAM_PATH,
    },
    {
      title: t("organization.settings"),
      icon: SettingsIcon,
      url: SETTINGS_PATH,
    },
  ] as const;

  return (
    <Sidebar
      className="h-[calc(svh-4rem)] overflow-x-hidden"
      variant="sidebar"
      collapsible="icon"
    >
      <SidebarHeader>
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="overflow-x-hidden">
          <SidebarGroupLabel className="text-nowrap">
            {t("projects.sectionLabel")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-secondary hover:text-secondary-foreground active:bg-secondary active:text-secondary-foreground data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground data-[state=open]:hover:bg-secondary data-[state=open]:hover:text-secondary-foreground"
                  >
                    <Link href={item.url} data-active={pathname === item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="grow flex-col" />
        <SidebarGroup className="overflow-x-hidden">
          <SidebarGroupLabel className="text-nowrap">
            {t("organization.sectionLabel")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {organizationMenuItems.map((item) => (
                <SidebarMenuItem key={item.title} title={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} data-active={pathname === item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <SidebarMenu>
          <SidebarMenuItem
            onClick={() => setOpen(!state || state === "collapsed")}
          >
            <SidebarMenuButton
              variant="outline"
              className="text-nowrap [&>svg]:size-4"
            >
              {state === "expanded" && <PanelRightOpenIcon />}
              {state === "collapsed" && <PanelRightCloseIcon />}
              {t("collapse")}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Suspense fallback={<OrganizationSwitcherSkeleton />}>
          <OrganizationSwitcher />
        </Suspense>
        {/* <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="size-4" />
              <span>Account Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebarSkeleton() {
  return (
    <Sidebar className="h-[calc(svh-4rem)]" variant="sidebar" collapsible="icon">
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
