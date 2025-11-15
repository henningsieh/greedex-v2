import { useState } from "react";
import type { ProjectType } from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/lib/i18n/navigation";
import { formatDate } from "@/lib/utils";
import EditProjectForm from "./edit-project-form";

interface ProjectDetailCardProps {
  project: ProjectType;
}

function ProjectCard({ project }: ProjectDetailCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <Link href={`/org/projects/${project.id}`}>
        <Card
          key={project.id}
          className="transition-transform duration-150 hover:scale-[1.01] hover:bg-accent/10 hover:text-accent dark:hover:text-accent-foreground"
        >
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>{project.name}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
              >
                Edit
              </Button>
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
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <EditProjectForm
            project={project}
            onSuccess={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProjectCard;
