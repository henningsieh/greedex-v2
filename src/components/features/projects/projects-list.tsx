"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useFormatter } from "next-intl";
import { Alert } from "@/components/ui/alert";
import { orpcQuery } from "@/lib/orpc/orpc";

function ProjectsList() {
  const { data: projects, error } = useSuspenseQuery(
    orpcQuery.project.list.queryOptions(),
  );
  const format = useFormatter();

  if (error) {
    return (
      <Alert variant="destructive">Error loading projects: {error.message}</Alert>
    );
  }

  return (
    <div>
      <h1>Projects</h1>
      {projects && projects.length > 0 ? (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id}>
              <h2>{project.name}</h2>
              <p>
                Start:{" "}
                {format.dateTime(project.startDate, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p>
                End:{" "}
                {format.dateTime(project.endDate, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p>Location: {project.location}</p>
              <p>Country: {project.country}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects found.</p>
      )}
    </div>
  );
}

export default ProjectsList;
