import { Bus, Car, Ship, Train } from "lucide-react";
import type { ActivityType } from "@/components/participate/types";

interface TransportIconProps {
  type: ActivityType;
  className?: string;
}

export function TransportIcon({
  type,
  className = "h-5 w-5",
}: TransportIconProps) {
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
      return null;
  }
}
