"use client";

import { DASHBOARD_PATH } from "@/app/routes";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

/**
 * Renders a magic-link sign-in form that validates an email and sends a magic link to the provided address.
 *
 * @param className - Optional className applied to the outer form element
 * @param props - Additional native form element props forwarded to the form
 * @returns The rendered JSX form for requesting a magic link sign-in
 */
export function MagicLinkForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const tValidation = useTranslations("authentication.validation");
  const t = useTranslations("authentication");
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
          toast.success(t("login.magicLinkSent"));
        },
        onError: (c) => {
          toast.error(c.error.message || t("login.failedMagicLink"));
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
            <h1 className="text-2xl font-bold">{t("magicLink.title")}</h1>
          </CardTitle>
          <CardDescription>{t("magicLink.description")}</CardDescription>
        </CardHeader>

        <CardContent>
          <FormField
            control={form.control}
            id="email"
            inputProps={{
              disabled: form.formState.isSubmitting,
            }}
            label={t("login.email")}
            name="email"
            placeholder={t("common.emailPlaceholder")}
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
              {form.formState.isSubmitting
                ? t("common.sending")
                : t("login.sendMagicLink")}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
