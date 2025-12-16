"use client";

import { Leaf, Trophy } from "lucide-react";
import type { Participant } from "@/components/participate/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  participants: Participant[];
}

export function Leaderboard({ participants }: LeaderboardProps) {
  // Sort by lowest CO₂ (most sustainable)
  const sortedParticipants = [...participants].sort(
    (a, b) => a.totalCO2 - b.totalCO2,
  );

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm">
      <div className="border-primary/20 border-b bg-gradient-to-r from-teal-500/20 to-emerald-500/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-teal-400" />
          <h2 className="font-bold text-2xl text-foreground">
            Sustainability Champions
          </h2>
        </div>
        <p className="mt-1 text-muted-foreground text-sm">
          Ranked by lowest CO₂ emissions
        </p>
      </div>

      <div className="divide-y divide-border/50">
        {sortedParticipants.map((participant, index) => {
          const isTopThree = index < 3;
          const medals = ["🥇", "🥈", "🥉"];

          return (
            <div
              key={participant.id}
              className={cn(
                "px-6 py-4 transition-all duration-300 hover:bg-accent/50",
                isTopThree && "bg-gradient-to-r from-teal-500/5 to-emerald-500/5",
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    {isTopThree ? (
                      <span className="text-2xl">{medals[index]}</span>
                    ) : (
                      <span className="font-bold text-lg text-muted-foreground">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-foreground">
                        {participant.name}
                      </h3>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs">
                        {participant.country}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {participant.activities.length}{" "}
                      {participant.activities.length === 1
                        ? "journey"
                        : "journeys"}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Leaf className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-2xl text-teal-400">
                      {participant.totalCO2.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground text-sm">kg CO₂</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
