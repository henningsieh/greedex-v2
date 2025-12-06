"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { DatePickerWithInput } from "@/components/date-picker-with-input";
import {
  activityTypeValues,
  type ProjectActivityType,
} from "@/components/features/projects/types";
import { ProjectActivityFormSchema } from "@/components/features/projects/validation-schemas";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

interface ProjectActivityFormProps {
  projectId: string;
  activity?: ProjectActivityType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectActivityForm({
  projectId,
  activity,
  onSuccess,
  onCancel,
}: ProjectActivityFormProps) {
  const t = useTranslations("project.activities");
  const queryClient = useQueryClient();
  const isEditing = !!activity;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof ProjectActivityFormSchema>>({
    resolver: zodResolver(ProjectActivityFormSchema),
    mode: "onChange",
    defaultValues: {
      projectId,
      activityType: activity?.activityType ?? undefined,
      distanceKm: activity?.distanceKm ? parseFloat(activity.distanceKm) : 0,
      description: activity?.description ?? null,
      activityDate: activity?.activityDate ?? null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: z.infer<typeof ProjectActivityFormSchema>) =>
      orpc.projectActivities.create(values),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t("toast.create-success"));
        reset();
        queryClient.invalidateQueries({
          queryKey: orpcQuery.projectActivities.list.queryKey({
            input: { projectId },
          }),
        });
        onSuccess?.();
      } else {
        toast.error(t("toast.create-error"));
      }
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error(t("toast.create-error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof ProjectActivityFormSchema>) => {
      if (!activity?.id) {
        throw new Error("Activity ID is required for update");
      }
      return orpc.projectActivities.update({
        id: activity.id,
        data: {
          activityType: values.activityType,
          distanceKm: values.distanceKm,
          description: values.description,
          activityDate: values.activityDate,
        },
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t("toast.update-success"));
        queryClient.invalidateQueries({
          queryKey: orpcQuery.projectActivities.list.queryKey({
            input: { projectId },
          }),
        });
        onSuccess?.();
      } else {
        toast.error(t("toast.update-error"));
      }
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error(t("toast.update-error"));
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: z.infer<typeof ProjectActivityFormSchema>) {
    if (isEditing) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.activityType}>
            <FieldLabel htmlFor="activityType">
              {t("form.activity-type")}
            </FieldLabel>
            <Controller
              control={control}
              name="activityType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="activityType">
                    <SelectValue
                      placeholder={t("form.activity-type-placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypeValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.activityType]} />
          </Field>

          <Field data-invalid={!!errors.distanceKm}>
            <FieldLabel htmlFor="distanceKm">{t("form.distance")}</FieldLabel>
            <Controller
              control={control}
              name="distanceKm"
              render={({ field }) => (
                <Input
                  id="distanceKm"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("form.distance-placeholder")}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                />
              )}
            />
            <FieldError errors={[errors.distanceKm]} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="description">{t("form.description")}</FieldLabel>
          <Textarea
            id="description"
            placeholder={t("form.description-placeholder")}
            {...register("description")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="activityDate">
            {t("form.activity-date")}
          </FieldLabel>
          <Controller
            control={control}
            name="activityDate"
            render={({ field }) => (
              <DatePickerWithInput
                id="activityDate"
                value={field.value ?? undefined}
                onChange={field.onChange}
              />
            )}
          />
        </Field>

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending} size="sm">
            {isPending
              ? isEditing
                ? t("form.updating")
                : t("form.adding")
              : isEditing
                ? t("form.update")
                : t("form.submit")}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              {t("form.cancel")}
            </Button>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
