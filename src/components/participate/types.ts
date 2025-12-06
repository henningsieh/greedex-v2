import type { ActivityType } from "@/components/features/project-activities/types";

// CO₂ emission factors (kg CO₂ per km per person)
export const CO2_FACTORS: Record<ActivityType, number> = {
  car: 0.192, // Average car
  train: 0.041,
  bus: 0.089,
  boat: 0.115, // Ferry/cruise average
};

export interface Participant {
  id: string;
  name: string;
  country: string;
  totalCO2: number;
  activities: Activity[];
  rank?: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  distanceKm: number;
  co2Kg: number;
}

export interface ProjectStats {
  totalParticipants: number;
  totalCO2: number;
  averageCO2: number;
  breakdownByType: Record<
    ActivityType,
    {
      distance: number;
      co2: number;
      count: number;
    }
  >;
  treesNeeded: number; // Average tree absorbs ~22kg CO₂ per year, ~1 ton in lifetime (~45 years)
}

