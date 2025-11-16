"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type * as z from "zod";
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
import { magicLinkSchema } from "@/lib/better-auth/schemas";
import { cn } from "@/lib/utils";

export function MagicLinkForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
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
        callbackURL: "/org/dashboard",
      },
      {
        onSuccess: () => {
          toast.success("Magic link sent! Check your email.");
        },
        onError: (c) => {
          toast.error(c.error.message || "Failed to send magic link");
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
            <h1 className="font-bold text-2xl">Sign in with magic link</h1>
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a magic link to sign in.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FormField
            name="email"
            control={form.control}
            label="Email"
            id="email"
            type="email"
            placeholder="m@example.com"
            inputProps={{ disabled: form.formState.isSubmitting }}
          />
        </CardContent>

        <CardFooter>
          <div className="w-full">
            <Button
              type="submit"
              variant="default"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting ? "Sending..." : "Send magic link"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
