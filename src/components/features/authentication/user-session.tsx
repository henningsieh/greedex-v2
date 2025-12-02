"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/better-auth/auth-client";
import { LOGIN_PATH } from "@/lib/config/app";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { orpcQuery } from "@/lib/orpc/orpc";

export function UserSession() {
  const router = useRouter();
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  // Show loading during sign out
  if (isSigningOut) {
    return <UserSessionSkeleton />;
  }

  if (!session) {
    return (
      <div className="flex items-center">
        <Button variant="link" asChild className="px-2">
          <Link href={LOGIN_PATH}>Sign in</Link>
        </Button>
      </div>
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 ring-1 ring-border">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User avatar"}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{user.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserSessionSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
    </div>
  );
}
