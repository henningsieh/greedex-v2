import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { Organization } from "@/components/features/organizations/types";
import CreateProjectForm from "@/components/features/projects/create-project-form";
import { auth } from "@/lib/better-auth";

export default async function CreateProjectPage() {
  const t = await getTranslations("organization.projects.form.new");

  const organizationsData = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Transform to match your Organization type
  const organizations: Omit<Organization, "metadata">[] = organizationsData.map(
    (org) => ({
      ...org,
      logo: org.logo ?? null, // Convert undefined to null
    }),
  );

  return (
    <div className="p-0">
      <h1 className="font-semibold text-3xl">{t("title")}</h1>
      <CreateProjectForm userOrganizations={organizations} />
    </div>
  );
}
