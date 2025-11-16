import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/better-auth";
import { redirect } from "@/lib/i18n/navigation";

/**
 * Organization Setup Layout
 *
 * This layout ensures that only authenticated users WITHOUT organizations can access this route group.
 * - Unauthenticated users -> redirected to /login
 * - Authenticated users WITH orgs -> redirected to /org/dashboard
 * - Authenticated users WITHOUT orgs -> can access (org-setup) pages
 */
export default async function OrgSetupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Not authenticated -> send to login
  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  // Authenticated -> check if they have organizations
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const hasOrgs = Array.isArray(organizations) && organizations.length > 0;

  // Already has orgs -> send to app dashboard
  if (hasOrgs) {
    redirect({ href: "/org/dashboard", locale });
  }

  // Authenticated but no orgs -> allow access to org setup flow
  return <>{children}</>;
}
