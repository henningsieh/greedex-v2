"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DatePickerWithInput } from "@/components/date-picker-with-input";
import type { ProjectType } from "@/components/features/projects/types";
import {
  ProjectFormSchema,
  type ProjectFormSchemaType,
} from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

interface EditProjectFormProps {
  project: ProjectType;
  onSuccess?: () => void;
}

function EditProjectForm({ project, onSuccess }: EditProjectFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormSchemaType>({
    resolver: zodResolver(ProjectFormSchema),
    mode: "onChange",
    defaultValues: {
      name: project.name,
      startDate: project.startDate,
      endDate: project.endDate,
      location: project.location,
      country: project.country,
      welcomeMessage: project.welcomeMessage,
      organizationId: project.organizationId,
    },
  });

  const queryClient = useQueryClient();

  const { mutateAsync: updateProjectMutation, isPending } = useMutation({
    mutationFn: (data: ProjectFormSchemaType) =>
      orpc.project.update({
        id: project.id,
        data,
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Project updated successfully");
        onSuccess?.();
      } else {
        toast.error("Failed to update project");
      }
      // Invalidate project list and specific project
      queryClient.invalidateQueries({
        queryKey: orpcQuery.project.list.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: orpcQuery.project.getById.queryOptions({
          input: {
            id: project.id,
          },
        }).queryKey,
      });
    },
    onError: (err: unknown) => {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "An error occurred");
    },
  });

  async function onSubmit(values: ProjectFormSchemaType) {
    console.debug("Updating project:", values);
    await updateProjectMutation(values);
  }

  return (
    <div>
      <Toaster />

      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.error("Form validation errors:", errors);
          toast.error("Please fix the form errors before submitting");
        })}
      >
        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Project Name</FieldLabel>
            <Input id="name" {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.startDate}>
              <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePickerWithInput
                    id="startDate"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[errors.startDate]} />
            </Field>

            <Field data-invalid={!!errors.endDate}>
              <FieldLabel htmlFor="endDate">End Date</FieldLabel>
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePickerWithInput
                    id="endDate"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[errors.endDate]} />
            </Field>
          </div>

          <Field data-invalid={!!errors.country}>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input id="country" {...register("country")} />
            <FieldError errors={[errors.country]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="location">Location (optional)</FieldLabel>
            <Input id="location" {...register("location")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="welcomeMessage">
              Welcome Message (optional)
            </FieldLabel>
            <Textarea id="welcomeMessage" {...register("welcomeMessage")} />
          </Field>

          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? "Updating..." : "Update Project"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}

export default EditProjectForm;
