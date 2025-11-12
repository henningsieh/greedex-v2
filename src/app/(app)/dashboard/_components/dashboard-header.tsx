"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/better-auth/auth-client";

export function DashboardHeader() {
  const { data: session } = authClient.useSession();
  const { data: organizations } = useQuery({
    queryKey: ["better-auth", "organizations"],
    queryFn: async () => {
      const orgs = await authClient.organization.list();
      return orgs.data || [];
    },
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations?.[0]?.id || "";

  const activeOrganization = organizations?.find(
    (org) => org.id === activeOrganizationId,
  );

  if (!organizations) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Loading...</h1>
          <p className="text-muted-foreground">
            Welcome to your organization's dashboard
          </p>
        </div>
        <Button asChild variant="link">
          <Link href="/create-project">Create New Project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-bold text-3xl">{activeOrganization?.name}</h1>
        <p className="text-muted-foreground">
          Welcome to your organization's dashboard
        </p>
      </div>

      <Button asChild variant="link">
        <Link href="/create-project">Create New Project</Link>
      </Button>
    </div>
  );
}
