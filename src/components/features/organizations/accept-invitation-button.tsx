"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DASHBOARD_PATH } from "@/config/AppRoutes";
import { authClient } from "@/lib/better-auth/auth-client";
import { useRouter } from "@/lib/i18n/routing";

interface Props {
  invitationId: string;
}

export function AcceptInvitationButton({ invitationId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          try {
            const res = await authClient.organization.acceptInvitation({
              invitationId,
            });
            if (res?.error) {
              toast.error(res.error.message || "Failed to accept invitation");
              setLoading(false);
              return;
            }
            toast.success("Invitation accepted!");

            router.push(DASHBOARD_PATH);
          } catch (err) {
            toast.error((err as Error)?.message || "Failed to accept invitation");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Accepting..." : "Accept Invitation"}
      </Button>
    </div>
  );
}
