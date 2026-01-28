"use client";

import { useTranslations } from "@greendex/i18n/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { CREATE_PROJECT_PATH } from "@/app/routes";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ORGANIZATION_ICONS } from "@/features/organizations/organization-icons";
import { CreateProjectButton } from "@/features/projects/components/create-project-button";
import { usePathname } from "@/lib/i18n/routing";
import { orpcQuery } from "@/lib/orpc/orpc";

/**
 * Render the organization dashboard header with a translated welcome message, the active organization's name, and an optional "Create Project" button.
 *
 * Reads the active organization from a suspense-prefetched query and hides the "Create Project" button when the current pathname matches the create-project route.
 *
 * @returns A React element representing the organization dashboard header.
 */
export function OrganizationHeader() {
  const t = useTranslations("organization.dashboard");

  const pathname = usePathname();

  // Using oRPC query for active organization details
  // Prefetched in page.tsx, so no loading state on mount
  const { data: activeOrganization } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  return (
    <Card className="border-primary/30 bg-primary/10 shadow-lg dark:border-primary/40 dark:bg-primary/10">
      <CardHeader className="gap-4">
        <CardTitle className="text-sm text-primary/60">
          {t("welcome-to-your-organizations-dashboard")}
        </CardTitle>
        <CardDescription className="flex items-center gap-3 text-3xl font-bold text-primary dark:text-primary-foreground">
          <span className="rounded-full bg-primary/40 p-2 text-primary-foreground">
            <ORGANIZATION_ICONS.organization className="size-5" />
          </span>
          <span>{activeOrganization?.name}</span>
        </CardDescription>
        <CardAction>
          {pathname !== CREATE_PROJECT_PATH && (
            <CreateProjectButton
              className="hidden sm:inline-flex"
              showIcon={true}
              variant="secondary"
            />
          )}
        </CardAction>
      </CardHeader>
    </Card>
  );
}

// UNUSED: DashboardHeaderSkeleton
// export function DashboardHeaderSkeleton() {
//   return (
//     <Card className="border-primary/30 bg-primary/10 shadow-lg dark:border-primary/40 dark:bg-primary/10">
//       <CardHeader className="gap-6">
//         <CardTitle className="text-sm text-primary/60">
//           <Skeleton className="h-4 w-64" />
//         </CardTitle>
//         <CardDescription className="flex items-center gap-3 text-3xl font-bold text-primary dark:text-primary-foreground">
//           <Skeleton className="size-9 rounded-full" />
//           <Skeleton className="h-8 w-48" />
//         </CardDescription>
//         <CardAction>
//           <Skeleton className="h-10 w-42 bg-secondary" />
//         </CardAction>
//       </CardHeader>
//     </Card>
//   );
// }
