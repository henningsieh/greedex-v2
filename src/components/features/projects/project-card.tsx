import { Edit2Icon, EyeIcon } from "lucide-react";
import { useFormatter } from "next-intl";
import { useState } from "react";
import type { ProjectType } from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import EditProjectForm from "./edit-project-form";

interface ProjectDetailCardProps {
  project: ProjectType;
}

function ProjectCard({ project }: ProjectDetailCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const format = useFormatter();

  return (
    <>
      <Card
        key={project.id}
        className="transition-transform duration-150 hover:scale-[1.01] hover:bg-accent/10 hover:text-accent dark:hover:text-accent-foreground"
      >
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
              {format.dateTime(project.startDate, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div>
              <span className="font-medium">End:</span>{" "}
              {format.dateTime(project.endDate, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="w-full">
          <div className="w-full flex-col gap-2 sm:flex">
            <Button
              className="flex-1 gap-4"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditModalOpen(true);
              }}
            >
              <Edit2Icon />
              Edit Project
            </Button>
            <Button
              asChild
              className="flex-1 gap-4"
              variant="outline"
              size="sm"
              onClick={() => {
                /**
                 * TODO: wire up delete action for this button
                 * use the orpc mutation to delete the project
                 * use the permissions system to check if the user can delete the project
                 */
              }}
            >
              <Link href={`/org/projects/${project.id}`}>
                <EyeIcon />
                View Details
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
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
