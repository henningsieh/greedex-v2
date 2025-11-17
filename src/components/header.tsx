"use client";

import { Menu, X } from "lucide-react";
import type { Route } from "next";
import * as React from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils/index";

const menuItems = [
  // { name: "Home", href: "/" },
  { name: "Workshops", href: "/#workshops" as Route },
  { name: "E+ Forest", href: "/e+forest" as Route },
  { name: "Tips & Tricks", href: "/tips-and-tricks" as Route },
  { name: "Library", href: "/library" as Route },
  { name: "About", href: "/about" as Route },
] as const;

export const HeroHeader = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

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
            "mx-auto mt-2 max-w-7xl px-6 transition-all lg:px-12",
            isScrolled &&
              "max-w-5xl rounded-2xl border bg-background/50 backdrop-blur-lg lg:px-5",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo isScrolled={!isScrolled} />
              </Link>
              <div className="flex items-center gap-3 lg:hidden">
                <LocaleSwitcher />
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label="Open Menu"
                      className="-m-2.5 -mr-4 relative z-20 block cursor-pointer p-1.5 lg:hidden"
                    >
                      <Menu
                        className={`m-auto size-6 duration-500 ${menuOpen ? "rotate-180 scale-0 opacity-0" : ""}`}
                      />
                      <X
                        className={`-rotate-180 absolute inset-0 m-auto size-6 duration-500 ${menuOpen ? "rotate-0 scale-100 opacity-100" : "scale-0 opacity-0"}`}
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
                          "relative h-8 overflow-hidden transition-all ease-in-out",
                          isScrolled ? "lg:w-0" : "lg:w-fit",
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
                          <Link href="/login">
                            <span>Login</span>
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
                        <Link href="/signup">
                          <span>Sign Up</span>
                        </Link>
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-6 text-base xl:text-xl">
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
              <LocaleSwitcher className="rounded-md" />
              <div
                className={cn(
                  "relative h-8 overflow-hidden transition-all ease-in-out",
                  isScrolled ? "w-0" : "w-fit",
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
                  <Link href="/login">
                    <span>Login</span>
                  </Link>
                </Button>
              </div>

              <Button
                asChild
                size="sm"
                className="transform transition-transform ease-in-out"
              >
                <Link href="/signup">
                  <span>Sign Up</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
