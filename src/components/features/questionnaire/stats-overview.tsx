"use client";

import { Leaf, TreePine, TrendingDown, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ProjectStats } from "@/features/questionnaire/types";

interface StatsOverviewProps {
  stats: ProjectStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/20 to-teal-500/5 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-muted-foreground text-sm">Participants</p>
              <p className="font-bold text-3xl text-foreground">
                {stats.totalParticipants}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/20">
              <Users className="h-6 w-6 text-teal-400" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-muted-foreground text-sm">Total CO₂</p>
              <p className="font-bold text-3xl text-foreground">
                {stats.totalCO2.toFixed(0)}
              </p>
              <p className="text-muted-foreground text-xs">kg emissions</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <Leaf className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-muted-foreground text-sm">Average CO₂</p>
              <p className="font-bold text-3xl text-foreground">
                {stats.averageCO2.toFixed(1)}
              </p>
              <p className="text-muted-foreground text-xs">kg per person</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20">
              <TrendingDown className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-green-500/30 bg-gradient-to-br from-green-500/20 to-green-500/5 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-muted-foreground text-sm">
                Trees to Plant
              </p>
              <p className="font-bold text-3xl text-foreground">
                {stats.treesNeeded}
              </p>
              <p className="text-muted-foreground text-xs">to offset</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <TreePine className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
