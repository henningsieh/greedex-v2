"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronDown,
  Monitor,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useTransition } from "react";

import type { LocaleCode } from "@/config/languages";

import { HOME_PATH, LOGIN_PATH } from "@/app/routes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/better-auth/auth-client";
import { getLocaleData } from "@/lib/i18n/locales";
import { Link, usePathname, useRouter } from "@/lib/i18n/routing";
import { orpcQuery } from "@/lib/orpc/orpc";
import { cn } from "@/lib/utils";

const themes = [
  {
    key: "light",
    icon: SunIcon,
    label: "Light",
  },
  {
    key: "dark",
    icon: MoonIcon,
    label: "Dark",
  },
  {
    key: "system",
    icon: MonitorIcon,
    label: "System",
  },
] as const;

export function UserMenu() {
  const t = useTranslations("authentication.login");
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isMobile, state } = useSidebar();

  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isPending, startTransition] = useTransition();

  const locales = getLocaleData();
  const currentLocale = locales.find((entry) => entry.code === locale);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push(HOME_PATH);
    router.refresh();
  };

  const handleLocaleChange = (newLocale: LocaleCode) => {
    if (newLocale === locale || isPending) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, {
        locale: newLocale,
      });
    });
  };

  if (isSigningOut) {
    return <UserMenuSkeleton />;
  }

  if (!session) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={LOGIN_PATH}>{t("loginButton")}</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const user = session.user;
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user.email[0].toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className={cn(
                "border border-sidebar-accent/60 ring-sidebar-accent",
                "hover:bg-sidebar-primary/40 hover:text-sidebar-foreground",
                "data-[state=open]:bg-sidebar-primary/30 data-[state=open]:text-sidebar-foreground/60",
              )}
              size="lg"
            >
              <Avatar className="h-8 w-8 ring-1 ring-border">
                {user.image ? (
                  <Image
                    alt={user.name || "User avatar"}
                    className="rounded-full"
                    height={32}
                    src={user.image}
                    width={32}
                  />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm font-medium text-nowrap">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(
              "border border-sidebar-accent/50 bg-background/80 backdrop-blur-md",
              state === "expanded" && "w-(--radix-dropdown-menu-trigger-width)",
              state === "collapsed" && "w-72",
            )}
            side={isMobile ? undefined : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Theme Switcher */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Monitor className="mr-2 size-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {themes.map(({ key, icon: Icon, label }) => (
                  <DropdownMenuItem key={key} onSelect={() => setTheme(key)}>
                    <Icon className="mr-2 size-4" />
                    <span>{label}</span>
                    {theme === key && <CheckIcon className="ml-auto size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Locale Switcher */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {currentLocale?.Flag && (
                  <currentLocale.Flag className="mr-2 size-4 rounded-sm" />
                )}
                <span>Language</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {locales.map((entry) => (
                  <DropdownMenuItem
                    disabled={entry.code === locale}
                    key={entry.code}
                    onSelect={(event) => {
                      event.preventDefault();
                      handleLocaleChange(entry.code);
                    }}
                  >
                    {entry.Flag && (
                      <entry.Flag className="mr-2 h-4 w-6 rounded-sm border border-border/20" />
                    )}
                    <span className="flex flex-col gap-0.5 leading-tight">
                      <span className="text-sm font-semibold">
                        {entry.englishName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {entry.label}
                      </span>
                    </span>
                    {locale === entry.code && (
                      <CheckIcon className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              {t("logOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function UserMenuSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
