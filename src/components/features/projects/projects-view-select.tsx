"use client";

import { Grid2X2Icon, TablePropertiesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
          onClick={() => setView("table")}
          size="sm"
          variant={view === "table" ? "default" : "outline"}
        >
          <TablePropertiesIcon className="size-4" />
          <p className="hidden sm:inline">{t("views.table")}</p>
        </Button>
        <Button
          onClick={() => setView("grid")}
          size="sm"
          variant={view === "grid" ? "default" : "outline"}
        >
          <Grid2X2Icon className="size-4" />
          <p className="hidden sm:inline">{t("views.grid")}</p>
        </Button>
      </div>

      {/* Sorting moved to ProjectsGrid to keep grid behaviour internal and consistent with ProjectsTable */}
    </div>
  );
}
