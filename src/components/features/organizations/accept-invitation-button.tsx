"use client";

import { useState } from "react";
import { toast } from "sonner";

import { DASHBOARD_PATH } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/better-auth/auth-client";
import { useRouter } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

interface Props {
  invitationId: string;
  className?: string;
}

export function AcceptInvitationButton({ invitationId, className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className={cn(className)}
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
      variant="default"
    >
      {loading ? "Accepting..." : "Accept Invitation"}
    </Button>
  );
}
