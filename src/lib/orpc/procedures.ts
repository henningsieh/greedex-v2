import { z } from "zod";
import { base } from "@/lib/orpc/context";
import { authorized } from "@/lib/orpc/middleware";

/**
 * Public hello world procedure
 * Simple demonstration of a basic oRPC procedure
 */
export const helloWorld = base
  .input(
    z.object({
      name: z.string().optional().default("World"),
    }),
  )
  .handler(async ({ input }) => {
    return {
      message: `Hello, ${input.name}!`,
      timestamp: new Date().toISOString(),
    };
  });

/**
 * Public health check procedure
 * Returns server status and uptime
 */
export const getHealth = base.handler(async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };
});

/**
 * Protected procedure example
 * Requires authentication and returns user info
 */
export const getProfile = authorized.handler(async ({ context }) => {
  return {
    user: {
      id: context.user.id,
      name: context.user.name,
      email: context.user.email,
    },
    session: {
      id: context.session.id,
      expiresAt: context.session.expiresAt,
    },
  };
});
