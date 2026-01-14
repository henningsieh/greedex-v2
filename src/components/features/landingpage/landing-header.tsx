"use client";

import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  ABOUT_PATH,
  E_FOREST_PATH,
  HOME_PATH,
  LIBRARY_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  TIPS_AND_TRICKS_PATH,
  WORKSHOPS_ANCHOR,
} from "@/app/routes";
import { Logo } from "@/components/features/landingpage/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

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
                aria-label="GREENDEX home"
                className="flex items-center space-x-2"
                href={HOME_PATH}
              >
                <Logo isScrolled={!isScrolled} />
              </Link>

              {/* Mobile burger menu */}
              <div className="flex items-center gap-2 lg:hidden">
                <ThemeSwitcher className="rounded-md" />
                <LocaleSwitcher className="h-8 rounded-md has-[>svg]:px-2" />
                <Sheet onOpenChange={setMenuOpen} open={menuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      aria-label={t("navigation.openMenu")}
                      className="flex items-center bg-transparent ring-1 ring-primary hover:bg-accent/40 lg:hidden"
                      size="sm"
                      variant="ghost"
                    >
                      <MenuIcon className="size-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader className="p-6 text-left">
                      <SheetTitle className="flex items-center gap-2">
                        <Logo />
                        <span className="sr-only">Greedex Calculator</span>
                      </SheetTitle>
                      <SheetDescription className="sr-only">
                        {t("navigation.openMenu")}
                      </SheetDescription>
                    </SheetHeader>
                    <nav
                      aria-label={t("navigation.openMenu")}
                      className="flex flex-1 flex-col justify-between px-4 pb-6"
                    >
                      <ul className="flex flex-col gap-1">
                        {menuItems.map((item) => (
                          <li key={item.name}>
                            <Item asChild size="sm">
                              <Link
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                              >
                                <ItemContent>
                                  <ItemTitle className="font-medium text-base">
                                    {item.name}
                                  </ItemTitle>
                                </ItemContent>
                              </Link>
                            </Item>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 flex flex-col gap-4">
                        <Button asChild size="lg" variant="outline">
                          <Link
                            href={LOGIN_PATH}
                            onClick={() => setMenuOpen(false)}
                          >
                            {t("navigation.login")}
                          </Link>
                        </Button>

                        <Button asChild size="lg">
                          <Link
                            href={SIGNUP_PATH}
                            onClick={() => setMenuOpen(false)}
                          >
                            {t("navigation.signup")}
                          </Link>
                        </Button>
                      </div>
                    </nav>
                  </SheetContent>
                </Sheet>
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
