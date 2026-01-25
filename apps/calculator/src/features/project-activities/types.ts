import type { InferSelectModel } from "drizzle-orm";

import type { projectActivitiesTable } from "@/lib/drizzle/schema";

// ============================================================================
// PROJECT ACTIVITY TYPES
// ============================================================================

/**
 * Project activity type inferred from DB schema
 */
export type ProjectActivityType = InferSelectModel<typeof projectActivitiesTable>;

/**
 * Re-export activity value type from config for convenience
 */
export type { ActivityValueType } from "@greendex/config/activities";
