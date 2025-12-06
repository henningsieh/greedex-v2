import { ORPCError } from "@orpc/server";
import type { ProjectPermission } from "@/components/features/projects/permissions";
import { auth } from "@/lib/better-auth";
import { base, rootBase } from "@/lib/orpc/context";

/**
 * Middleware that validates authentication using Better Auth
 * Adds session and user to the context for protected procedures
 */
const authMiddleware = rootBase.middleware(async ({ context, next }) => {
  const sessionData = await auth.api.getSession({
    headers: context.headers,
  });

  if (!sessionData?.session || !sessionData?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  // Add session and user to context
  return next({
    context: {
      session: sessionData.session,
      user: sessionData.user,
    },
  });
});

/**
 * Base for authenticated procedures
 * Use this instead of `base` when creating procedures that require authentication
 */
export const authorized = base.use(authMiddleware);

/**
 * Middleware that checks for specific project permissions
 * Must be used after authMiddleware (use with `authorized` base)
 *
 * @param permissions - Array of required project permissions
 * @example
 * ```ts
 * const createProject = authorized
 *   .use(requireProjectPermissions(["create"]))
 *   .handler(...)
 * ```
 */
export const requireProjectPermissions =
  (permissions: ProjectPermission[]) =>
  async ({
    context,
    next,
  }: Parameters<Parameters<typeof authorized.use>[0]>[0]) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("FORBIDDEN", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Check if user has the required permissions using Better Auth's API
    const hasPermission = await auth.api.hasPermission({
      headers: context.headers,
      body: {
        permissions: {
          project: permissions,
        },
      },
    });

    if (!hasPermission) {
      throw new ORPCError("FORBIDDEN", {
        message: `Missing required permissions: ${permissions.join(", ")}`,
      });
    }

    return next();
  };
