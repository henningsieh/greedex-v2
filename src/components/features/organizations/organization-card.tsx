import Link from "next/link";
import type { ProjectType } from "@/components/features/projects/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface ProjectDetailCardProps {
  project: ProjectType;
}

function ProjectDetailCard({ project }: ProjectDetailCardProps) {
  return (
    <Link href={`/org/projects/${project.id}`}>
      <Card key={project.id}>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>
            {project.location}, {project.country}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Start:</span>{" "}
              {formatDate(project.startDate)}
            </div>
            <div>
              <span className="font-medium">End:</span>{" "}
              {formatDate(project.endDate)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ProjectDetailCard;
