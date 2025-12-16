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
  .route({ method: "POST" })
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
export const getHealth = base.route({ method: "GET" }).handler(async () => {
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
export const getProfile = authorized
  .route({ method: "GET", path: "/users/profile", summary: "Get user profile" })
  .handler(async ({ context, errors }) => {
    if (!context.user || !context.session) {
      throw errors.UNAUTHORIZED();
    }
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

/**
 * Get authentication session using Better Auth
 * Returns session and user info if authenticated
 */
export const getSession = base
  .route({
    method: "GET",
    path: "/auth/session",
    summary: "Get authentication session",
  })
  .output(SessionSchema)
  .handler(async ({ context, errors }) => {
    try {
      const session = await auth.api.getSession({
        headers: context.headers,
      });
      return session;
    } catch (error) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to fetch session",
        cause: error,
      });
    }
  });

/**
 * Get full organization details using Better Auth
 * Uses Better Auth's implicit getFullOrganization endpoint
 */
export const getFullOrganization = authorized
  .route({
    method: "GET",
    path: "/organizations/active",
    summary: "Get active organization details",
  })
  .handler(async ({ context, errors }) => {
    // Validate active organization first (no try-catch needed for our own throws)
    if (!context.session.activeOrganizationId) {
      throw errors.FORBIDDEN({
        message: "No active organization. Please select an organization first.",
      });
    }

    // Handle Better Auth API call with proper error handling
    try {
      const organization = await auth.api.getFullOrganization({
        headers: context.headers,
      });

      if (!organization) {
        throw errors.NOT_FOUND({
          message: "Organization not found",
        });
      }

      return organization;
    } catch (error) {
      // If it's already an ORPC error, re-throw it
      if (error instanceof ORPCError) {
        throw error;
      }

      // Handle Better Auth specific errors
      console.error("Failed to fetch organization:", error);
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to retrieve organization details",
      });
    }
  });
