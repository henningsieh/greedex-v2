import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { env } from "@/env";
import { auth } from "@/lib/better-auth";
import { SessionSchema } from "@/lib/better-auth/validation-schemas";
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
    environment: env.NODE_ENV,
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

export const getSession = base
  .output(SessionSchema)
  .handler(async ({ context }) => {
    try {
      const session = await auth.api.getSession({
        headers: context.headers,
      });
      return session;
    } catch (error) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch session",
        cause: error,
      });
    }
  });

/**
 * Get full organization details using Better Auth
 * Uses Better Auth's implicit getFullOrganization endpoint
 */
export const getFullOrganization = authorized.handler(async ({ context }) => {
  const organization = await auth.api.getFullOrganization({
    headers: context.headers,
  });
  return organization;
});
