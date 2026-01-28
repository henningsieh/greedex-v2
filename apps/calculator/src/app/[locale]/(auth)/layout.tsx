import { getLocale } from "@greendex/i18n";
import { headers } from "next/headers";

import { CREATE_ORG_PATH, DASHBOARD_PATH } from "@/app/routes";
import { auth } from "@/lib/better-auth";
import { redirect } from "@/lib/i18n/routing";

/**
 * Server-side layout that either renders authentication pages or redirects signed-in users to the appropriate app route.
 *
 * If a signed-in user exists, redirects to the dashboard when they belong to at least one organization, otherwise redirects to the organization creation flow. If no signed-in user exists, renders the provided auth-related children (e.g., login, signup, verify-email).
 *
 * @param children - Auth page content to render when there is no active user session.
 * @returns The `children` wrapped in a fragment when no user session is present.
 */
export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If the user is signed in, send them to the proper place:
  if (session?.user) {
    const organizations = await auth.api.listOrganizations({
      headers: await headers(),
    });

    const hasOrgs = Array.isArray(organizations) && organizations.length > 0;

    if (hasOrgs) {
      // Signed in and has orgs -> app dashboard
      redirect({
        href: DASHBOARD_PATH,
        locale,
      });
    } else {
      // Signed in but no organization -> send to org setup flow
      redirect({
        href: CREATE_ORG_PATH,
        locale,
      });
    }
  }

  // Not signed in -> show auth pages (login/signup/verify-email)
  return <>{children}</>;
}
