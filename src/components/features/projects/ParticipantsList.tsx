"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Users2Icon, UsersIcon } from "lucide-react";
import { useFormatter } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { orpcQuery } from "@/lib/orpc/orpc";

interface ParticipantsListProps {
  activeProjectId: string;
}

export default function ParticipantsList({
  activeProjectId,
}: ParticipantsListProps) {
  const format = useFormatter();

  const { data: participants } = useSuspenseQuery(
    orpcQuery.project.getParticipants.queryOptions({
      input: { projectId: activeProjectId },
    }),
  );

  return (
    <div className="rounded-md border border-secondary/70 bg-secondary/10 p-4">
      <div className="mb-4 flex items-center gap-2">
        <UsersIcon className="h-5 w-5 text-secondary" />
        <h2 className="font-semibold text-lg">
          Participants ({participants?.length || 0})
        </h2>
      </div>

      {!participants || participants.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users2Icon className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>No participants yet</EmptyTitle>
            <EmptyDescription>
              Share the participation link to invite people to this project.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
            >
              <Avatar>
                <AvatarImage
                  src={participant.user.image || undefined}
                  alt={participant.user.name}
                />
                <AvatarFallback>
                  {participant.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{participant.user.name}</p>
                <p className="text-muted-foreground text-sm">
                  {participant.user.email}
                </p>
              </div>
              <div className="text-muted-foreground text-sm">
                Joined{" "}
                {format.dateTime(participant.createdAt, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export function ParticipantsListSkeleton() {
  return (
    <div className="rounded-md border border-secondary/70 bg-secondary/10 p-4">
      <div className="mb-4 flex items-center gap-2">
        <UsersIcon className="h-5 w-5 text-secondary" />
        <h2 className="font-semibold text-lg">Participants</h2>
      </div>

      <div className="space-y-2">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4 rounded-lg border p-4"
          >
            <div className="h-10 w-10 rounded-full bg-secondary/50" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-secondary/50" />
              <div className="h-3 w-1/2 rounded bg-secondary/50" />
            </div>
            <div className="h-3 w-24 rounded bg-secondary/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
