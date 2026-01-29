import type { projectParticipantsTable } from "@greendex/database/schema";
import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";

import type {
  ParticipantSchema,
  ProjectParticipantWithUserSchema,
} from "./validation-schemas";

// ============================================================================
// PARTICIPANT TYPES
// ============================================================================

/**
 * Project participant type inferred from DB schema
 */
export type ProjectParticipantType = InferSelectModel<
  typeof projectParticipantsTable
>;

/**
 * Participant with user details
 */
export type ProjectParticipantWithUser = z.infer<
  typeof ProjectParticipantWithUserSchema
>;

/**
 * Participant for UI display (flattened user fields)
 */
export type Participant = z.infer<typeof ParticipantSchema>;
