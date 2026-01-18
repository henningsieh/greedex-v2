import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { Badge } from "@/components/ui/badge";
import { getCountryData } from "@/lib/i18n/countries";
import { cn } from "@/lib/utils";
import { GlobeIcon } from "lucide-react";
import type { JSX } from "react";

type ProjectLocationProps =
  | {
      /** Object containing `location` (city/area) and `country` (country code or name). */
      project: {
        location?: string;
        country: string;
      };
      /** Visual style: 'badge' for a contained chip, 'inline' for standard text that flows within paragraphs/headers. */
      variant?: "inline" | "badge";
      /** Structure of elements: 'unified' ([Flag] City, Country) or 'split' (City | [Flag] Country). */
      layout?: "unified" | "split";
      /** If true, renders only the flag icon with the location details as a tooltip. */
      flagOnly?: boolean;
      /** Format for displaying country: 'code' for country code. */
      countryFormat: "code";
      /** Whether to render the country flag icon. */
      showFlag?: false;
      /** Optional locale for country data (not required for 'code' format). */
      locale?: string;
      /** Optional CSS classes for custom container styling. */
      className?: string;
    }
  | {
      /** Object containing `location` (city/area) and `country` (country code or name). */
      project: {
        location?: string;
        country: string;
      };
      /** Visual style: 'badge' for a contained chip, 'inline' for standard text that flows within paragraphs/headers. */
      variant?: "inline" | "badge";
      /** Structure of elements: 'unified' ([Flag] City, Country) or 'split' (City | [Flag] Country). */
      layout?: "unified" | "split";
      /** If true, renders only the flag icon with the location details as a tooltip. */
      flagOnly?: boolean;
      /** Format for displaying country: 'name' for full country name (requires locale). */
      countryFormat: "name";
      /** Whether to render the country flag icon. */
      showFlag?: false;
      /** Locale required for resolving country names. */
      locale: string;
      /** Optional CSS classes for custom container styling. */
      className?: string;
    }
  | {
      /** Object containing `location` (city/area) and `country` (country code or name). */
      project: {
        location?: string;
        country: string;
      };
      /** Visual style: 'badge' for a contained chip, 'inline' for standard text that flows within paragraphs/headers. */
      variant?: "inline" | "badge";
      /** Structure of elements: 'unified' ([Flag] City, Country) or 'split' (City | [Flag] Country). */
      layout?: "unified" | "split";
      /** If true, renders only the flag icon with the location details as a tooltip. */
      flagOnly?: boolean;
      /** Format for displaying country: 'name' for full country name, 'code' for country code. */
      countryFormat?: "name" | "code";
      /** Whether to render the country flag icon. Requires 'locale'. */
      showFlag: true;
      /** Locale used for fetching flag and country names. */
      locale: string;
      /** Optional CSS classes for custom container styling. */
      className?: string;
    };

interface ContentProps {
  project: { location?: string; country: string };
  countryDisplay: string;
  renderFlag: () => JSX.Element | null;
  className?: string;
}

const UnifiedContent = ({
  project,
  countryDisplay,
  renderFlag,
  className,
}: ContentProps) => (
  <span
    className={cn("inline-flex items-center gap-1.5 leading-none", className)}
  >
    {renderFlag()}
    <span className="flex items-baseline gap-1">
      <div className="flex gap-0.5">
        {project.location && (
          <span className="font-medium text-foreground">{project.location}</span>
        )}
        {project.location && <span className="text-muted-foreground/60">,</span>}
      </div>
      <span
        className={cn(
          "truncate",
          project.location
            ? "text-muted-foreground"
            : "font-medium text-foreground",
        )}
      >
        {countryDisplay}
      </span>
    </span>
  </span>
);

const SplitContent = ({
  project,
  countryDisplay,
  renderFlag,
  className,
}: ContentProps) => (
  <span
    className={cn("inline-flex items-center gap-1.5 leading-none", className)}
  >
    {project.location && (
      <>
        <span className="font-semibold text-foreground">{project.location}</span>
        <span className="mx-0.5 h-[1em] w-[px] bg-border" />
      </>
    )}
    <span className="flex items-center gap-1.5 text-muted-foreground">
      {renderFlag()}
      <span className="font-medium">{countryDisplay}</span>
    </span>
  </span>
);

/**
 * Reusable component to display project location with optional flag and different variants.
 * @param project - Project data including location and country.
 * @param variant - The visual style of the component.
 * @param layout - The arrangement of text and flag.
 * @param showFlag - Toggle for showing the country flag.
 * @param countryFormat - Format for displaying country: 'name' for full country name, 'code' for country code.
 * @param locale - Locale used for fetching flag and country names.
 * @param className - Additional tailwind classes.
 * @returns A JSX element representing the project location.
 */
export function ProjectLocation({
  layout = "unified",
  variant = "inline",
  flagOnly = false,
  countryFormat = "name",
  locale,
  project,
  showFlag = false,
  className,
}: ProjectLocationProps) {
  const countryData = locale ? getCountryData(project.country, locale) : null;
  const ProjectCountryFlag = countryData?.Flag;
  const countryDisplay =
    countryFormat === "code"
      ? project.country
      : (countryData?.name ?? project.country);

  const renderFlag = () => {
    if (!showFlag) {
      return null;
    }

    return ProjectCountryFlag ? (
      <ProjectCountryFlag
        aria-label={countryDisplay}
        className="h-[1em] w-auto rounded-[2px] object-cover shadow-sm"
      />
    ) : (
      <GlobeIcon className="h-[1em] w-[1em] text-muted-foreground/70" />
    );
  };

  if (flagOnly) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center align-middle",
          className,
        )}
        title={`${project.location ? `${project.location}, ` : ""}${countryDisplay}`}
      >
        {renderFlag() || (
          <GlobeIcon className="h-[1em] w-[1em] text-muted-foreground" />
        )}
      </span>
    );
  }

  const content =
    layout === "unified" ? (
      <UnifiedContent
        className={className}
        countryDisplay={countryDisplay}
        project={project}
        renderFlag={renderFlag}
      />
    ) : (
      <SplitContent
        className={className}
        countryDisplay={countryDisplay}
        project={project}
        renderFlag={renderFlag}
      />
    );

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
