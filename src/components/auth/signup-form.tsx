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

const formSchema = z
  .object({
    name: z.string().min(1, "Full name is required."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

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
          toast.error(c.error.message || "Failed to create account");
        },
        onSuccess: () => {
          // Redirect to verify email page after successful signup
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
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
          <h1 className="font-bold text-2xl">Create your account</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Fill in the form below to create your account
          </p>
        </div>
        <FormField
          name="name"
          control={form.control}
          label="Full Name"
          id="name"
          type="text"
          placeholder="John Doe"
          inputProps={{ disabled: form.formState.isSubmitting }}
        />
        <FormField
          name="email"
          control={form.control}
          label="Email"
          id="email"
          type="email"
          placeholder="m@example.com"
          description={
            "We'll use this to contact you. We will not share your email with anyone else."
          }
          inputProps={{ disabled: form.formState.isSubmitting }}
        />
        <FormField
          name="password"
          control={form.control}
          label="Password"
          id="password"
          type="password"
          description={"Must be at least 8 characters long."}
          inputProps={{ disabled: form.formState.isSubmitting }}
        />
        <FormField
          name="confirmPassword"
          control={form.control}
          label="Confirm Password"
          id="confirm-password"
          type="password"
          description={"Please confirm your password."}
          inputProps={{ disabled: form.formState.isSubmitting }}
        />
        <Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Creating Account..."
              : "Create Account"}
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Sign in
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
