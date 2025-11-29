import { auth } from "@/lib/better-auth";
import type { SessionResponse } from "@/lib/better-auth/types";

export interface AuthCheckResult {
  session: SessionResponse | null;
  hasOrgs: boolean;
  rememberedPath?: string;
}

export async function checkAuthAndOrgs(): Promise<AuthCheckResult> {
  const headers = require("next/headers").headers;
  const requestHeaders = await headers();
  const rememberedPath = requestHeaders.get("x-org-requested-path") ?? undefined;

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
    rememberedPath,
  };
}

export function handleUnauthenticatedRedirect(
  rememberedPath: string | undefined,
  fallbackPath: string,
): string {
  const nextPageUrl = rememberedPath ?? fallbackPath;
  return `/login?nextPageUrl=${encodeURIComponent(nextPageUrl)}`;
}
