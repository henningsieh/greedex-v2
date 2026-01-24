/**
 * Centralized icon registry for activity-related UI elements
 * Use these icons consistently across the application for all activity types
 */

import { BusIcon, CarIcon, PlaneIcon, ShipIcon, TrainIcon } from "lucide-react";

export const PROJECT_ACTIVITIES_ICONS = {
  /** Icon for boat/ship activity */
  boat: ShipIcon,

  /** Icon for bus activity */
  bus: BusIcon,

  /** Icon for train activity */
  train: TrainIcon,

  /** Icon for car activity */
  car: CarIcon,

  /** Icon for plane activity */
  plane: PlaneIcon,

  /** Icon for electric car activity */
  electricCar: CarIcon,
} as const;
