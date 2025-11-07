"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import SocialButtons from "@/components/auth/social-buttons";
import FormField from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { authClient } from "@/lib/better-auth/auth-client";
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
              `/verify-email?email=${encodeURIComponent(data.email)}`
            );
            return;
          }
          toast.error(c.error.message || "Failed to sign in");
        },
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-bold text-2xl">Login to your account</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Enter your email below to login to your account
          </p>
        </div>
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
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
        <FieldSeparator className="my-4 font-bold">
          Or continue with
        </FieldSeparator>

        <SocialButtons disabled={form.formState.isSubmitting} />
      </FieldGroup>
    </form>
  );
}
