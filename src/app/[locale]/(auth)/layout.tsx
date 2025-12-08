import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/better-auth";
import { CREATE_ORG_PATH, DASHBOARD_PATH } from "@/lib/config/AppRoutes";
import { redirect } from "@/lib/i18n/navigation";

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

    if (!hasOrgs) {
      // Signed in but no organization -> send to org setup flow
      redirect({
        href: CREATE_ORG_PATH,
        locale,
      });
    } else {
      // Signed in and has orgs -> app dashboard
      redirect({
        href: DASHBOARD_PATH,
        locale,
      });
    }
  }

  // Not signed in -> show auth pages (login/signup/verify-email)
  return <>{children}</>;
}
