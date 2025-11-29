import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QuestionnaireForm } from "@/components/participate/questionnaire-form";
import { Skeleton } from "@/components/ui/skeleton";

interface ParticipatePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock project data fetch - replace with actual data fetching later
async function getProjectData(projectId: string) {
  // TODO: Fetch actual project data from database
  // For now, return mock data
  return {
    id: projectId,
    name: "Summer Youth Exchange 2024",
    location: "Barcelona, Spain",
    country: "Spain",
    startDate: new Date("2024-07-15"),
    endDate: new Date("2024-07-22"),
    welcomeMessage:
      "Welcome to our Erasmus+ Youth Exchange! We're excited to have you join us in calculating the carbon footprint of your journey.",
  };
}

export default async function ParticipatePage({ params }: ParticipatePageProps) {
  const { id } = await params;

  const project = await getProjectData(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8">
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
    </div>
  );
}
