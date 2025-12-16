/**
 * Centralized icon registry for project-related UI elements
 * Use these icons consistently across the application
 */

import { BabyIcon, MapIcon, MapPinnedIcon, WaypointsIcon } from "lucide-react";

export const PROJECT_ICONS = {
  /** Icon for projects list/plural (dashboard tabs, sidebar, etc.) */
  projects: MapIcon,

  /** Icon for a single project (detail view, breadcrumbs, etc.) */
  project: MapPinnedIcon,

  /** Icon for project activities (routes, trips, movements) */
  activities: WaypointsIcon,

  /** Icon for project participants */
  participants: BabyIcon,
} as const;
