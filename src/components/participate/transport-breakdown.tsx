"use client";

import { TransportIcon } from "@/components/participate/transport-icon";
import {
  activityTypeValues,
  type ProjectStats,
} from "@/components/participate/types";
import { Card } from "@/components/ui/card";

interface TransportBreakdownProps {
  stats: ProjectStats;
}

export function TransportBreakdown({ stats }: TransportBreakdownProps) {
  const maxCO2 = Math.max(
    ...activityTypeValues.map((type) => stats.breakdownByType[type]?.co2 || 0),
  );

  const typeLabels = {
    car: "Car",
    bus: "Bus",
    train: "Train",
    boat: "Boat",
  };

  const typeColors = {
    car: "bg-red-500",
    bus: "bg-orange-500",
    train: "bg-green-500",
    boat: "bg-blue-500",
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <div className="border-primary/20 border-b px-6 py-4">
        <h2 className="font-bold text-foreground text-xl">
          Transport CO₂ Breakdown
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Emissions by transport type
        </p>
      </div>

      <div className="space-y-6 p-6">
        {activityTypeValues.map((type) => {
          const data = stats.breakdownByType[type];
          const co2 = data?.co2 || 0;
          const distance = data?.distance || 0;
          const count = data?.count || 0;
          const percentage = maxCO2 > 0 ? (co2 / maxCO2) * 100 : 0;

          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TransportIcon type={type} className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {typeLabels[type]}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {count} {count === 1 ? "trip" : "trips"} •{" "}
                      {distance.toFixed(0)} km
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-lg">
                    {co2.toFixed(1)}
                  </p>
                  <p className="text-muted-foreground text-xs">kg CO₂</p>
                </div>
              </div>

              <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`absolute inset-y-0 left-0 ${
                    typeColors[type]
                  } rounded-full transition-all duration-500`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
