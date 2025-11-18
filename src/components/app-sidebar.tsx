"use client";

import {
  BarChart3Icon,
  CogIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MapPinnedIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { OrganizationSwitcher } from "@/components/features/organizations/organisation-switcher";
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
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/lib/i18n/navigation";

const projectsMenuItems = [
  // { title: "Home", icon: Home, url: "/" },
  { title: "Control", icon: CogIcon, url: "/org/activeproject" },
  {
    title: "Live view",
    icon: BarChart3Icon,
    url: "/org/activeproject/liveview",
  },
  { title: "Documents", icon: FileTextIcon, url: "/documents" },
];
const organizationMenuItems = [
  // { title: "Home", icon: Home, url: "/" },
  { title: "Dashboard", icon: LayoutDashboardIcon, url: "/org/dashboard" },
  { title: "Projects", icon: MapPinnedIcon, url: "/org/projects" },
  { title: "Team", icon: UsersIcon, url: "/org/team" },
  { title: "Settings", icon: SettingsIcon, url: "/org/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations("app.sidebar");

  return (
    <Sidebar
      className="h-[calc(svh-4rem)]"
      variant="sidebar"
      collapsible="icon"
    >
      <SidebarHeader>
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("projects")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-secondary hover:text-secondary-foreground active:bg-secondary active:text-secondary-foreground data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground data-[state=open]:hover:bg-secondary data-[state=open]:hover:text-secondary-foreground"
                  >
                    <Link
                      href={item.url as Route}
                      data-active={pathname === item.url}
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
        <div className="grow flex-col" />
        <SidebarGroup>
          <SidebarGroupLabel>Organisation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {organizationMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url as Route}
                      data-active={pathname === item.url}
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
      </SidebarContent>
      <SidebarFooter>
        <OrganizationSwitcher />
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
    <Sidebar
      className="h-[calc(svh-4rem)]"
      variant="sidebar"
      collapsible="icon"
    >
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
