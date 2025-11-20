"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import SocialButtons from "@/components/features/authentication/social-buttons";
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
import { authClient } from "@/lib/better-auth/auth-client";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

const createFormSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(1, t("fullNameRequired")),
      email: z.email(t("emailInvalid")),
      password: z.string().min(8, t("passwordMinLength")),
      confirmPassword: z.string().min(1, t("passwordConfirmRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsNoMatch"),
      path: ["confirmPassword"],
    });

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const tValidation = useTranslations("authentication.validation");
  const t = useTranslations("authentication.signup");

  const formSchema = createFormSchema(tValidation);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
      },
      {
        onError: (c) => {
          toast.error(c.error.message || t("messages.failedCreate"));
        },
        onSuccess: () => {
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
            <h1 className="font-bold text-2xl">{t("title")}</h1>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <FieldGroup className="gap-4">
            <FormField
              name="name"
              control={form.control}
              label={t("fields.fullName")}
              id="name"
              type="text"
              placeholder={t("fields.fullNamePlaceholder")}
              inputProps={{ disabled: form.formState.isSubmitting }}
            />
            <FormField
              name="email"
              control={form.control}
              label={t("fields.email")}
              id="email"
              type="email"
              placeholder={t("fields.emailPlaceholder")}
              description={t("fields.emailDescription")}
              inputProps={{ disabled: form.formState.isSubmitting }}
            />
            <FormField
              name="password"
              control={form.control}
              label={t("fields.password")}
              id="password"
              type="password"
              description={t("fields.passwordDescription")}
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
              type="submit"
              disabled={form.formState.isSubmitting}
              className="mt-2"
            >
              {form.formState.isSubmitting
                ? t("buttons.creatingAccount")
                : t("buttons.createAccount")}
            </Button>
          </FieldGroup>
        </CardContent>

        <CardFooter className="px-0">
          <div className="w-full">
            <Field>
              <FieldDescription className="px-6 text-center font-bold">
                {t("footer.haveAccount")}
                <Button variant="link" className="px-0 pl-1" asChild>
                  <Link href="/login">{t("footer.signIn")}</Link>
                </Button>
              </FieldDescription>

              <FieldSeparator className="my-4 font-bold">
                {t("footer.orContinueWith")}
              </FieldSeparator>

              <SocialButtons disabled={form.formState.isSubmitting} />
            </Field>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
