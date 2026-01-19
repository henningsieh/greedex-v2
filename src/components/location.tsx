import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { Badge } from "@/components/ui/badge";
import { getCountryData } from "@/lib/i18n/countries";
import { cn } from "@/lib/utils";
import { GlobeIcon } from "lucide-react";

interface LocationProps {
  /** Country code (e.g., 'DE', 'US') */
  countryCode: string;
  /** Locale for i18n (e.g., 'en', 'de') */
  locale: string;
  /** Optional location/city name */
  location?: string;
  /** Visual style: 'inline' or 'badge' */
  variant?: "inline" | "badge";
  /** Show only the flag icon with tooltip */
  flagOnly?: boolean;
  /** Show the flag icon */
  showFlag?: boolean;
  /** Optional CSS classes */
  className?: string;
}

/**
 * Display a location with country flag and optional city name.
 *
 * @param countryCode - Country code (e.g., 'DE', 'US')
 * @param locale - Locale for i18n translation
 * @param location - Optional city/location name
 * @param variant - Visual style: 'inline' or 'badge'
 * @param flagOnly - Show only flag with tooltip
 * @param showFlag - Show the flag icon
 * @param className - Additional CSS classes
 */
export function Location({
  countryCode,
  locale,
  location,
  variant = "inline",
  flagOnly = false,
  showFlag = false,
  className,
}: LocationProps) {
  const data = getCountryData(countryCode, locale);
  const countryName = data?.name ?? countryCode;
  const Flag = data?.Flag;

  // Flag element
  const flagElement = Flag ? (
    <Flag
      aria-label={countryName}
      className="h-[1em] w-auto rounded-[2px] object-cover shadow-sm"
    />
  ) : (
    <GlobeIcon className="h-[1em] w-[1em] text-muted-foreground/70" />
  );

  // Flag only mode - just show flag with tooltip
  if (flagOnly) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center align-middle",
          className,
        )}
        title={`${location ? `${location}, ` : ""}${countryName}`}
      >
        {flagElement}
      </span>
    );
  }

  // Content: flag + location + country name
  const content = (
    <span className="inline-flex items-center gap-1.5 leading-none">
      {showFlag && flagElement}
      <span className="flex items-baseline gap-1">
        {location && (
          <>
            <span className="font-medium text-foreground">{location}</span>
            <span className="text-muted-foreground/60">,</span>
          </>
        )}
        <span
          className={cn(
            "truncate",
            location ? "text-muted-foreground" : "font-medium text-foreground",
          )}
        >
          {countryName}
        </span>
      </span>
    </span>
  );

  // Badge variant
  if (variant === "badge") {
    return (
      <Badge
        className={cn(
          "inline-flex gap-2 rounded-md border-border/60 bg-background/50 px-2 py-1 align-middle text-sm font-normal",
          className,
        )}
        variant="outline"
      >
        {content}
      </Badge>
    );
  }

  // Inline variant
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 align-baseline text-sm",
        className,
      )}
    >
      {!showFlag && (
        <PROJECT_ICONS.location className="h-[1em] w-[1em] text-muted-foreground/70" />
      )}
      {content}
    </span>
  );
}

/**
 * @deprecated Use Location component instead. This component will be removed in a future version.
 *
 * Legacy component for backward compatibility during migration.
 */
export function ProjectLocation({
  project,
  locale,
  variant,
  flagOnly,
  showFlag,
  className,
}: {
  project: { location?: string; country: string };
  locale: string;
  variant?: "inline" | "badge";
  flagOnly?: boolean;
  showFlag?: boolean;
  className?: string;
}) {
  return (
    <Location
      className={className}
      countryCode={project.country}
      flagOnly={flagOnly}
      locale={locale}
      location={project.location}
      showFlag={showFlag}
      variant={variant}
    />
  );
}
