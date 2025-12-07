"use client";

import { Grid2X2Icon, TablePropertiesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
// import { PROJECT_SORT_FIELDS } from "@/components/features/projects/types"; // unused
import { Button } from "@/components/ui/button";

// Note: Sorting UI moved to `ProjectsGrid` to keep grid sorting internal

interface ProjectsControlsProps {
  view: "grid" | "table";
  setView: (view: "grid" | "table") => void;
}

export function ProjectsViewSelect({ view, setView }: ProjectsControlsProps) {
  const t = useTranslations("organization.projects");

  /* Sorting options handled internally by `ProjectsGrid` */

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant={view === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("table")}
        >
          <TablePropertiesIcon className="size-4" />
          <p className="hidden sm:inline">{t("views.table")}</p>
        </Button>
        <Button
          variant={view === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("grid")}
        >
          <Grid2X2Icon className="size-4" />
          <p className="hidden sm:inline">{t("views.grid")}</p>
        </Button>
      </div>

      {/* Sorting moved to ProjectsGrid to keep grid behaviour internal and consistent with ProjectsTable */}
    </div>
  );
}
