import { getLocale } from "next-intl/server";
import { CREATE_ORG_PATH, DASHBOARD_PATH } from "@/lib/config/app";
import { redirect } from "@/lib/i18n/navigation";
import {
  checkAuthAndOrgs,
  handleUnauthenticatedRedirect,
} from "@/lib/utils/auth-utils";

/**
 * Organization Setup Layout
 *
 * This layout ensures that only authenticated users WITHOUT organizations can access this route group.
 * - Unauthenticated users -> redirected to /login (with nextPageUrl preserved)
 * - Authenticated users WITH orgs -> redirected to /org/dashboard
 * - Authenticated users WITHOUT orgs -> can access (org-setup) pages
 */
export default async function OrgSetupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const { session, hasOrgs, rememberedPath } = await checkAuthAndOrgs();

  if (!session?.user) {
    const fallbackPath = CREATE_ORG_PATH;
    const href = handleUnauthenticatedRedirect(rememberedPath, fallbackPath);
    redirect({
      href,
      locale,
    });
  }

  if (hasOrgs) {
    redirect({
      href: DASHBOARD_PATH,
      locale,
    });
  }

  return <>{children}</>;
}
