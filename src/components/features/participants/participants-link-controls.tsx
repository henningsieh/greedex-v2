"use client";

import { CopyIcon, ExternalLinkIcon, Link2Icon, QrCodeIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

/**
 * Render controls for sharing a project's participation link, including copy, open-in-new-tab, and a QR code modal.
 *
 * @param activeProjectId - The active project's identifier used to construct the participation URL.
 * @returns A card containing the participation URL input, copy/open actions, and a QR code modal; returns `null` when `activeProjectId` is not provided.
 */
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

  // Input ref to focus & select URL for easy copying
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Helper function to select URL text and scroll to start
  const selectUrlText = useCallback(
    (input: HTMLInputElement) => {
      input.setSelectionRange(0, participationUrl.length);
      requestAnimationFrame(() => {
        input.scrollLeft = 0;
      });
    },
    [participationUrl],
  );

  // Auto-focus and select the URL when it's available
  useEffect(() => {
    const input = inputRef.current;
    if (participationUrl && input) {
      // focus without scrolling the page
      input.focus?.({ preventScroll: true } as FocusOptions);
      selectUrlText(input);
    }
  }, [participationUrl, selectUrlText]);

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2Icon className="h-5 w-5 text-secondary" />
          {t("participation.title")}
        </CardTitle>
        <CardDescription>{t("participation.description")}</CardDescription>

        <CardAction>
          {/* QR Code Modal */}
          <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondaryoutline"
                className="size-10 border-secondary/40 text-secondary hover:bg-secondary/10 hover:text-secondary sm:size-fit dark:border-secondary/40"
                onClick={() => setIsQrModalOpen(true)}
              >
                <QrCodeIcon className="size-6" />
                <span className="hidden sm:inline">
                  {t("participation.qrButtonLabel")}
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
              ref={inputRef}
              type="text"
              value={participationUrl}
              readOnly
              onFocus={(e) => {
                selectUrlText(e.currentTarget);
              }}
              className="truncate border-0 font-mono text-muted-foreground text-sm selection:bg-secondary selection:text-secondary-foreground"
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
            variant="secondary"
            className="sm:w-36"
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
