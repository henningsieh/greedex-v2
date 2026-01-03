import { headers } from "next/headers";
import { auth } from "@/lib/better-auth";
import type { SessionResponse } from "@/lib/better-auth/types";

export interface AuthCheckResult {
  session: SessionResponse | null;
  hasOrgs: boolean;
  rememberedPath?: string;
}

export async function checkAuthAndOrgs(): Promise<AuthCheckResult> {
  const requestHeaders = await headers();
  const rememberedPath = requestHeaders.get("x-org-requested-path");

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  let hasOrgs = false;
  if (session?.user) {
    try {
      const organizations = await auth.api.listOrganizations({
        headers: requestHeaders,
      });
      hasOrgs = Array.isArray(organizations) && organizations.length > 0;
    } catch (err) {
      hasOrgs = false;
      console.error("Error checking organizations:", err);
    }
  }

  return {
    session,
    hasOrgs,
    rememberedPath: rememberedPath ?? undefined,
  };
}

/**
 * Builds a login URL that redirects the user to a specified next page after authentication.
 *
 * @param rememberedPath - Optional path previously requested by the user to return to after login
 * @param fallbackPath - Path to use when `rememberedPath` is undefined
 * @returns A login URL string containing an encoded `nextPageUrl` query parameter
 */
export function handleUnauthenticatedRedirect(
  rememberedPath: string | undefined,
  fallbackPath: string,
): string {
  const nextPageUrl = rememberedPath ?? fallbackPath;
  return `/login?nextPageUrl=${encodeURIComponent(nextPageUrl)}`;
}
