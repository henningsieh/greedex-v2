"use client";

import { useTranslations } from "@greendex/i18n/client";
import { useState } from "react";
import { toast } from "sonner";

import { DASHBOARD_PATH } from "@/app/routes";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/better-auth/auth-client";
import { useRouter } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

interface Props {
  invitationId: string;
  className?: string;
}

export function CancelInvitationButton({ invitationId, className }: Props) {
  const router = useRouter();
  const t = useTranslations("organization.invitation.cancel");
  const [loading, setLoading] = useState(false);
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: t("confirm-title"),
      description: t("confirm-description"),
      confirmText: t("confirm-button"),
      cancelText: t("cancel-button"),
      isDestructive: true,
    });

    if (confirmed) {
      setLoading(true);
      try {
        const res = await authClient.organization.cancelInvitation({
          invitationId,
        });
        if (res?.error) {
          toast.error(res.error.message || "Failed to cancel invitation");
          setLoading(false);
          return;
        }
        toast.success("Invitation cancelled!");

        router.push(DASHBOARD_PATH);
      } catch (err) {
        toast.error((err as Error)?.message || "Failed to cancel invitation");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Button
        className={cn(className)}
        disabled={loading}
        onClick={handleCancel}
        variant="destructive"
      >
        {loading ? "Cancelling..." : "Cancel Invitation"}
      </Button>
      <ConfirmDialogComponent />
    </>
  );
}
