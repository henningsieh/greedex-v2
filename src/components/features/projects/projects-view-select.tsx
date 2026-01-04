"use client";

import { SheetIcon, TablePropertiesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// Note: Sorting UI moved to `ProjectsGrid` to keep grid sorting internal

interface ProjectsControlsProps {
  view: "grid" | "table";
  setView: (view: "grid" | "table") => void;
}

/**
 * Render view-toggle controls that let the user switch between "table" and "grid" views.
 *
 * Displays two buttons for "Table" and "Grid", highlights the active view, and invokes `setView` with either `"table"` or `"grid"` when a button is clicked.
 *
 * @param view - The currently selected view, either `"grid"` or `"table"`.
 * @param setView - Callback invoked with the new view (`"grid"` or `"table"`) to update the selection.
 * @returns The JSX element containing the view toggle buttons.
 */
export function ProjectsViewSelect({ view, setView }: ProjectsControlsProps) {
  const t = useTranslations("organization.projects");

  /* Sorting options handled internally by `ProjectsGrid` */

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          className="w-8 sm:w-42"
          onClick={() => setView("table")}
          size="sm"
          variant={view === "table" ? "secondary" : "secondaryoutline"}
        >
          <TablePropertiesIcon className="size-5 scale-x-[-1]" />
          <p className="hidden sm:inline">{t("views.table")}</p>
        </Button>
        <Button
          className="w-8 sm:w-42"
          onClick={() => setView("grid")}
          size="sm"
          variant={view === "grid" ? "secondary" : "secondaryoutline"}
        >
          <SheetIcon className="size-5" />
          <p className="hidden sm:inline">{t("views.grid")}</p>
        </Button>
      </div>

      {/* Sorting moved to ProjectsGrid to keep grid behaviour internal and consistent with ProjectsTable */}
    </div>
  );
}
