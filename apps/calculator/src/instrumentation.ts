/**
 * Initialize the server-side oRPC client for SSR when running in the Node.js Next.js runtime.
 *
 * Performs a dynamic import of the server oRPC client if `process.env.NEXT_RUNTIME === "nodejs"`.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize oRPC client
    await import("@/lib/orpc/client.server");
  }
}
