import { ORPCError } from "@orpc/server";
import { auth } from "@/lib/better-auth";
import { base } from "@/lib/orpc/context";

/**
 * Middleware that validates authentication using Better Auth
 * Adds session and user to the context for protected procedures
 */
export const authMiddleware = base.middleware(async ({ context, next }) => {
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
