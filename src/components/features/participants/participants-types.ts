import type { InferSelectModel } from "drizzle-orm";
import type { projectParticipantsTable } from "@/lib/drizzle/schema";

// Base participant type from schema
export type ProjectParticipantType = InferSelectModel<
  typeof projectParticipantsTable
>;

