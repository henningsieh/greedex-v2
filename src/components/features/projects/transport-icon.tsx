import { Bus, Car, Ship, Train } from "lucide-react";
import type { ActivityType } from "@/components/features/projects/types";

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
      return <Car className={className} />;
    case "bus":
      return <Bus className={className} />;
    case "train":
      return <Train className={className} />;
    case "boat":
      return <Ship className={className} />;
    default:
      return exhaustiveCheck(type);
  }
}
