"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { orpcQuery } from "@/lib/orpc/orpc";
import { formatDate } from "@/lib/utils";

interface ProjectDetailsProps {
  id: string;
}

function ProjectDetails({ id }: ProjectDetailsProps) {
  const { data } = useSuspenseQuery(
    orpcQuery.project.getById.queryOptions({ input: { id } }),
  );

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        {/* Project Header */}
        <div className="rounded-lg bg-gradient-to-tl from-primary/60 to-accent p-8 shadow-lg">
          <h1 className="mb-2 font-bold text-3xl">{data.name}</h1>
          <p className="text-lg">{data.country}</p>
        </div>

        {/* Project Details Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-medium text-gray-600 text-sm">
                  Start Date
                </Label>
                <p className="font-semibold text-lg">
                  {formatDate(data.startDate)}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-gray-600 text-sm">
                  End Date
                </Label>
                <p className="font-semibold text-lg">
                  {formatDate(data.endDate)}
                </p>
              </div>
            </div>

            {data.location && (
              <div className="space-y-2">
                <Label className="font-medium text-gray-600 text-sm">
                  Location
                </Label>
                <p className="text-lg">{data.location}</p>
              </div>
            )}

            {data.welcomeMessage && (
              <div className="space-y-2">
                <Label className="font-medium text-gray-600 text-sm">
                  Welcome Message
                </Label>
                <p className="rounded-md bg-gray-50 p-4 text-lg italic">
                  {data.welcomeMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for future features */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Participants will be displayed here.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Project activities will be displayed here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;
