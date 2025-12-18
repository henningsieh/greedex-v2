"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
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
import {
  ABOUT_PATH,
  E_FOREST_PATH,
  HOME_PATH,
  LIBRARY_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  TIPS_AND_TRICKS_PATH,
  WORKSHOPS_ANCHOR,
} from "@/config/AppRoutes";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

export const LandingHeader = () => {
  const t = useTranslations("header");
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

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

  React.useEffect(() => {
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
            "mx-auto mt-2 max-w-7xl px-4 transition-all duration-300 ease-in-out sm:px-6 lg:px-12",
            isScrolled &&
              "max-w-6xl rounded-2xl border bg-background/80 backdrop-blur-lg lg:px-8",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-4 py-3 lg:flex-nowrap lg:gap-6 lg:py-4">
            <div className="flex w-full items-center justify-between lg:w-auto">
              <Link
                href={HOME_PATH}
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo isScrolled={!isScrolled} />
              </Link>

              {/* Mobile burger menu */}
              <div className="flex items-center gap-2 lg:hidden">
                <ThemeSwitcher className="rounded-md" />
                <LocaleSwitcher className="h-8 rounded-md has-[>svg]:px-2" />
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="lg"
                      aria-label={t("navigation.openMenu")}
                      className="relative z-20 block h-8 cursor-pointer items-center bg-accent ring-1 ring-primary lg:hidden"
                    >
                      <MenuIcon
                        className={`m-auto size-6 duration-500 ${
                          menuOpen ? "rotate-180 scale-0 opacity-0" : ""
                        }`}
                      />
                      <XIcon
                        className={`-rotate-180 absolute inset-0 m-auto size-6 duration-500 ${
                          menuOpen
                            ? "rotate-0 scale-100 opacity-100"
                            : "scale-0 opacity-0"
                        }`}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="rounded-3xl border bg-background p-4 shadow-2xl shadow-zinc-300/20"
                    align="end"
                  >
                    <ul className="space-y-6 text-base">
                      {menuItems.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link
                            href={item.href}
                            className="block text-muted-foreground hover:text-primary-foreground"
                          >
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </ul>
                    <DropdownMenuSeparator />
                    <div className="flex w-full items-center justify-end gap-3">
                      <div
                        className={cn(
                          "relative h-8 overflow-hidden transition-[max-width] duration-300 ease-in-out",
                          isScrolled ? "max-w-0" : "max-w-[7.5rem]",
                        )}
                        aria-hidden={isScrolled}
                      >
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className={cn(
                            "transition-opacity ease-in-out",
                            isScrolled ? "opacity-0" : "opacity-100",
                          )}
                        >
                          <Link href={LOGIN_PATH}>
                            <span>{t("navigation.login")}</span>
                          </Link>
                        </Button>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        className={cn(
                          "transform transition-transform ease-in-out",
                        )}
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

            <div className="inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-4 text-lg">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="block font-bold text-muted-foreground hover:text-accent"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <ThemeSwitcher />
              <LocaleSwitcher className="rounded-md" />

              <Button
                asChild
                size="sm"
                className="transform transition-transform ease-in-out"
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
