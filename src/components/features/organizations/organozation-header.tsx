"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateProjectButton } from "@/components/features/projects/CreateProjectButton";
import { Skeleton } from "@/components/ui/skeleton";
import { orpcQuery } from "@/lib/orpc/orpc";

export function OrganizationHeader() {
  const t = useTranslations("organization.dashboard");

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
        <h1 className="flex items-center justify-start gap-3 font-bold text-3xl text-primary-foreground">
          <Building2Icon />
          {activeOrganization?.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("welcome-to-your-organizations-dashboard")}
        </p>
      </div>
      <CreateProjectButton variant="link" showIcon={false} />
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
