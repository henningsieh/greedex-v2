"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { authClient } from "@/lib/better-auth/auth-client";
import { findAvailableSlug } from "@/lib/utils";

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

interface CreateOrganizationFormProps {
  onSuccess?: () => void;
}

export default function CreateOrganizationForm({
  onSuccess,
}: CreateOrganizationFormProps) {
  const router = useRouter();

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: CreateOrganizationInput) {
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
            router.push("/dashboard");
            router.refresh();
          },
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create organization";
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
        <h1 className="font-bold text-3xl">Create Your Organization</h1>
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
            type="button"
            onClick={handleSubmit}
            className="w-full"
            disabled={form.formState.isSubmitting || !form.watch("name")}
          >
            {form.formState.isSubmitting
              ? "Creating..."
              : "Create Organization"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
