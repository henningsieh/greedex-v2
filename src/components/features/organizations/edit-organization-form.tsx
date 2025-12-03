"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { EditOrganizationFormSchema } from "@/components/features/organizations/validation-schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/better-auth/auth-client";
import { orpcQuery } from "@/lib/orpc/orpc";
import { findAvailableSlug } from "@/lib/utils";

export default function EditOrganizationForm() {
  const queryClient = useQueryClient();
  const { data: organization } = useSuspenseQuery(
    orpcQuery.organizations.getActive.queryOptions(),
  );

  const form = useForm<z.infer<typeof EditOrganizationFormSchema>>({
    resolver: zodResolver(EditOrganizationFormSchema),
    defaultValues: {
      name: organization?.name || "",
    },
  });

  async function onSubmit(data: z.infer<typeof EditOrganizationFormSchema>) {
    if (!organization) {
      toast.error("No organization found");
      return;
    }

    try {
      let slugToUse = organization.slug;

      // If name changed, find a new available slug
      if (data.name !== organization.name) {
        slugToUse = await findAvailableSlug(data.name);
      }

      await authClient.organization.update(
        {
          organizationId: organization.id,
          data: {
            name: data.name,
            slug: slugToUse,
          },
        },
        {
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to update organization");
          },
          onSuccess: () => {
            toast.success("Organization updated successfully!");
            queryClient.invalidateQueries(
              orpcQuery.organizations.list.queryOptions(),
            );
            queryClient.invalidateQueries(
              orpcQuery.organizations.getActive.queryOptions(),
            );
          },
        },
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update organization";
      toast.error(errorMessage);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  if (!organization) {
    return <EditOrganizationFormSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Organization</CardTitle>
        <CardDescription>Update your organization's name.</CardDescription>
      </CardHeader>
      <CardContent>
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Updating..."
                : "Update Organization"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

export function EditOrganizationFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64" />
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          <Skeleton className="h-10 w-40" />
        </div>
      </CardContent>
    </Card>
  );
}
