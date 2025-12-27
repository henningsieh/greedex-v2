"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import {
  ABOUT_PATH,
  E_FOREST_PATH,
  HOME_PATH,
  LIBRARY_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  TIPS_AND_TRICKS_PATH,
  WORKSHOPS_ANCHOR,
} from "@/lib/utils/app-routes";

export const LandingHeader = () => {
  const t = useTranslations("header");
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    {
      name: t("navigation.workshops"),
      href: WORKSHOPS_ANCHOR,
    },
    {
      name: t("navigation.eforest"),
      href: E_FOREST_PATH,
    },
    {
      name: t("navigation.tipsAndTricks"),
      href: TIPS_AND_TRICKS_PATH,
    },
    {
      name: t("navigation.library"),
      href: LIBRARY_PATH,
    },
    {
      name: t("navigation.about"),
      href: ABOUT_PATH,
    },
  ] as const;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav className="fixed z-20 w-full px-2">
        <div
          className={cn(
            "mx-auto mt-2 max-w-7xl px-4 transition-all duration-300 ease-in-out sm:px-6 lg:px-10",
            isScrolled &&
              "max-w-6xl rounded-2xl border bg-background/60 shadow-lg backdrop-blur-lg",
          )}
        >
          <div className="relative flex items-center justify-between gap-2 py-3 lg:gap-6 lg:py-4">
            <div className="flex w-full items-center justify-between lg:w-auto">
              <Link
                aria-label="home"
                className="flex items-center space-x-2"
                href={HOME_PATH}
              >
                <Logo isScrolled={!isScrolled} />
              </Link>

              {/* Mobile burger menu */}
              <div className="flex items-center gap-2 lg:hidden">
                <ThemeSwitcher className="rounded-md" />
                <LocaleSwitcher className="h-8 rounded-md has-[>svg]:px-2" />
                <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label={t("navigation.openMenu")}
                      className="relative z-20 flex cursor-pointer items-center bg-accent ring-1 ring-primary lg:hidden"
                      size="sm"
                    >
                      <MenuIcon
                        className={`m-auto size-6 duration-300 ${
                          menuOpen ? "rotate-180 scale-0 opacity-0" : ""
                        }`}
                      />
                      <XIcon
                        className={`absolute inset-0 m-auto size-6 -rotate-180 duration-300 ${
                          menuOpen
                            ? "rotate-0 scale-100 opacity-100"
                            : "scale-0 opacity-0"
                        }`}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="border bg-background p-4 shadow-2xl shadow-zinc-300/20"
                  >
                    <ul className="space-y-6 text-base">
                      {menuItems.map((item) => (
                        <DropdownMenuItem asChild key={item.name}>
                          <Link
                            className="block text-muted-foreground hover:text-primary-foreground"
                            href={item.href}
                          >
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </ul>
                    <DropdownMenuSeparator />
                    <div className="flex w-full items-center justify-end gap-3">
                      <div
                        aria-hidden={isScrolled}
                        className={cn("relative h-8 overflow-hidden")}
                      >
                        <Button asChild size="sm" variant="outline">
                          <Link href={LOGIN_PATH}>
                            <span>{t("navigation.login")}</span>
                          </Link>
                        </Button>
                      </div>

                      <Button
                        asChild
                        className={cn(
                          "transform transition-transform ease-in-out",
                        )}
                        size="sm"
                      >
                        <Link href={SIGNUP_PATH}>
                          <span>{t("navigation.signup")}</span>
                        </Link>
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div
              className={cn(
                "inset-0 m-auto hidden size-fit transition-all duration-300 lg:block",
                isScrolled && "scale-95",
              )}
            >
              <ul
                className={cn(
                  "flex gap-4 text-lg transition-all duration-300",
                  isScrolled && "gap-5 text-base",
                )}
              >
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      className="block whitespace-nowrap font-bold text-muted-foreground hover:text-foreground"
                      href={item.href}
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <ThemeSwitcher className="rounded-md" />
              <LocaleSwitcher className="rounded-md" />

              <Button
                asChild
                className="transform transition-transform ease-in-out"
                size="sm"
              >
                <Link href={SIGNUP_PATH}>
                  <span>{t("navigation.signup")}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
