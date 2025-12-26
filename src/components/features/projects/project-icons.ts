/**
 * Centralized icon registry for project-related UI elements
 * Use these icons consistently across the application
 */

import {
  ArchiveIcon,
  BabyIcon,
  MapIcon,
  MapPinnedIcon,
  MapPinPlusIcon,
  WaypointsIcon,
} from "lucide-react";

export const PROJECT_ICONS = {
  /** Icon for projects list/plural (dashboard tabs, sidebar, etc.) */
  projects: MapIcon,

  /** Icon for a single project (detail view, breadcrumbs, etc.) */
  project: MapPinnedIcon,

  /** Icon for Adding a new project */
  // addProject: SquarePlusIcon,
  addProject: MapPinPlusIcon,

  /** Icon for project activities (routes, trips, movements) */
  activities: WaypointsIcon,

  /** Icon for project participants */
  participants: BabyIcon,

  /** Icon for archived projects */
  archive: ArchiveIcon,
} as const;
