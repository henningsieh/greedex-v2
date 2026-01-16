import { QuestionnaireForm } from "@/components/features/questionnaire/questionnaire-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjectData } from "@/features/projects/utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface ParticipatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ParticipatePage({ params }: ParticipatePageProps) {
  const { id } = await params;

  const project = await getProjectData(id);

  if (!project) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <QuestionnaireForm project={project} />
    </Suspense>
  );
}
