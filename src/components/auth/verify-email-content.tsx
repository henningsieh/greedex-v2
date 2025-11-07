"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { authClient } from "@/lib/better-auth/auth-client";
import { cn } from "@/lib/utils";

export function VerifyEmailContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);

  // 60 second cooldown
  const COOLDOWN_SECONDS = 60;
  const canResend = countdown === 0;

  useEffect(() => {
    if (!lastSentAt) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastSentAt.getTime()) / 1000);
      const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
      setCountdown(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSentAt]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email address is required");
      return;
    }

    if (!canResend) {
      toast.error(`Please wait ${countdown} seconds before resending`);
      return;
    }

    setIsResending(true);
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/login",
      });

      setLastSentAt(new Date());
      setCountdown(COOLDOWN_SECONDS);
      toast.success("Verification email sent successfully!");
    } catch (error: unknown) {
      console.error("Failed to resend verification email:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to send verification email";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <Mail className="size-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="font-bold text-2xl">Email Required</h1>
              <p className="text-balance text-muted-foreground text-sm">
                No email address was provided. Please sign up or log in again.
              </p>
            </div>
          </div>
          <Field>
            <Link href="/signup">
              <Button variant="default" className="w-full">
                Go to Sign Up
              </Button>
            </Link>
          </Field>
        </FieldGroup>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="font-bold text-2xl">Verify your email</h1>
            <p className="text-balance text-muted-foreground text-sm">
              We&apos;ve sent a verification email to
            </p>
            <p className="font-medium text-sm">{email}</p>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="space-y-2 text-center text-sm">
            <p className="font-medium">What happens next?</p>
            <ol className="space-y-1 text-left text-muted-foreground">
              <li>1. Check your inbox for the verification email</li>
              <li>2. Click the verification link in the email</li>
              <li>3. You&apos;ll be automatically signed in and redirected</li>
            </ol>
          </div>
        </div>

        <div className="space-y-3">
          <FieldDescription className="text-center">
            <strong>Important:</strong> You must verify your email before you
            can log in.
          </FieldDescription>

          <Field>
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending || !canResend}
              className="w-full"
            >
              {isResending
                ? "Sending..."
                : canResend
                  ? "Resend verification email"
                  : `Resend in ${countdown}s`}
            </Button>
          </Field>

          <FieldDescription className="text-center text-xs">
            Didn&apos;t receive the email? Check your spam folder or try
            resending.
          </FieldDescription>
        </div>

        <Field>
          <FieldDescription className="text-center">
            <Link href="/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  );
}
