"use client";

import { DASHBOARD_PATH } from "@/app/routes";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { findAvailableSlug } from "@/features/organizations/utils";
import { OrganizationFormSchema } from "@/features/organizations/validation-schemas";
import { authClient } from "@/lib/better-auth/auth-client";
import { useRouter } from "@/lib/i18n/routing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

interface CreateOrganizationFormProps {
  onSuccess?: () => void;
}

export function CreateOrganizationForm({
  onSuccess,
}: CreateOrganizationFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof OrganizationFormSchema>>({
    resolver: zodResolver(OrganizationFormSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: z.infer<typeof OrganizationFormSchema>) {
    try {
      // Find an available slug automatically
      const availableSlug = await findAvailableSlug(data.name);

      await authClient.organization.create(
        {
          name: data.name,
          slug: availableSlug,
        },
        {
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to create organization");
          },
          onSuccess: async (ctx) => {
            toast.success("Organization created successfully!");

            await authClient.organization.setActive({
              organizationId: ctx.data.id,
            });
            onSuccess?.();
            router.push(DASHBOARD_PATH);
            router.refresh();
          },
        },
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create organization";
      toast.error(errorMessage);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create Your Organization</h1>
        <p className="text-muted-foreground">
          Get started by creating your first organization
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="My Organization"
                    {...field}
                    disabled={form.formState.isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-full"
            disabled={form.formState.isSubmitting || !form.watch("name")}
            onClick={handleSubmit}
            type="button"
          >
            {form.formState.isSubmitting ? "Creating..." : "Create Organization"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
