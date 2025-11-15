import type { ProjectType } from "@/components/features/projects/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";
import { formatDate } from "@/lib/utils";

interface ProjectDetailCardProps {
  project: ProjectType;
}

function ProjectCard({ project }: ProjectDetailCardProps) {
  return (
    <Link href={`/org/projects/${project.id}`}>
      <Card
        key={project.id}
        className="transition-transform duration-150 hover:scale-[1.01] hover:bg-accent/10 hover:text-accent dark:hover:text-accent-foreground"
      >
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>{project.name}</CardTitle>
            {/* button to open edit project modal, e.prevent default from link click event */}
          </div>
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

export default ProjectCard;
