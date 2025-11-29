"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogInIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { normalizeRedirectPath } from "@/components/features/authentication/auth-flow-layout";
import { LastUsedBadge } from "@/components/features/authentication/last-used-badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  DASHBOARD_PATH,
  FORGOT_PASSWORD_PATH,
  SIGNUP_PATH,
} from "@/lib/config/app";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  nextPageUrl,
  ...props
}: React.ComponentProps<"div"> & {
  nextPageUrl?: string | string[];
}) {
  const [lastLoginMethod, setLastLoginMethod] = useState<string | null>(null);

  const router = useRouter();
  const t = useTranslations("authentication");

  // append the callbackUrl to the env
  const finalRedirect = normalizeRedirectPath(nextPageUrl, DASHBOARD_PATH);
  const callbackURL = env.NEXT_PUBLIC_BASE_URL + finalRedirect;

  // Get last login method on component mount
  useEffect(() => {
    const method = authClient.getLastUsedLoginMethod();
    setLastLoginMethod(method);
  }, []);

  const credentialsSchema = useMemo(
    () =>
      z.object({
        email: z.email(t("validation.emailInvalid")),
        password: z.string().min(6, t("validation.passwordRequired")),
      }),
    [t],
  );
  const magicLinkSchema = useMemo(
    () =>
      z.object({
        email: z.email(t("validation.emailInvalid")),
      }),
    [t],
  );

  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof credentialsSchema>) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL,
      },
      {
        onError: (c) => {
          if (c.error.code === "EMAIL_NOT_VERIFIED") {
            toast.error("messages.verifyEmail");
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
            return;
          }
          toast.error(c.error.message || t("login.messages.failedSignIn"));
        },
      },
    );
  };

  const onMagicLinkSubmit = async (data: z.infer<typeof magicLinkSchema>) => {
    await authClient.signIn.magicLink(
      {
        email: data.email,
        callbackURL,
      },
      {
        onSuccess: () => {
          toast.success(t("login.messages.magicLinkSent"));
        },
        onError: (c) => {
          toast.error(c.error.message || t("login.messages.failedMagicLink"));
        },
      },
    );
  };

  return (
    <Card className="p-4 sm:p-8 md:p-12">
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <CardHeader className="flex flex-col items-center gap-4 px-0 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <LogInIcon className="size-8 text-primary" />
          </div>
          <CardTitle className="space-y-2">
            <h1 className="font-bold text-2xl">{t("login.title")}</h1>
          </CardTitle>
          <CardDescription>{t("login.description")}</CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          {/* Badges are positioned absolute within the relative containers in the top right */}
          <Tabs defaultValue="password" className="w-full space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger className="relative" value="password">
                {t("login.tabs.password")}
                {(lastLoginMethod === "email" ||
                  lastLoginMethod === "credential") && (
                  <LastUsedBadge className="-left-8" />
                )}
              </TabsTrigger>
              <TabsTrigger className="relative" value="magic-link">
                {t("login.tabs.magicLink")}
                {lastLoginMethod === "magic-link" && <LastUsedBadge />}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup className="">
                  <FormField
                    name="email"
                    control={form.control}
                    id="email"
                    type="email"
                    label={t("login.fields.email")}
                    placeholder={t("login.fields.emailPlaceholder")}
                    inputProps={{
                      disabled: form.formState.isSubmitting,
                    }}
                  />
                  <FormField
                    name="password"
                    control={form.control}
                    id="password"
                    type="password"
                    label={t("login.fields.password")}
                    rightLabel={
                      <Button variant="link" className="px-0" asChild>
                        <Link
                          href={FORGOT_PASSWORD_PATH}
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          {t("login.fields.forgotPassword")}
                        </Link>
                      </Button>
                    }
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
                      ? t("login.buttons.signingIn")
                      : t("login.buttons.login")}
                  </Button>
                </FieldGroup>
              </form>
            </TabsContent>
            <TabsContent value="magic-link">
              <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}>
                <FieldGroup className="gap-4">
                  <FormField
                    name="email"
                    control={magicLinkForm.control}
                    label={t("login.fields.email")}
                    id="magic-email"
                    type="email"
                    placeholder={t("login.fields.emailPlaceholder")}
                    inputProps={{
                      disabled: magicLinkForm.formState.isSubmitting,
                    }}
                  />

                  <Button
                    className="mt-2"
                    type="submit"
                    variant="default"
                    disabled={magicLinkForm.formState.isSubmitting}
                  >
                    {magicLinkForm.formState.isSubmitting
                      ? t("login.buttons.sending")
                      : t("login.buttons.sendMagicLink")}
                  </Button>
                </FieldGroup>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="px-0">
          <div className="w-full">
            <Field>
              <FieldDescription className="px-6 text-center font-bold">
                {t("login.footer.noAccount")}
                {(() => {
                  let signupHref = `${SIGNUP_PATH}`;
                  if (nextPageUrl) {
                    const normalized = normalizeRedirectPath(
                      nextPageUrl,
                      DASHBOARD_PATH,
                    );
                    signupHref += `?nextPageUrl=${encodeURIComponent(
                      normalized,
                    )}`;
                  }
                  return (
                    <Button variant="link" className="px-0 pl-1" asChild>
                      <Link href={signupHref}>{t("login.footer.signUp")}</Link>
                    </Button>
                  );
                })()}
              </FieldDescription>

              <FieldSeparator className="my-4 font-bold">
                {t("login.footer.orContinueWith")}
              </FieldSeparator>

              <SocialButtons
                disabled={form.formState.isSubmitting}
                callbackUrl={callbackURL}
                lastLoginMethod={lastLoginMethod}
              />
            </Field>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
