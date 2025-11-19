"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
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
import { Link, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

const createFormSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z.string().min(8, t("validation.passwordMinLength")),
      confirmPassword: z
        .string()
        .min(1, t("validation.passwordConfirmRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsNoMatch"),
      path: ["confirmPassword"],
    });

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  token: string;
}

export function ResetPasswordForm({
  token,
  className,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter();
  const t = useTranslations("authentication.resetPassword");
  const tValidation = useTranslations("authentication.validation");

  const formSchema = createFormSchema(tValidation);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await authClient.resetPassword(
      {
        newPassword: data.password,
        token,
      },
      {
        onSuccess: () => {
          toast.success(t("messages.resetSuccess"));
          router.push("/login");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || t("messages.resetFailed"));
        },
      },
    );
  };

  return (
    <Card className="mx-auto max-w-lg p-4 sm:p-8 md:p-12">
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <CardHeader className="flex flex-col items-center gap-4 px-0 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <LockIcon className="size-8 text-primary" />
          </div>
          <CardTitle className="space-y-2">
            <h1 className="font-bold text-2xl">{t("title")}</h1>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-4">
              <FormField
                name="password"
                control={form.control}
                label={t("fields.newPassword")}
                id="password"
                type="password"
                description={t("fields.newPasswordDescription")}
                inputProps={{ disabled: form.formState.isSubmitting }}
              />
              <FormField
                name="confirmPassword"
                control={form.control}
                label={t("fields.confirmPassword")}
                id="confirm-password"
                type="password"
                description={t("fields.confirmPasswordDescription")}
                inputProps={{ disabled: form.formState.isSubmitting }}
              />

              <Button
                className="mt-2"
                type="submit"
                variant="default"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? t("buttons.resetting")
                  : t("buttons.resetPassword")}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="px-0">
          <div className="w-full text-center">
            <Button variant="link" className="px-0" asChild>
              <Link href="/login">{t("buttons.backToLogin")}</Link>
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
