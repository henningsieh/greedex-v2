"use client";

import type { ProjectStats } from "@/features/participate/types";

import { Card } from "@/components/ui/card";
import { ACTIVITY_VALUES } from "@/config/activities";
import { PROJECT_ACTIVITIES_ICONS } from "@/features/project-activities/activities-icons";

interface TransportIconProps {
  type: keyof typeof PROJECT_ACTIVITIES_ICONS;
  className?: string;
}

export function TransportIcon({
  type,
  className = "size-5",
}: TransportIconProps) {
  const Icon = PROJECT_ACTIVITIES_ICONS[type];
  return <Icon className={className} />;
}

interface TransportBreakdownProps {
  stats: ProjectStats;
}

/**
 * Render a card showing CO₂ emissions broken down by transport type.
 *
 * @param stats - Project statistics; expected shape includes `breakdownByType` mapping each transport type to an object with `co2`, `distance`, and `count` metrics
 * @returns A JSX element displaying each transport type's CO₂ (kg), trip count, distance (km), and a proportional progress bar
 */
export function TransportBreakdown({ stats }: TransportBreakdownProps) {
  const maxCO2 = Math.max(
    ...ACTIVITY_VALUES.map((type) => stats.breakdownByType[type]?.co2 || 0),
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
      <div className="border-b border-primary/20 px-6 py-4">
        <h2 className="text-xl font-bold text-foreground">
          Transport CO₂ Breakdown
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Emissions by transport type
        </p>
      </div>

      <div className="space-y-6 p-6">
        {ACTIVITY_VALUES.map((type) => {
          const data = stats.breakdownByType[type];
          const co2 = data?.co2 || 0;
          const distance = data?.distance || 0;
          const count = data?.count || 0;
          const percentage = maxCO2 > 0 ? (co2 / maxCO2) * 100 : 0;

          return (
            <div className="space-y-2" key={type}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <TransportIcon className="size-5 text-primary" type={type} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {typeLabels[type]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {count} {count === 1 ? "trip" : "trips"} •{" "}
                      {distance.toFixed(0)} km
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    {co2.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">kg CO₂</p>
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
