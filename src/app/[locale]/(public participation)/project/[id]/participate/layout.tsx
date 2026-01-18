import { ParticipateHeader } from "@/components/features/questionnaire/participate-header";
import { getProjectData } from "@/features/projects/utils";
import { notFound } from "next/navigation";

/**
 * Public Project Participation Layout
 *
 * This layout ensures that new invited participants can access this by public link.
 * No authentication is required.
 * - Unauthenticated users -> can access (public participation) pages
 * - Participants will be onboarded by sending their activities for arrival and departure
 */
export default async function PublicParticipateLayout({
  children,
  params,
}: Readonly<{
  params: Promise<{
    id: string;
  }>;
  children: React.ReactNode;
}>) {
  const { id: projectId } = await params;
  const project = await getProjectData(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8">
      <ParticipateHeader project={project} />
      {children}
    </div>
  );
}
