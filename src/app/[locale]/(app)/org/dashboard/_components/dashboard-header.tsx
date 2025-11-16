"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/lib/i18n/navigation";
import { orpcQuery } from "@/lib/orpc/orpc";

export function DashboardHeader() {
  const t = useTranslations("organization");

  // Using oRPC queries for stable SSR hydration
  // Prefetched in page.tsx, so no loading state on mount
  const { data: session } = useSuspenseQuery(
    orpcQuery.betterauth.getSession.queryOptions(),
  );

  const { data: organizations } = useSuspenseQuery(
    orpcQuery.organization.list.queryOptions(),
  );

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations?.[0]?.id || "";

  const activeOrganization = organizations?.find(
    (org) => org.id === activeOrganizationId,
  );

  return (
    <div className="flex items-center justify-between rounded-md border border-accent/70 bg-accent/10">
      <div className="space-y-2 p-4">
        <h1 className="font-bold text-2xl text-accent">
          {activeOrganization?.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("dashboard.welcome-to-your-organizations-dashboard")}
        </p>
      </div>
      <Button asChild variant="link">
        <Link href="/create-project">{t("button.create")}</Link>
      </Button>
    </div>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
