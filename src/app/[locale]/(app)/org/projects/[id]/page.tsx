// src/app/(app)/projects/[id]/page.tsx:

import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ProjectDetails,
  ProjectDetailsSkeleton,
} from "@/components/features/projects/project-details";

export default async function ProjectsDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const t = await getTranslations("project.details");

  return (
    <ErrorBoundary fallback={t("error")}>
      <Suspense fallback={<ProjectDetailsSkeleton />}>
        <ProjectDetails id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
