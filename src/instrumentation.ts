/**
 * Next.js instrumentation file
 * Runs once when the server starts (both dev and production)
 * Used to initialize the server-side oRPC client for SSR optimization
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/lib/orpc/client.server");
  }
}

