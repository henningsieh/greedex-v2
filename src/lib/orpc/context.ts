import { os } from "@orpc/server";
import { env } from "@/env";

/**
 * Base context for all oRPC procedures
 * This includes the request headers needed for Better Auth integration
 */
const rawBase = os
  .$context<{
    headers: Headers;
  }>()
  .errors({
    BAD_REQUEST: {
      message: "Bad request",
    },
    NOT_FOUND: {
      message: "Resource not found",
    },
    FORBIDDEN: {
      message: "Access forbidden",
    },
    UNAUTHORIZED: {
      message: "Unauthorized",
    },
    INTERNAL_SERVER_ERROR: {
      message: "Internal server error",
    },
  });

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

/**
 * Inferred error codes from the base context's .errors() definition
 * This type is automatically derived from the errors defined in rawBase
 * and should be used instead of manually defining error codes
 *
 * Type extracts keys from the errorMap using the special "~orpc" property
 * that all oRPC builders expose for type inference
 */
export type BaseErrorCode = keyof (typeof rawBase)["~orpc"]["errorMap"];

// Runtime list of allowed error codes derived from the oRPC builder's error map.
// This is useful for tests and any runtime checks that need to enumerate valid codes.
export const ERROR_CODES: BaseErrorCode[] = Object.keys(
  rawBase["~orpc"].errorMap,
) as BaseErrorCode[];
