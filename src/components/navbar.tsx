"use client";

import { Suspense } from "react";
import {
  UserSession,
  UserSessionSkeleton,
} from "@/components/features/authentication/user-session";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Link } from "@/lib/i18n/navigation";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/20 backdrop-blur-sm">
      <div className="mx-auto flex h-[63px] items-center p-2">
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="flex gap-2">
            <Logo />
          </Link>
          <div className="flex items-center gap-1 px-2 sm:gap-2 md:gap-3 lg:gap-4">
            <LocaleSwitcher />
            <ThemeSwitcher />
            <Suspense fallback={<UserSessionSkeleton />}>
              <UserSession />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
}
