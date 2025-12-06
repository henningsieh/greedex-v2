import type { InferSelectModel } from "drizzle-orm";
import type { projectActivitiesTable } from "@/lib/drizzle/schema";

// ============================================================================
// PROJECT ACTIVITY TYPES
// ============================================================================

// Single source of truth for activity types
export const activityTypeValues = ["boat", "bus", "train", "car"] as const;
export type ActivityType = (typeof activityTypeValues)[number];

// Type inferred from DB schema
export type ProjectActivityType = InferSelectModel<typeof projectActivitiesTable>;

