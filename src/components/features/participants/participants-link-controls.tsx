"use client";

import { CopyIcon, ExternalLinkIcon, Link2Icon, QrCodeIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { env } from "@/env";

interface ParticipationControlsClientProps {
  activeProjectId: string;
}

export function ParticipantsLinkControls({
  activeProjectId,
}: ParticipationControlsClientProps) {
  const t = useTranslations("organization.projects.activeProject");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Generate participation URL
  const participationUrl = activeProjectId
    ? `${env.NEXT_PUBLIC_BASE_URL}/project/${activeProjectId}/participate`
    : "";

  // Generate QR code when modal opens
  useEffect(() => {
    if (isQrModalOpen && participationUrl) {
      QRCode.toDataURL(participationUrl, {
        width: 300,
        margin: 2,
      })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
          toast.error(t("participation.qrError"));
        });
    }
  }, [isQrModalOpen, participationUrl, t]);

  if (!activeProjectId) {
    return null; // or some empty state
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(participationUrl);
    toast.success(t("participation.copySuccess"));
  };

  return (
    <Card className="mb-8 border border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="gap-6">
        <Badge className="inline-flex items-center gap-2 border border-secondary/30 bg-secondary/10 px-3 py-1 font-medium text-secondary text-sm [&>svg]:size-5">
          <Link2Icon className="shrink-0" />
          {t("participation.title")}
        </Badge>
        <CardDescription className="text-muted-foreground text-sm">
          {t("participation.description")}
        </CardDescription>

        <CardAction>
          {/* QR Code Modal */}
          <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
            <DialogTrigger asChild>
              <Button
                // size="lg"
                variant="outline"
                className="size-10 border-secondary/40 text-secondary hover:bg-secondary/10 hover:text-secondary sm:size-fit dark:border-secondary/40"
                onClick={() => setIsQrModalOpen(true)}
              >
                <QrCodeIcon className="size-6" />
                <span className="font hidden text-lg sm:inline">
                  {t("participation.qrButton")}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent
              className="border-secondary/70"
              showCloseButton={false}
            >
              <DialogHeader>
                <DialogTitle className="font-bold text-2xl text-secondary-foreground sm:text-3xl">
                  {t("participation.modalTitle")}
                </DialogTitle>
                <DialogDescription className="text-base text-secondary-foreground/60 sm:text-lg">
                  {t("participation.modalDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                {qrCodeDataUrl ? (
                  <div
                    style={{ backgroundImage: `url(${qrCodeDataUrl})` }}
                    className="h-[300px] w-[300px] rounded-lg border border-secondary/70 bg-center bg-contain bg-no-repeat"
                    role="img"
                    aria-label={t("participation.modalTitle")}
                  />
                ) : (
                  <div className="flex h-[300px] w-[300px] items-center justify-center rounded-lg border border-secondary/70">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
                  </div>
                )}
                <p className="break-all text-center font-mono text-muted-foreground text-xs">
                  {participationUrl}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="mt-6 flex flex-wrap gap-3">
          <InputGroup className="flex-1 border border-secondary/30 bg-background has-[[data-slot=input-group-control]:focus-visible]:border-secondary has-[[data-slot=input-group-control]:focus-visible]:ring-secondary/40">
            <InputGroupInput
              type="text"
              value={participationUrl}
              readOnly
              className="truncate border-0 font-mono text-secondary-foreground text-sm selection:bg-secondary selection:text-secondary-foreground"
              title={t("participation.linkLabel")}
            />
            <InputGroupAddon>
              <InputGroupButton
                variant="secondaryghost"
                size="icon-xs"
                className="rounded-sm text-secondary"
                onClick={copyToClipboard}
                title={t("participation.copyClipboard")}
                aria-label={t("participation.copyClipboard")}
              >
                <CopyIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          {/* Button open link external */}
          <Button
            size="icon"
            variant="secondaryghost"
            className="border-secondary/40 text-secondary sm:w-36"
            asChild
            rel={`noopener noreferrer`}
          >
            <a
              className="flex items-center gap-2"
              href={participationUrl}
              target="_blank"
              rel={`noopener noreferrer`}
            >
              <ExternalLinkIcon className="size-5" />
              <span className="hidden sm:inline">
                {t("participation.openLink")}
              </span>
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ParticipationControlsClientSkeleton() {
  return (
    <Card className="mb-8 space-y-4 border border-secondary/70 bg-secondary/10 p-4">
      <div className="flex items-center justify-between">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-muted" />
          <div className="h-6 w-48 rounded bg-muted" />
        </div>
        <div className="h-8 w-32 rounded bg-muted" />
      </div>
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-5/6 rounded bg-muted" />
      <div className="mt-6 flex flex-wrap gap-2">
        <div className="h-10 flex-1 rounded bg-muted" />
        <div className="h-10 w-32 rounded bg-muted" />
      </div>
    </Card>
  );
}
