"use client";

import { UserSession } from "@/components/features/authentication/user-session";
import Logo from "@/components/logo";
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
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <UserSession />
          </div>
        </div>
      </div>
    </nav>
  );
}
