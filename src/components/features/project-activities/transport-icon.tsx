import { PROJECT_ACTIVITIES_ICONS } from "./activities-icons";

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
