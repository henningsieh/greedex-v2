import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/better-auth";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      // Signed in but no organization -> create one
      redirect("/org/create");
    } else {
      // Signed in and has orgs -> app dashboard
      redirect("/dashboard");
    }
  }

  // Not signed in -> show auth pages (login/signup/verify-email)
  return <>{children}</>;
}
