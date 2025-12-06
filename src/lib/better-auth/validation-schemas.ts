import { z } from "zod";
import type { SessionResponse } from "@/lib/better-auth/types";

/**
 * Get current session using Better Auth
 * Returns null if user is not authenticated
 */
export const SessionSchema = z.custom<SessionResponse | null>(
  (val): val is SessionResponse | null =>
    val === null || (typeof val === "object" && val !== null),
);
