import { os } from "@orpc/server";

/**
 * Base context for all oRPC procedures
 * This includes the request headers needed for Better Auth integration
 */
export const base = os.$context<{
  headers: Headers;
}>();
