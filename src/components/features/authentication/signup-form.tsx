"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
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
            <UserPlus className="size-8 text-primary" />
          </div>
          <CardTitle className="space-y-2">
            <h1 className="font-bold text-2xl">Create your account</h1>
          </CardTitle>
          <CardDescription>
            Fill in the form below to create your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup className="gap-6">
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

            <FieldSeparator className="my-4 font-bold">
              Or continue with
            </FieldSeparator>

            <SocialButtons disabled={form.formState.isSubmitting} />
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <div className="w-full">
            <Field>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
              <FieldDescription className="px-6 text-center font-bold">
                Already have an account?{" "}
                <Button variant="link" className="px-0 pl-1" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </FieldDescription>
            </Field>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
