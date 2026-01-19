/**
 * @file Settings page
 *
 * Organization settings page with edit organization form
 */

import { ContentContainer } from "@/components/content-container";
import {
  EditOrganizationForm,
  EditOrganizationFormSkeleton,
} from "@/components/features/organizations/edit-organization-form";
import { ORGANIZATION_ICONS } from "@/components/features/organizations/organization-icons";
import { PageHeader } from "@/components/page-header";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function SettingsPage() {
  const t = await getTranslations("organization.settings");

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<ORGANIZATION_ICONS.settings />}
        title={t("title")}
        description={t("description")}
      />
      <ContentContainer width="sm">
        <Suspense fallback={<EditOrganizationFormSkeleton />}>
          <EditOrganizationForm />
        </Suspense>
      </ContentContainer>
    </div>
  );
}
