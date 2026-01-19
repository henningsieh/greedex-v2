/**
 * Centralized icon registry for project-related UI elements
 * Use these icons consistently across the application
 */

import {
  ArchiveIcon,
  BabyIcon,
  FactoryIcon,
  MapIcon,
  MapPinIcon,
  MapPinnedIcon,
  MapPinPlusIcon,
  TreesIcon,
  WaypointsIcon,
} from "lucide-react";

export const PROJECT_ICONS = {
  /** Location icon for a single project (detail view, breadcrumbs, etc.) */
  location: MapPinIcon,

  /** Icon for a single project (detail view, breadcrumbs, etc.) */
  project: MapPinnedIcon,

  /** Icon for projects list/plural (dashboard tabs, sidebar, etc.) */
  projects: MapIcon,

  /** Icon for emissions */
  emissions: FactoryIcon,

  /** Icon for emissions offset (e.g., trees needed) */
  emissions_offset: TreesIcon,

  /** Icon for Adding a new project */
  addProject: MapPinPlusIcon,

  /** Icon for project activities (routes, trips, movements) */
  activities: WaypointsIcon,

  /** Icon for project participants */
  participants: BabyIcon,

  /** Icon for archived projects */
  archive: ArchiveIcon,
} as const;
