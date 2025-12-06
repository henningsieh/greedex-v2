import { os } from "@orpc/server";
import { env } from "@/env";

/**
 * Base context for all oRPC procedures
 * This includes the request headers needed for Better Auth integration
 */
const rawBase = os.$context<{
  headers: Headers;
}>();

/**
 * Demo delay middleware
 * Applies a configurable artificial delay to all oRPC procedures. This is
 * useful for demonstrating loading UIs and can be toggled via
 * the ORPC_DEV_DELAY_MS environment variable. Default is 3000ms.
 * Delay is applied uniformly to all oRPC invocations, regardless of execution context.
 */
const ORPC_DELAY_IN_MS = Number(env.ORPC_DEV_DELAY_MS);
const DEV_DELAY_ENABLED = env.NODE_ENV === "development" && ORPC_DELAY_IN_MS > 0;
const delayMiddleware = rawBase.middleware(async ({ next, path }) => {
  if (!DEV_DELAY_ENABLED) return next();

  try {
    console.log(
      "[oRPC] call",
      { path },
      `has been delayed by ${ORPC_DELAY_IN_MS}ms`,
    );
  } catch (err) {
    console.warn("[oRPC] logging failed", err);
  }

  await new Promise((resolve) => setTimeout(resolve, ORPC_DELAY_IN_MS));
  return next();
});

export const rootBase = rawBase;
export const base = rawBase.use(delayMiddleware);
