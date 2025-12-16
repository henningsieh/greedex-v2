"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Users2Icon, UsersIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function ParticipantsList({ activeProjectId }: ParticipantsListProps) {
  const format = useFormatter();
  const t = useTranslations("project.details");

  const { data: participants } = useSuspenseQuery(
    orpcQuery.projects.getParticipants.queryOptions({
      input: {
        projectId: activeProjectId,
      },
    }),
  );

  return (
    <Card className="border border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-secondary" />
          {t("participants")}
        </CardTitle>
        <CardDescription>
          {participants?.length || 0} {t("people-joined")}
        </CardDescription>
      </CardHeader>

      {!participants || participants.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users2Icon className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>{t("no-participants-yet")}</EmptyTitle>
            <EmptyDescription>
              {t("share-the-participation-link")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <CardContent>
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-4 rounded-xl border border-secondary/20 bg-background p-4 transition-colors hover:border-secondary/40 hover:bg-secondary/5"
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
                {t("joined-on")}{" "}
                {format.dateTime(participant.createdAt, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export function ParticipantsListSkeleton() {
  const t = useTranslations("project.details");
  return (
    <Card className="border border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="border border-secondary/30 bg-secondary/10 p-2 text-secondary">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="animate-pulse font-medium text-secondary/70 text-xs uppercase tracking-[0.2em]">
              {t("participants")}
            </div>
            <div className="mt-1 h-6 w-32 animate-pulse rounded bg-secondary/50"></div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {[...Array(7)].map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse items-center gap-4 rounded-xl border border-secondary/20 bg-background p-4"
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
      </CardContent>
    </Card>
  );
}
