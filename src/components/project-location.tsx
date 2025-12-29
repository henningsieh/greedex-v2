"use client";

import { GlobeIcon } from "lucide-react";
import type React from "react";
import { PROJECT_ICONS } from "@/components/features/projects/project-icons";
import { Badge } from "@/components/ui/badge";
import { getCountryData } from "@/lib/i18n/countries";
import { cn } from "@/lib/utils";

type ProjectLocationProps = {
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
  /** Optional CSS classes for custom container styling. */
  className?: string;
} /** Whether to render the country flag icon. Requires 'locale'. */ & (
  | { showFlag: true; locale: string }
  | { showFlag?: false; locale?: string }
);

/**
 * Reusable component to display project location with optional flag and different variants.
 * @param project - Project data including location and country.
 * @param variant - The visual style of the component.
 * @param layout - The arrangement of text and flag.
 * @param showFlag - Toggle for showing the country flag.
 * @param flagOnly - Toggle for showing only the flag.
 * @param locale - Locale used for fetching flag and country names.
 * @param className - Additional tailwind classes.
 * @returns A JSX element representing the project location.
 */
export function ProjectLocation({
  layout = "unified",
  variant = "inline",
  flagOnly = false,
  locale,
  project,
  showFlag = false,
  className,
}: ProjectLocationProps) {
  const countryData = locale ? getCountryData(project.country, locale) : null;
  const ProjectCountryFlag = countryData?.Flag;
  const countryName = countryData?.name ?? project.country;

  let flagElement: React.ReactNode = null;
  if (showFlag) {
    if (ProjectCountryFlag) {
      flagElement = (
        <ProjectCountryFlag
          aria-label={countryName}
          className="h-[1em] w-auto rounded-[2px] object-cover shadow-sm"
        />
      );
    } else {
      flagElement = (
        <GlobeIcon className="h-[1em] w-[1em] text-muted-foreground/70" />
      );
    }
  }

  if (flagOnly) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center align-middle",
          className,
        )}
        title={`${project.location ? `${project.location}, ` : ""}${countryName}`}
      >
        {flagElement || (
          <GlobeIcon className="h-[1em] w-[1em] text-muted-foreground" />
        )}
      </span>
    );
  }

  const content = (
    <>
      {layout === "unified" && (
        <span
          className={cn(
            "items-centerleading-none inline-flex items-center gap-1.5",
            className,
          )}
        >
          {flagElement}
          <span className="flex items-baseline gap-1">
            <div className="flex gap-0.5">
              {project.location && (
                <span className="font-medium text-foreground">
                  {project.location}
                </span>
              )}
              {project.location && (
                <span className="text-muted-foreground/60">,</span>
              )}
            </div>
            <span
              className={cn(
                "truncate",
                project.location
                  ? "text-muted-foreground"
                  : "font-medium text-foreground",
              )}
            >
              {countryName}
            </span>
          </span>
        </span>
      )}

      {layout === "split" && (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 leading-none",
            className,
          )}
        >
          {project.location && (
            <>
              <span className="font-semibold text-foreground">
                {project.location}
              </span>
              <span className="mx-0.5 h-[1em] w-[px] bg-border" />
            </>
          )}
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {flagElement}
            <span className="font-medium">{countryName}</span>
          </span>
        </span>
      )}
    </>
  );

  if (variant === "badge") {
    return (
      <Badge
        className={cn(
          "inline-flex gap-2 rounded-md border-border/60 bg-background/50 px-2 py-1 align-middle font-normal text-sm",
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
        "ml-2 inline-flex items-center gap-2 align-baseline text-sm",
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
