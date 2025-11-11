"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { orpcQuery } from "@/lib/orpc/orpc";
import { formatDate } from "@/lib/utils";

export function ProjectsGrid() {
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery(orpcQuery.project.list.queryOptions());

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

  if (!projects || projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>
            Projects will help you organize your work and track activities.
            Start by creating your first project!
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <Plus className="mr-2 size-4" />
            Create Project
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
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
      ))}
    </div>
  );
}
