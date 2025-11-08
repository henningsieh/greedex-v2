import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/better-auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ensure the user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    // Not authenticated -> send to login (auth group).
    // The (auth) directory is a route group, its login page is at '/login'.
    redirect("/login");
  }

  // If authenticated, ensure they have an organization
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const hasOrgs = Array.isArray(organizations) && organizations.length > 0;

  if (!hasOrgs) {
    // Authenticated but no orgs -> create one
    redirect("/org/create");
  }

  // Authenticated and has orgs -> allow rendering of the protected app
  return (
    <>
      <Navbar />
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col">
        {children}
      </main>
    </>
  );
}
