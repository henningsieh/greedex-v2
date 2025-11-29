"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateProjectButton } from "@/components/features/projects/create-project-button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CREATE_PROJECT_PATH } from "@/lib/config/app";
import { usePathname } from "@/lib/i18n/navigation";
import { orpcQuery } from "@/lib/orpc/orpc";

export function OrganizationHeader() {
  const t = useTranslations("organization.dashboard");

  const pathname = usePathname();

  // Using oRPC query for active organization details
  // Prefetched in page.tsx, so no loading state on mount
  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  return (
    <Card className="border-primary/30 bg-primary/5 shadow-lg dark:border-primary/40 dark:bg-primary/10">
      <CardHeader className="gap-4">
        <CardTitle className="text-accent text-sm">
          {t("welcome-to-your-organizations-dashboard")}
        </CardTitle>
        <CardDescription className="flex items-center gap-3 font-bold text-3xl text-primary dark:text-primary-foreground">
          <span className="rounded-full bg-primary/20 p-2 text-primary-foreground">
            <Building2Icon className="size-5" />
          </span>
          <span>{activeOrganization?.name}</span>
        </CardDescription>
        <CardAction>
          {pathname !== CREATE_PROJECT_PATH && (
            <CreateProjectButton
              className="hidden sm:inline-flex"
              variant="secondary"
              showIcon={true}
            />
          )}
        </CardAction>
      </CardHeader>
    </Card>
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
