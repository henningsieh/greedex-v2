import { BusIcon, CarIcon, ShipIcon, TrainIcon } from "lucide-react";
import type { ActivityType } from "@/components/features/projects/activities/types";

interface TransportIconProps {
  type: ActivityType;
  className?: string;
}

export function TransportIcon({
  type,
  className = "h-5 w-5",
}: TransportIconProps) {
  const exhaustiveCheck = (_: never): never => {
    throw new Error(`Unhandled activity type: ${_}`);
  };

  switch (type) {
    case "car":
      return <CarIcon className={className} />;
    case "bus":
      return <BusIcon className={className} />;
    case "train":
      return <TrainIcon className={className} />;
    case "boat":
      return <ShipIcon className={className} />;
    default:
      return exhaustiveCheck(type);
  }
}
