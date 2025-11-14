"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogInIcon } from "lucide-react";
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

const formSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onError: (c) => {
          if (c.error.code === "EMAIL_NOT_VERIFIED") {
            toast.error("Please verify your email address to continue");
            router.push(
              `/verify-email?email=${encodeURIComponent(data.email)}`,
            );
            return;
          }
          toast.error(c.error.message || "Failed to sign in");
        },
        onSuccess: () => {
          router.push("/org/dashboard");
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
            <LogInIcon className="size-8 text-primary" />
          </div>
          <CardTitle className="space-y-2">
            <h1 className="font-bold text-2xl">Sign in to your account</h1>
          </CardTitle>
          <CardDescription>
            Enter your credentials below to sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup className="gap-6">
            <FormField
              name="email"
              control={form.control}
              label="Email"
              id="email"
              type="email"
              placeholder="m@example.com"
              inputProps={{ disabled: form.formState.isSubmitting }}
            />
            <FormField
              name="password"
              control={form.control}
              label="Password"
              id="password"
              type="password"
              rightLabel={
                <button
                  type="button"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                  onClick={() => {
                    // TODO: Implement forgot password functionality
                  }}
                >
                  Forgot your password?
                </button>
              }
              inputProps={{ disabled: form.formState.isSubmitting }}
            />

            <FieldSeparator className="my-4 font-bold">
              Or continue with
            </FieldSeparator>

            <SocialButtons disabled={form.formState.isSubmitting} />
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <div className="w-full">
            <Field>
              <Button
                type="submit"
                variant="default"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Signing in..." : "Login"}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Button variant="link" className="px-0 pl-1" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </FieldDescription>
            </Field>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
