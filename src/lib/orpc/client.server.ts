import "server-only";

import { createRouterClient } from "@orpc/server";
import { headers } from "next/headers";
import { router } from "@/lib/orpc/router";

/**
 * Server-side oRPC client for SSR optimization
 * This client executes procedures directly without HTTP overhead
 *
 * The client is attached to globalThis to be accessible from client.ts
 */
globalThis.$client = createRouterClient(router, {
  /**
   * Provide initial context with headers for each request
   * Using a function ensures headers are fetched per-request
   */
  context: async () => ({
    headers: await headers(),
  }),
});

