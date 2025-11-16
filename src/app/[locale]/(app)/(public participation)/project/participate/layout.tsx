/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: ongoing work */
/** biome-ignore-all lint/correctness/noUnusedVariables: ongoing work */
import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/better-auth";

/**
 * Public Project Participation Layout
 *
 * This layout ensures that new invited participants can access this by public link.
 * No authentication is required.
 * - Unauthenticated users -> can access (public participation) pages
 * - Participants will be onboarded by sending their activities for arrival and departure
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
}
