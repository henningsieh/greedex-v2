import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { OrganizationType } from "@/components/features/organizations/types";
import CreateProjectForm from "@/components/features/projects/create-project-form";
import { auth } from "@/lib/better-auth";

export default async function CreateProjectPage() {
  const t = await getTranslations("project.create");

  const organizationsData = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Transform to match your Organization type
  const organizations: Omit<OrganizationType, "metadata">[] =
    organizationsData.map((org) => ({
      ...org,
      logo: org.logo ?? null, // Convert undefined to null
    }));

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 font-semibold text-2xl">{t("title")}</h1>
      <CreateProjectForm userOrganizations={organizations} />
    </div>
  );
}
