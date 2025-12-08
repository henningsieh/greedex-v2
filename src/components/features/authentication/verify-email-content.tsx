"use client";

import { MailIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { authClient } from "@/lib/better-auth/auth-client";
import { LOGIN_PATH, SIGNUP_PATH } from "@/lib/config/AppRoutes";
import { Link } from "@/lib/i18n/navigation";
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
        callbackURL: LOGIN_PATH,
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
      <Card className={cn("", className)} {...props}>
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <MailIcon className="size-8 text-destructive" />
          </div>
          <CardTitle>
            <h1 className="font-bold text-2xl">Email Required</h1>
          </CardTitle>
          <CardDescription>
            No email address was provided. Please sign up or log in again.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <div />
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Field className="w-full">
            <Link href={SIGNUP_PATH}>
              <Button variant="default" className="w-full">
                Go to Sign Up
              </Button>
            </Link>
          </Field>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <MailIcon className="size-8 text-primary" />
        </div>
        <CardTitle>
          <h1 className="font-bold text-2xl">Verify your email</h1>
        </CardTitle>
        <CardDescription className="text-primary">
          We&apos;ve sent a verification email to
          <div className="mt-1 font-bold italic">{email}</div>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup className="gap-6">
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
          </div>
        </FieldGroup>
      </CardContent>

      <CardFooter>
        <div className="w-full">
          <Field>
            <Button
              variant="default"
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
            <FieldDescription className="px-6 text-center font-bold">
              Didn't receive the email? Check your spam folder or try resending.
            </FieldDescription>
          </Field>
        </div>
      </CardFooter>
    </Card>
  );
}
