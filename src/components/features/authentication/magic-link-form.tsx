"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FormField from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/better-auth/auth-client";
import { cn } from "@/lib/utils";
import { DASHBOARD_PATH } from "@/lib/utils/app-routes";

export function MagicLinkForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const tValidation = useTranslations("authentication.validation");
  const magicLinkSchema = z.object({
    email: z.email(tValidation("emailInvalid")),
  });

  const form = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof magicLinkSchema>) => {
    await authClient.signIn.magicLink(
      {
        email: data.email,
        callbackURL: DASHBOARD_PATH,
      },
      {
        onSuccess: () => {
          toast.success("Magic link sent! Check your email.");
        },
        onError: (c) => {
          toast.error(c.error.message || "Failed to send magic link");
        },
      },
    );
  };

  return (
    <Card>
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <MailIcon className="size-8 text-primary" />
          </div>
          <CardTitle className="space-y-2">
            <h1 className="font-bold text-2xl">Sign in with magic link</h1>
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a magic link to sign in.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FormField
            control={form.control}
            id="email"
            inputProps={{
              disabled: form.formState.isSubmitting,
            }}
            label="Email"
            name="email"
            placeholder="m@example.com"
            type="email"
          />
        </CardContent>

        <CardFooter>
          <div className="w-full">
            <Button
              className="w-full"
              disabled={form.formState.isSubmitting}
              type="submit"
              variant="default"
            >
              {form.formState.isSubmitting ? "Sending..." : "Send magic link"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
