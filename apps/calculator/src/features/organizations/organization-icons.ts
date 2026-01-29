/**
 * Centralized icon registry for organization-related UI elements
 * Use these icons consistently across the application
 */

import {
  Building2Icon,
  ChartColumnBigIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  ShieldUserIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

export const ORGANIZATION_ICONS = {
  /** Icon for Organization */
  organization: Building2Icon,

  /** Icon for Organization role */
  role: ShieldUserIcon,

  /** Icon for User/Person */
  person: UserIcon,

  /** Icon for Organization Dashboard */
  dashboard: LayoutDashboardIcon,

  /** Icon for the Organization's Team/Members */
  team: UsersIcon,

  /** Icon for Organization Settings */
  settings: SettingsIcon,

  /** Icon for Organization Statistics */
  statistics: ChartColumnBigIcon,
} as const;
