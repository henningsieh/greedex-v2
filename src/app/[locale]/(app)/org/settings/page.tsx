/**
 * @file Settings page
 *
 * Organization settings page with edit organization form
 */

import { SettingsIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import EditOrganizationForm, {
  EditOrganizationFormSkeleton,
} from "@/components/features/organizations/edit-organization-form";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/react-query/hydration";

export default async function SettingsPage() {
  const t = await getTranslations("organization.settings");

  const queryClient = getQueryClient();

  // Prefetch organization data for SSR
  void queryClient.prefetchQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  return (
    <HydrateClient client={queryClient}>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-start gap-3">
            <SettingsIcon className="mb-1.5 size-9" />
            <h2 className="font-bold font-sans text-4xl">{t("title")}</h2>
          </div>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Suspense fallback={<EditOrganizationFormSkeleton />}>
          <EditOrganizationForm />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
