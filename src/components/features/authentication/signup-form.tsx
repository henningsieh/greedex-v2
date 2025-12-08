"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { normalizeRedirectPath } from "@/components/features/authentication/auth-flow-layout";
import { SocialButtons } from "@/components/features/authentication/social-buttons";
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { env } from "@/env";
import { authClient } from "@/lib/better-auth/auth-client";
import { DASHBOARD_PATH, LOGIN_PATH } from "@/lib/config/AppRoutes";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function SignupForm({
  className,
  nextPageUrl,
  ...props
}: React.ComponentProps<"form"> & {
  nextPageUrl?: string | string[];
}) {
  const t = useTranslations("authentication");
  const router = useRouter();

  const formSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(1, t("validation.fullNameRequired")),
          email: z.email(t("validation.emailInvalid")),
          password: z.string().min(6, t("validation.passwordMinLength")),
          confirmPassword: z
            .string()
            .min(1, t("validation.passwordConfirmRequired")),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("validation.passwordsNoMatch"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const finalRedirect =
    env.NEXT_PUBLIC_BASE_URL + normalizeRedirectPath(nextPageUrl, DASHBOARD_PATH);

  console.debug("SignupForm onSubmit finalRedirect:", finalRedirect);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: finalRedirect,
      },
      {
        onError: (c) => {
          toast.error(c.error.message || t("signup.messages.failedCreate"));
        },
        onSuccess: () => {
          toast.success("Please check your email to verify your account.");
          // Redirect to verify email page after successful signup
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        },
      },
    );
  };

  return (
    <Card className="p-4 sm:p-8 md:p-12">
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <CardHeader className="flex flex-col items-center gap-4 px-0 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="size-8 text-primary" />
          </div>
          <CardTitle className="space-y-2">
            <h1 className="font-bold text-2xl">{t("signup.title")}</h1>
          </CardTitle>
          <CardDescription>{t("signup.description")}</CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <FieldGroup className="gap-4">
            <FormField
              name="name"
              control={form.control}
              label={t("signup.fields.fullName")}
              id="name"
              type="text"
              placeholder={t("signup.fields.fullNamePlaceholder")}
              inputProps={{
                disabled: form.formState.isSubmitting,
              }}
            />
            <FormField
              name="email"
              control={form.control}
              label={t("signup.fields.email")}
              id="email"
              type="email"
              placeholder={t("signup.fields.emailPlaceholder")}
              description={t("signup.fields.emailDescription")}
              inputProps={{
                disabled: form.formState.isSubmitting,
              }}
            />
            <FormField
              name="password"
              control={form.control}
              label={t("signup.fields.password")}
              id="password"
              type="password"
              description={t("signup.fields.passwordDescription")}
              inputProps={{
                disabled: form.formState.isSubmitting,
              }}
            />
            <FormField
              name="confirmPassword"
              control={form.control}
              label={t("signup.fields.confirmPassword")}
              id="confirm-password"
              type="password"
              description={t("signup.fields.confirmPasswordDescription")}
              inputProps={{
                disabled: form.formState.isSubmitting,
              }}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="mt-2"
            >
              {form.formState.isSubmitting
                ? t("signup.buttons.creatingAccount")
                : t("signup.buttons.createAccount")}
            </Button>
          </FieldGroup>
        </CardContent>

        <CardFooter className="px-0">
          <div className="w-full">
            <Field>
              <FieldDescription className="px-6 text-center font-bold">
                {t("signup.footer.haveAccount")}
                <Button variant="link" className="px-0 pl-1" asChild>
                  <Link href={LOGIN_PATH}>{t("signup.footer.signIn")}</Link>
                </Button>
              </FieldDescription>

              <FieldSeparator className="my-4 font-bold">
                {t("signup.footer.orContinueWith")}
              </FieldSeparator>

              <SocialButtons disabled={form.formState.isSubmitting} />
            </Field>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
