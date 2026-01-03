"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { DatePickerWithInput } from "@/components/date-picker-with-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_VALUES,
  DISTANCE_KM_STEP,
  MIN_DISTANCE_KM,
} from "@/config/activities";
import type { ProjectActivityType } from "@/features/project-activities";
import {
  CreateActivityInputSchema,
  type UpdateActivityInputSchema,
} from "@/features/project-activities";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { PROJECT_ACTIVITIES_ICONS } from "./activities-icons";

interface ProjectActivityFormProps {
  projectId: string;
  activity?: ProjectActivityType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Render a form for creating a new project activity or editing an existing one.
 *
 * Prefills fields when an existing activity is provided, performs create or update
 * operations on submit, invokes optional callbacks, and disables submission while a mutation is pending.
 *
 * @param projectId - ID of the project the activity belongs to
 * @param activity - Optional existing activity to prefill the form for editing
 * @param onSuccess - Optional callback invoked after a successful create or update
 * @param onCancel - Optional callback invoked when the cancel action is triggered
 * @returns The component's rendered form element
 */
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
  } = useForm<z.infer<typeof CreateActivityInputSchema>>({
    resolver: zodResolver(CreateActivityInputSchema),
    mode: "onChange",
    defaultValues: {
      projectId,
      activityType: activity?.activityType ?? undefined,
      distanceKm: activity?.distanceKm
        ? Number.parseFloat(activity.distanceKm)
        : MIN_DISTANCE_KM,
      description: activity?.description ?? null,
      activityDate: activity?.activityDate ?? null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: z.infer<typeof CreateActivityInputSchema>) =>
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
    mutationFn: (values: z.infer<typeof UpdateActivityInputSchema>) => {
      if (!activity?.id) {
        throw new Error("Activity ID is required for update");
      }
      return orpc.projectActivities.update({
        id: activity.id,
        data: values,
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

  /**
   * Submit validated activity input to create a new project activity or update an existing one.
   *
   * @param values - Activity input validated against `CreateActivityInputSchema`
   */
  async function onSubmit(values: z.infer<typeof CreateActivityInputSchema>) {
    if (isEditing) {
      const { projectId: _, ...updateValues } = values;
      await updateMutation.mutateAsync(updateValues);
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  const buttonText = (() => {
    if (isPending) {
      return isEditing ? t("form.updating") : t("form.adding");
    }
    return isEditing ? t("form.update") : t("form.submit");
  })();

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
                    {ACTIVITY_VALUES.map((type) => {
                      const Icon = PROJECT_ACTIVITIES_ICONS[type];
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {t(`types.${type}`)}
                          </div>
                        </SelectItem>
                      );
                    })}
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
                  min={MIN_DISTANCE_KM}
                  onChange={(e) =>
                    field.onChange(
                      Number.parseFloat(e.target.value) || MIN_DISTANCE_KM,
                    )
                  }
                  placeholder={t("form.distance-placeholder")}
                  step={DISTANCE_KM_STEP}
                  type="number"
                  value={field.value ?? ""}
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
                onChange={field.onChange}
                value={field.value ?? undefined}
              />
            )}
          />
        </Field>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              className="flex-1"
              onClick={onCancel}
              size="sm"
              type="button"
              variant="secondaryoutline"
            >
              {t("form.cancel")}
            </Button>
          )}
          <Button
            className="flex-1"
            disabled={isPending}
            size="sm"
            type="submit"
            variant="secondary"
          >
            {buttonText}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
