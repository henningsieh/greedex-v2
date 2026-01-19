/**
 * @file Create project page
 *
 * Organization create project page with form
 */

import { ContentContainer } from "@/components/content-container";
import { CreateProjectForm } from "@/components/features/projects/create-project-form";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { PageHeader } from "@/components/page-header";
import { auth } from "@/lib/better-auth";
import { getTranslations } from "next-intl/server";
import { headers as nextHeaders } from "next/headers";

/**
 * Render the Create Project page with a localized title and the project creation form.
 *
 * The form receives `activeOrganizationId`, resolved from the session's `activeOrganizationId`,
 * falling back to the first organization id or an empty string when none is available.
 *
 * @returns A React element containing the page header and `CreateProjectForm` with the resolved `activeOrganizationId`.
 */
export default async function CreateProjectPage() {
  const t = await getTranslations("organization.projects.form.new");

  const headers = await nextHeaders();

  const session = await auth.api.getSession({
    headers,
  });
  const organizations = await auth.api.listOrganizations({
    headers,
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  return (
    <div className="space-y-8">
      <PageHeader icon={<PROJECT_ICONS.project />} title={t("title")} />
      <ContentContainer width="sm">
        <CreateProjectForm activeOrganizationId={activeOrganizationId} />
      </ContentContainer>
    </div>
  );
}
