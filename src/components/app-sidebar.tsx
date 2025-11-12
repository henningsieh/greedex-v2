"use client";

import {
  BarChart3Icon,
  FileTextIcon,
  LayoutDashboardIcon,
  MapPinnedIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const projectsMenuItems = [
  // { title: "Home", icon: Home, url: "/" },
  { title: "Dashboard", icon: LayoutDashboardIcon, url: "/project" },
  { title: "Analytics", icon: BarChart3Icon, url: "/analytics" },
  { title: "Documents", icon: FileTextIcon, url: "/documents" },
];
const organizationMenuItems = [
  // { title: "Home", icon: Home, url: "/" },
  { title: "Dashboard", icon: LayoutDashboardIcon, url: "/org/dashboard" },
  { title: "Projects", icon: MapPinnedIcon, url: "/org/projects" },
  { title: "Team", icon: UsersIcon, url: "/team" },
  { title: "Settings", icon: SettingsIcon, url: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      className="h-[calc(svh-4rem)]"
      variant="floating"
      collapsible="icon"
    >
      <SidebarHeader>
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectsMenuItems.map((item) => (
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
