import type { projectActivitiesTable } from "@greendex/database/schema";
import type { InferSelectModel } from "drizzle-orm";

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
