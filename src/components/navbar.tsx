"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useState } from "react";
import { UserSession } from "@/components/features/authentication/user-session";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { ThemeKey } from "@/lib/theme";

export function Navbar() {
  const { setTheme } = useTheme();

  const [currentTheme, setCurrentTheme] = useState<ThemeKey | undefined>(
    "system"
  );

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/20 px-8 backdrop-blur-sm">
      <div className="container mx-auto flex h-[63px] items-center">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2">
            <Image
              src="/greendex_logo_small.png"
              alt="Logo"
              width={84}
              height={50}
              // className="rounded-full"
            />
            <p className="-mb-1 hidden self-end font-bold text-2xl text-primary sm:block sm:text-3xl md:text-4xl">
              GREEN<span className="text-muted-foreground">DEX</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher
              value={currentTheme}
              onChange={(t: ThemeKey) => {
                setCurrentTheme(t);
                setTheme(t);
              }}
            />
            <UserSession />
          </div>
        </div>
      </div>
    </nav>
  );
}
