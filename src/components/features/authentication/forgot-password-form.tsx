"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
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
import { FieldGroup } from "@/components/ui/field";
import { authClient } from "@/lib/better-auth/auth-client";
import { LOGIN_PATH, RESET_PASSWORD_PATH } from "@/lib/config/AppRoutes";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("authentication");

  const formSchema = useMemo(
    () =>
      z.object({
        email: z.email(t("validation.emailInvalid")),
      }),
    [t],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await authClient.requestPasswordReset(
      {
        email: data.email,
        redirectTo: RESET_PASSWORD_PATH,
      },
      {
        onSuccess: () => {
          toast.success(t("forgotPassword.messages.resetLinkSent"));
          form.reset();
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || t("forgotPassword.messages.failedSend"),
          );
        },
      },
    );
  };

  return (
    <Card className="p-4 sm:p-8 md:p-12">
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <CardHeader className="flex flex-col items-center gap-4 px-0 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <KeyRoundIcon className="size-8 text-primary" />
          </div>
          <CardTitle className="space-y-2">
            <h1 className="font-bold text-2xl">{t("forgotPassword.title")}</h1>
          </CardTitle>
          <CardDescription>{t("forgotPassword.description")}</CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-4">
              <FormField
                name="email"
                control={form.control}
                label={t("forgotPassword.fields.email")}
                id="email"
                type="email"
                placeholder={t("forgotPassword.fields.emailPlaceholder")}
                inputProps={{
                  disabled: form.formState.isSubmitting,
                }}
              />

              <Button
                className="mt-2"
                type="submit"
                variant="default"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? t("forgotPassword.buttons.sending")
                  : t("forgotPassword.buttons.sendResetLink")}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="px-0">
          <div className="w-full text-center">
            <Button variant="link" className="px-0" asChild>
              <Link href={LOGIN_PATH}>
                {t("forgotPassword.buttons.backToLogin")}
              </Link>
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
